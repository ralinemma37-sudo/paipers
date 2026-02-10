import { redirect } from "next/navigation";

export default function GmailCallbackPage() {
  redirect("paipers://profil/gmail?status=connected");
}
