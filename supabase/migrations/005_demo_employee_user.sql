-- Create a demo employee auth user and link to Nora (employee eeeeeeee-...)
-- Run this in Supabase SQL editor after setting a password for the user

-- Step 1: Create auth user for demo employee (Nora)
-- NOTE: Supabase does not allow inserting directly into auth.users via SQL in hosted mode.
-- Use the Supabase Auth dashboard or the Admin API to create:
--   Email: nora@luxe.sa  |  Password: Nora1234!
-- Then run Step 2 below.

-- Step 2: Set up user_profile and link employee record
-- (Replace with actual UUID after creating the auth user above)
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Look up auth user by email
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'nora@luxe.sa' LIMIT 1;

  IF v_user_id IS NOT NULL THEN
    -- Upsert user_profile with employee role
    INSERT INTO public.user_profiles (id, tenant_id, role, name_ar, name_en)
    VALUES (
      v_user_id,
      '11111111-1111-1111-1111-111111111111',
      'employee',
      'نورا',
      'Nora'
    )
    ON CONFLICT (id) DO UPDATE SET
      tenant_id = EXCLUDED.tenant_id,
      role      = EXCLUDED.role,
      name_ar   = EXCLUDED.name_ar,
      name_en   = EXCLUDED.name_en;

    -- Link the employees record (Nora: eeeeeeee-...)
    UPDATE public.employees
    SET user_id = v_user_id
    WHERE id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'
      AND tenant_id = '11111111-1111-1111-1111-111111111111';

    RAISE NOTICE 'Demo employee user set up for user_id: %', v_user_id;
  ELSE
    RAISE NOTICE 'User nora@luxe.sa not found in auth.users. Create the user first via Supabase Auth dashboard.';
  END IF;
END;
$$;
