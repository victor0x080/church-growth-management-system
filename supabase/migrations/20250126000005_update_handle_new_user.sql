-- Update trigger to optionally create church and role for clergy using user metadata
-- This avoids unauthenticated client inserts causing 401s

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  meta JSONB := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
  v_user_type TEXT := COALESCE(meta->>'user_type', 'parish');
  v_full_name TEXT := meta->>'full_name';
  v_church_id UUID;
  v_church_name TEXT := meta->>'church_name';
  v_church_address TEXT := meta->>'church_address';
  v_church_city TEXT := meta->>'church_city';
  v_church_state TEXT := meta->>'church_state';
  v_church_denomination TEXT := meta->>'church_denomination';
  v_church_url TEXT := meta->>'church_url';
BEGIN
  -- Create profile (if not exists)
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, v_full_name)
  ON CONFLICT (id) DO NOTHING;

  IF v_user_type = 'clergy' THEN
    -- Create church if name provided
    IF v_church_name IS NOT NULL AND length(v_church_name) > 1 THEN
      INSERT INTO public.churches (name, address, city, state, denomination, country, website)
      VALUES (v_church_name, v_church_address, v_church_city, v_church_state, v_church_denomination, 'United States', v_church_url)
      RETURNING id INTO v_church_id;
    END IF;

    -- Assign clergy role (idempotent)
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'clergy')
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    -- Default parish role (idempotent)
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'parish')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  -- Update profile with church_id if created or provided via metadata
  UPDATE public.profiles
  SET church_id = COALESCE(v_church_id, NULL)
  WHERE id = NEW.id
  AND (COALESCE(v_church_id, '00000000-0000-0000-0000-000000000000'::uuid) <> '00000000-0000-0000-0000-000000000000'::uuid);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure trigger exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;


