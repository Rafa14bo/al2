/*
# Create admin user for store management

1. Purpose
- Creates a dedicated admin auth user with a known email and password.
- Sets the profile role to 'admin' so the AdminLayout access check passes.

2. What changes
- New auth user: admin@alissonlanches.com with password "Alisson@2025"
- Profile row with role = 'admin' linked to that user.

3. Security
- The profile row uses ON DELETE CASCADE from auth.users, so it's safe.
- The role column is set to 'admin' — only this user can access /admin routes.

4. Notes
- This user is the store administrator. They log in at /admin/entrar.
- Password can be changed later via Supabase dashboard if needed.
*/

DO $$
DECLARE
  admin_id uuid;
BEGIN
  SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@alissonlanches.com';

  IF admin_id IS NULL THEN
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
      raw_user_meta_data
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'admin@alissonlanches.com',
      crypt('Alisson@2025', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"name":"Administrador"}'
    )
    RETURNING id INTO admin_id;

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
      jsonb_build_object('sub', admin_id::text, 'email', 'admin@alissonlanches.com'),
      'email',
      now(),
      now(),
      now()
    );
  END IF;

  INSERT INTO profiles (id, name, phone, role)
  VALUES (admin_id, 'Administrador', '', 'admin')
  ON CONFLICT (id) DO UPDATE SET role = 'admin', name = 'Administrador';
END $$;
