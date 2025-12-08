// @ts-nocheck
// supabase/functions/gmail-webhook/index.ts

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const APP_BASE_URL = "https://example.com"; 
// ⬆️ IMPORTANT : remplace ça par l'URL de ton site déployé, par ex : "https://paipers.vercel.app"

serve(async (req: Request) => {
  console.log(
    "[gmail-webhook] Requête reçue",
    new Date().toISOString(),
    "méthode:",
    req.method,
  );

  if (req.method !== "POST") {
    return new Response("gmail-webhook is running ✅", { status: 200 });
  }

  const bodyText = await req.text();
  console.log("[gmail-webhook] Corps de la requête (brut):", bodyText);

  try {
    const response = await fetch(`${APP_BASE_URL}/api/google/process-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: bodyText,
    });

    console.log(
      "[gmail-webhook] Réponse de /api/google/process-email:",
      response.status,
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "[gmail-webhook] Erreur côté /api/google/process-email:",
        errorText,
      );
      return new Response("Erreur interne", { status: 500 });
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("[gmail-webhook] Exception lors de l'appel vers l'API:", err);
    return new Response("Erreur interne", { status: 500 });
  }
});
