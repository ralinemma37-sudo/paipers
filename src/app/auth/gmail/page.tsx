import { redirect } from "next/navigation";

export default function GmailAuthPage() {
  redirect("/api/gmail/auth?platform=mobile");
}
