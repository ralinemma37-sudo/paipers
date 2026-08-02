-- Waitlist pré-lancement Paipers (double opt-in).
-- Appliquer sur le projet Supabase partagé (web + mobile).

CREATE TABLE IF NOT EXISTS public.waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  first_name text,
  email text NOT NULL,
  profile text NOT NULL CHECK (profile IN ('particulier', 'professionnel', 'les_deux')),
  challenge text,
  marketing_consent boolean NOT NULL DEFAULT false,
  launch_notification boolean NOT NULL DEFAULT true,
  confirmed boolean NOT NULL DEFAULT false,
  confirmation_token text NOT NULL,
  confirmed_at timestamptz,
  source text,
  utm_source text,
  utm_medium text,
  utm_campaign text
);

CREATE UNIQUE INDEX IF NOT EXISTS waitlist_email_unique
  ON public.waitlist (lower(email));

CREATE UNIQUE INDEX IF NOT EXISTS waitlist_confirmation_token_unique
  ON public.waitlist (confirmation_token);

CREATE INDEX IF NOT EXISTS waitlist_created_at_idx
  ON public.waitlist (created_at DESC);

CREATE INDEX IF NOT EXISTS waitlist_confirmed_idx
  ON public.waitlist (confirmed);

ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Pas d’accès client direct : écriture / lecture via service role (API Next.js).
DROP POLICY IF EXISTS "waitlist_no_public_access" ON public.waitlist;

COMMENT ON TABLE public.waitlist IS
  'Liste d’attente pré-lancement Paipers (double opt-in email).';
