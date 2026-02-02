import type { ReactNode } from "react";
import Link from "next/link";
import { Home, FileText, Bell, Shield, Leaf, Sparkles } from "lucide-react";

type FeatureCardProps = {
  icon: ReactNode;
  title: string;
  text: string;
};

export default function HomePage() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-white">
      {/* HERO */}
      <section className="pt-6 pb-12 px-6 bg-gradient-to-b from-[hsl(202_100%_95%)] via-white to-[hsl(328_80%_96%)]">
        {/* LOGO EN HAUT À GAUCHE */}
        <div className="w-full flex justify-between items-start">
          <img src="/logo-paipers.png" alt="Logo Paipers" className="w-20 h-auto" />

          <Link
            href="/login"
            className="text-sm font-medium text-slate-700 underline underline-offset-4"
          >
            Se connecter
          </Link>
        </div>

        {/* CONTENU CENTRAL */}
        <div className="text-center mt-4">
          <h1 className="text-4xl font-bold leading-tight mt-4">
            Votre coffre-fort administratif <br />
            <span className="gradient-text">intelligent</span>.
          </h1>

          <p className="text-slate-600 mt-6 max-w-md mx-auto">
            Centralisez, sécurisez et retrouvez tous vos documents importants en un clic.
            Paipers automatise votre gestion administrative pour vous faire gagner du temps.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3">
            <Link
              href="/signup"
              className="w-full max-w-xs py-3 rounded-full !text-white font-medium
                bg-gradient-to-r from-[hsl(202_100%_82%)] via-[hsl(328_80%_84%)] to-[hsl(39_100%_85%)]
                shadow-md transition-transform active:scale-95"
            >
              Commencer gratuitement
            </Link>

            <a
              href="#features"
              className="w-full max-w-xs py-3 rounded-full font-medium bg-white border border-slate-200
                text-slate-700 shadow-sm active:scale-95"
            >
              Découvrir les fonctionnalités
            </a>
          </div>

          <p className="text-xs text-slate-500 mt-4">
            Gratuit • Sans carte bancaire • 14 jours d’essai Premium
          </p>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section id="features" className="px-6 py-16">
        <h2 className="text-2xl font-bold mb-10 text-center text-black">
          Tout ce dont vous avez besoin
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <FeatureCard icon={<Home size={30} />} title="Import automatique" text="Téléversez vos documents en un clic." />
          <FeatureCard icon={<Sparkles size={30} />} title="IA intelligente" text="Extraction automatique des infos importantes." />
          <FeatureCard icon={<FileText size={30} />} title="Classement parfait" text="Vos documents triés automatiquement." />
          <FeatureCard icon={<Bell size={30} />} title="Rappels" text="Contrats qui expirent ? On vous avertit." />
          <FeatureCard icon={<Shield size={30} />} title="Sécurité maximale" text="Chiffrement + hébergement en France." />
          <FeatureCard icon={<Leaf size={30} />} title="Écologique" text="Passez au tout numérique." />
        </div>
      </section>

      {/* CTA FINAL */}
      <section
        className="px-6 py-16 text-center 
        bg-gradient-to-b from-[hsl(202_100%_90%)] via-[hsl(328_80%_92%)] to-[hsl(39_100%_90%)]
        mt-10 rounded-t-3xl shadow-inner"
      >
        <h2 className="text-3xl font-bold mb-4">
          Prêt à simplifier votre vie administrative ?
        </h2>

        <p className="text-slate-700 max-w-md mx-auto mb-6">
          Rejoignez des milliers d’utilisateurs qui ont déjà repris le contrôle de leurs documents.
        </p>

        <Link
          href="/signup"
          className="w-full max-w-xs mx-auto py-3 rounded-full font-medium
            bg-white text-black border border-slate-200
            shadow-md transition-transform active:scale-95 block"
        >
          Créer mon compte gratuit
        </Link>

        <p className="text-xs text-slate-500 mt-8">
          © 2025 Paipers — Données hébergées en France 🇫🇷
        </p>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, text }: FeatureCardProps) {
  return (
    <div className="card p-4 flex flex-col items-start gap-3 h-full">
      <div className="p-3 rounded-xl bg-[hsl(var(--muted))] text-[hsl(var(--primary))] shadow-sm">
        {icon}
      </div>
      <p className="text-lg font-semibold">{title}</p>
      <p className="text-slate-600 text-sm">{text}</p>
    </div>
  );
}
