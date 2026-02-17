import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

async function getAccessToken(refreshToken: string) {
  const client_id = Deno.env.get("GOOGLE_CLIENT_ID") || "";
  const client_secret = Deno.env.get("GOOGLE_CLIENT_SECRET") || "";

  if (!client_id || !client_secret) {
    throw new Error("Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in Supabase secrets");
  }

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id,
      client_secret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const json = await res.json();

  if (!res.ok) {
    // On log l'erreur exacte renvoyée par Google
    console.log("Google token endpoint error:", JSON.stringify(json));
    throw new Error(`Token error: ${res.status}`);
  }

  return json.access_token as string;
}

serve(async (req: Request) => {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    if (!supabaseUrl || !serviceRole) {
      return new Response("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY", { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRole);

    const { email } = await req.json();

    const { data: conn, error: connErr } = await supabase
      .from("gmail_connections")
      .select("refresh_token")
      .eq("email", email)
      .single();

    if (connErr) {
      console.log("DB error:", connErr);
      return new Response("DB error", { status: 500 });
    }

    if (!conn?.refresh_token) {
      return new Response("No refresh_token for this email", { status: 400 });
    }

    const accessToken = await getAccessToken(conn.refresh_token);

    const topicName = "projects/paipers/topics/paipers-gmail";

    const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/watch", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        topicName,
        labelIds: ["INBOX"],
      }),
    });

    const json = await res.json();

    if (!res.ok) {
      console.log("Gmail watch error:", JSON.stringify(json));
      return new Response("Watch failed", { status: 500 });
    }

    await supabase
      .from("gmail_connections")
      .update({ last_history_id: String(json.historyId) })
      .eq("email", email);

    return new Response("Watch started ✅", { status: 200 });
  } catch (e) {
    console.log("start-gmail-watch crash:", String(e));
    return new Response("Internal Server Error", { status: 500 });
  }
});
