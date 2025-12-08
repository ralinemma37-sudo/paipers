import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { email, historyId } = await req.json();

    console.log("PROCESS-EMAIL:", { email, historyId });

    // 1) Récupérer la connexion Gmail
    const { data: connection } = await supabase
      .from("gmail_connections")
      .select("*")
      .eq("email", email)
      .single();

    if (!connection) {
      return NextResponse.json(
        { error: "gmail connection not found" },
        { status: 400 }
      );
    }

    // 2) OAuth2 Gmail
    const oauth2 = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID!,
      process.env.GOOGLE_CLIENT_SECRET!,
      process.env.GOOGLE_REDIRECT_URI!
    );

    oauth2.setCredentials({
      access_token: connection.access_token,
      refresh_token: connection.refresh_token,
    });

    const gmail = google.gmail({ version: "v1", auth: oauth2 });

    // 3) Histoire Gmail → messages récents
    const history = await gmail.users.history.list({
      userId: "me",
      startHistoryId: connection.history_id || historyId,
    });

    const historyItems = history.data.history || [];

    if (historyItems.length === 0) {
      return NextResponse.json({ status: "no new messages" });
    }

    // 4) Dernier message
    const messageId = historyItems[0]?.messages?.[0]?.id;

    if (!messageId) {
      return NextResponse.json({ error: "no message id" }, { status: 400 });
    }

    const message = await gmail.users.messages.get({
      userId: "me",
      id: messageId,
    });

    const parts = (message.data.payload?.parts as any[]) || [];
    const attachments = parts.filter(
      (p) => p?.filename && p?.body?.attachmentId
    );

    if (attachments.length === 0) {
      return NextResponse.json({ status: "no attachment" });
    }

    // 5) Boucle sur les pièces jointes
    for (const att of attachments) {
      const attRes = await gmail.users.messages.attachments.get({
        userId: "me",
        messageId,
        id: att.body.attachmentId,
      });

      if (!attRes.data.data) continue;

      const fileBuffer = Buffer.from(attRes.data.data, "base64");
      const filename = att.filename ?? "document.pdf";

      // === Stockage Supabase ===
      const storage_path = `${connection.user_id}/${Date.now()}-${filename}`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(storage_path, fileBuffer, {
          contentType: att.mimeType || "application/pdf",
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        continue;
      }

      // === Analyse IA ===
      const aiResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/ai/analyze-document`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename,
            storage_path,
          }),
        }
      );

      const aiData = await aiResponse.json();

      console.log("AI Response:", aiData);

      // === Insertion dans la table documents ===
      await supabase.from("documents").insert({
        user_id: connection.user_id,
        title: aiData.title ?? filename,
        original_filename: filename,
        storage_path,
        file_type: aiData.file_type ?? null,
        category: aiData.category ?? null,
        extracted_text: aiData.extracted_text ?? null,
        metadata: aiData.metadata ?? {},
        created_at: new Date().toISOString(),
      });
    }

    // 6) Mise à jour du dernier historyId
    await supabase
      .from("gmail_connections")
      .update({ history_id: historyId })
      .eq("email", email);

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("PROCESS EMAIL ERROR:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

