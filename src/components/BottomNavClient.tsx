"use client";

import dynamic from "next/dynamic";

// BottomNav doit être rendu UNIQUEMENT côté client
const BottomNav = dynamic(() => import("./BottomNav"), {
  ssr: false,
});

export default function BottomNavClient() {
  return <BottomNav />;
}
