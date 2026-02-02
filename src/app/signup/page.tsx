"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSignup = async (e: any) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const { error } = await supabase.auth.signUp({ email, password });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="px-6 py-12 max-w-md mx-auto">
      <h1 className="text-3xl font-bold text-center mb-2">Créer un compte</h1>

      <p className="text-slate-500 text-center mb-8">
        Bienvenue sur Paipers ✨
      </p>

      <form onSubmit={handleSignup} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Adresse email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-slate-300 bg-white rounded-xl py-3 px-4"
          required
        />

        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-slate-300 bg-white rounded-xl py-3 px-4"
          required
        />

        {errorMsg && (
          <p className="text-red-500 text-sm text-center">{errorMsg}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-full text-white font-medium bg-gradient-to-r from-[hsl(202_100%_82%)] via-[hsl(328_80%_84%)] to-[hsl(39_100%_85%)] shadow-md active:scale-95 transition"
        >
          {loading ? "Création..." : "Créer mon compte"}
        </button>
      </form>

      <p className="text-center mt-6 text-slate-600">
        Déjà un compte ?{" "}
        <Link href="/login" className="text-blue-600 font-medium">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
