import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("gmail-webhook is running ✅", { status: 200 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRole) return new Response("Missing env", { status: 500 });

  const supabase = createClient(supabaseUrl, serviceRole);

  const bodyText = await req.text();
  console.log("[gmail-webhook] body:", bodyText);

  let body: any;
  try {
    body = JSON.parse(bodyText);
  } catch {
    console.log("[gmail-webhook] invalid JSON");
    return new Response("OK", { status: 200 });
  }

  const pubsubData = body?.message?.data;
  if (!pubsubData) {
    console.log("[gmail-webhook] missing message.data");
    return new Response("OK", { status: 200 });
  }

  let decoded: any;
  try {
    decoded = JSON.parse(atob(pubsubData));
  } catch {
    console.log("[gmail-webhook] cannot decode data");
    return new Response("OK", { status: 200 });
  }

  const emailAddress = decoded?.emailAddress as string | undefined;
  if (!emailAddress) {
    console.log("[gmail-webhook] missing emailAddress");
    return new Response("OK", { status: 200 });
  }

  // 1) trouver user_id via gmail_connections
  const { data: conn, error: connErr } = await supabase
    .from("gmail_connections")
    .select("user_id")
    .eq("email", emailAddress)
    .maybeSingle();

  if (connErr) {
    console.log("[gmail-webhook] gmail_connections error:", connErr.message);
    return new Response("OK", { status: 200 });
  }

  if (!conn?.user_id) {
    console.log("[gmail-webhook] no gmail_connection for:", emailAddress);
    return new Response("OK", { status: 200 });
  }

  // 2) anti-doublons : si une notif Gmail en attente existe déjà -> on ne crée pas une nouvelle
  const { data: existingPending, error: pendingErr } = await supabase
    .from("documents")
    .select("id")
    .eq("user_id", conn.user_id)
    .eq("source", "gmail")
    .eq("needs_review", true)
    .eq("is_ready", false)
    .limit(1);

  if (pendingErr) {
    console.log("[gmail-webhook] pending check error:", pendingErr.message);
    return new Response("OK", { status: 200 });
  }

  if (existingPending && existingPending.length > 0) {
    console.log("[gmail-webhook] pending already exists -> skip");
    return new Response("OK", { status: 200 });
  }

  // 3) créer une notif "générique" (sans IDs Gmail)
  const { error: insertErr } = await supabase.from("documents").insert({
    user_id: conn.user_id,
    title: "Document reçu depuis Gmail",
    original_filename: null,
    source: "gmail",
    category: null,
    needs_review: true,
    is_ready: false,
    file_path: null,
    gmail_email: emailAddress,
  });

  if (insertErr) {
    console.log("[gmail-webhook] insert documents error:", insertErr.message);
  } else {
    console.log("[gmail-webhook] ✅ notification created for user:", conn.user_id);
  }

  return new Response("OK", { status: 200 });
});

