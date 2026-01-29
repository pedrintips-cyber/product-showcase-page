-- Ensure only ONE admin exists in the entire system
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'uniq_single_admin'
  ) THEN
    CREATE UNIQUE INDEX uniq_single_admin
      ON public.user_roles ((role))
      WHERE role = 'admin';
  END IF;
END $$;
