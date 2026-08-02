export type WaitlistProfile = "particulier" | "professionnel" | "les_deux";

export type WaitlistRow = {
  id: string;
  created_at: string;
  first_name: string | null;
  email: string;
  profile: WaitlistProfile;
  challenge: string | null;
  marketing_consent: boolean;
  launch_notification: boolean;
  confirmed: boolean;
  confirmation_token: string;
  confirmed_at: string | null;
  source: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
};

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function profileLabel(profile: string): string {
  if (profile === "particulier") return "Particulier";
  if (profile === "professionnel") return "Professionnel";
  if (profile === "les_deux") return "Les deux";
  return profile;
}
