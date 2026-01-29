-- Roles enum
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'user');
  END IF;
END $$;

-- Roles table (no FK to auth.users to avoid coupling)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Only admins can view/manage roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- Policies for user_roles
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_roles' AND policyname='Admins can select roles'
  ) THEN
    CREATE POLICY "Admins can select roles"
    ON public.user_roles
    FOR SELECT
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_roles' AND policyname='Admins can insert roles'
  ) THEN
    CREATE POLICY "Admins can insert roles"
    ON public.user_roles
    FOR INSERT
    TO authenticated
    WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_roles' AND policyname='Admins can update roles'
  ) THEN
    CREATE POLICY "Admins can update roles"
    ON public.user_roles
    FOR UPDATE
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_roles' AND policyname='Admins can delete roles'
  ) THEN
    CREATE POLICY "Admins can delete roles"
    ON public.user_roles
    FOR DELETE
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- Captured leads / checkouts
CREATE TABLE IF NOT EXISTS public.checkout_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Customer PII
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  cpf TEXT NOT NULL,
  cep TEXT NOT NULL,
  address TEXT NOT NULL,
  number TEXT NOT NULL,

  -- Order context
  product_name TEXT NOT NULL,
  product_color TEXT,
  product_size TEXT,
  qty INTEGER NOT NULL DEFAULT 1,
  add_top BOOLEAN NOT NULL DEFAULT false,
  shipping TEXT NOT NULL,
  subtotal NUMERIC(12,2) NOT NULL,
  shipping_price NUMERIC(12,2) NOT NULL,
  total NUMERIC(12,2) NOT NULL,

  -- Payment provider reference
  pix_identifier TEXT,

  -- Discord batching
  sent_to_discord BOOLEAN NOT NULL DEFAULT false,
  discord_batch_id UUID
);

CREATE INDEX IF NOT EXISTS idx_checkout_leads_created_at ON public.checkout_leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_checkout_leads_sent ON public.checkout_leads (sent_to_discord, created_at);

ALTER TABLE public.checkout_leads ENABLE ROW LEVEL SECURITY;

-- Admin-only access to leads (no direct public access)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='checkout_leads' AND policyname='Admins can select leads'
  ) THEN
    CREATE POLICY "Admins can select leads"
    ON public.checkout_leads
    FOR SELECT
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='checkout_leads' AND policyname='Admins can update leads'
  ) THEN
    CREATE POLICY "Admins can update leads"
    ON public.checkout_leads
    FOR UPDATE
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='checkout_leads' AND policyname='Admins can delete leads'
  ) THEN
    CREATE POLICY "Admins can delete leads"
    ON public.checkout_leads
    FOR DELETE
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- Track batches sent to Discord
CREATE TABLE IF NOT EXISTS public.discord_lead_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  lead_count INTEGER NOT NULL,
  first_lead_at TIMESTAMPTZ,
  last_lead_at TIMESTAMPTZ,
  discord_message_id TEXT
);

ALTER TABLE public.discord_lead_batches ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='discord_lead_batches' AND policyname='Admins can select discord batches'
  ) THEN
    CREATE POLICY "Admins can select discord batches"
    ON public.discord_lead_batches
    FOR SELECT
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;
