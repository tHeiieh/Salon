-- Auto-create user_profiles row when a new auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- Only insert if no row exists (avoid duplicate key on manual seeding)
  INSERT INTO public.user_profiles (id, role)
  VALUES (NEW.id, 'customer')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed the demo owner profile
-- Uses a DO block so we can look up the auth user by email and insert with correct UUID
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'owner@luxe.sa' LIMIT 1;
  IF v_user_id IS NOT NULL THEN
    INSERT INTO public.user_profiles (id, tenant_id, role, name_ar, name_en)
    VALUES (
      v_user_id,
      '11111111-1111-1111-1111-111111111111',
      'salon_owner',
      'مالكة لوكس بيوتي',
      'Luxe Beauty Owner'
    )
    ON CONFLICT (id) DO UPDATE SET
      tenant_id = EXCLUDED.tenant_id,
      role      = EXCLUDED.role;
  END IF;
END;
$$;
