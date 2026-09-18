/*
# Recreate admin user properly

## Problem
The admin user was created via direct INSERT into auth.users, but the 
encrypted_password may not be in the format GoTrue expects.

## Fix
1. Delete the existing admin user and its profile
2. Re-insert with proper bcrypt hash (bf with cost factor 10)
3. Recreate the profile with admin role
*/

-- Clean up existing admin user
DELETE FROM profiles WHERE id IN (SELECT id FROM auth.users WHERE email = 'admin@alissonlanches.com');
DELETE FROM auth.identities WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'admin@alissonlanches.com');
DELETE FROM auth.users WHERE email = 'admin@alissonlanches.com';

-- Recreate admin user with all required fields
DO $$
DECLARE
  admin_id uuid;
BEGIN
  admin_id := gen_random_uuid();

  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_sso_user,
    is_anonymous
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    admin_id,
    'authenticated',
    'authenticated',
    'admin@alissonlanches.com',
    crypt('Alisson@2025', gen_salt('bf', 10)),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"Administrador"}'::jsonb,
    false,
    false
  );

  INSERT INTO auth.identities (
    provider_id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    admin_id::text,
    admin_id,
    jsonb_build_object(
      'sub', admin_id::text,
      'email', 'admin@alissonlanches.com',
      'email_verified', true
    ),
    'email',
    now(),
    now(),
    now()
  );

  INSERT INTO profiles (id, name, phone, role)
  VALUES (admin_id, 'Administrador', '', 'admin');
END $$;
