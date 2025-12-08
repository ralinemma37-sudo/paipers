"use client";

import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/lib/supabase";

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="w-full max-w-md p-6 bg-gray-900 rounded-xl shadow-xl">
        <h1 className="text-3xl font-bold mb-6 text-center">Paipers</h1>
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: "#6366f1",
                  brandAccent: "#4f46e5",
                },
              },
            },
          }}
          providers={[]}
          theme="dark"
        />
      </div>
    </div>
  );
}
