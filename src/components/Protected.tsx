"use client";

// Pour l’instant, composant "Protected" qui ne fait que rendre les enfants.
// On pourra ajouter la vraie logique d’authentification ensuite.

export default function Protected({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
