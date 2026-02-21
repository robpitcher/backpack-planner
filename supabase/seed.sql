-- TrailForge: Seed data for local development
-- Run automatically with `supabase start` or manually with `supabase db reset`

-- ============================================================
-- Test user (password: "testpassword123")
-- Uses Supabase's auth.users table, then extends to public.users
-- ============================================================
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, aud, role, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new,
  email_change, email_change_token_current, phone, phone_change,
  phone_change_token, reauthentication_token, email_change_confirm_status,
  is_sso_user, is_anonymous
) VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  '00000000-0000-0000-0000-000000000000',
  'hiker@example.com',
  crypt('testpassword123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"display_name":"Trail Tester"}',
  'authenticated',
  'authenticated',
  now(),
  now(),
  '', '', '',
  '', '', '', '',
  '', '', 0,
  false, false
);

INSERT INTO auth.identities (
  id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at
) VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'hiker@example.com',
  'email',
  '{"sub":"a1b2c3d4-e5f6-7890-abcd-ef1234567890","email":"hiker@example.com"}',
  now(),
  now(),
  now()
);

INSERT INTO public.users (id, email, display_name, skill_level, preferred_units) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'hiker@example.com', 'Trail Tester', 'intermediate', 'imperial');

-- ============================================================
-- Sample trips
-- ============================================================
INSERT INTO public.trips (id, user_id, title, description, status, start_date, end_date, region) VALUES
  ('11111111-1111-1111-1111-111111111111',
   'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
   'John Muir Trail Thru-Hike',
   'Northbound JMT from Happy Isles to Mt Whitney. 211 miles through the Sierra Nevada.',
   'planned',
   '2026-07-15', '2026-08-05',
   'Sierra Nevada, CA'),

  ('22222222-2222-2222-2222-222222222222',
   'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
   'Olympic Coast Weekend',
   'Quick 2-day trip along the Olympic coast wilderness.',
   'draft',
   NULL, NULL,
   'Olympic NP, WA'),

  ('33333333-3333-3333-3333-333333333333',
   'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
   'Appalachian Trail — Smokies Section',
   'Completed section hike through the Great Smoky Mountains.',
   'completed',
   '2025-10-01', '2025-10-05',
   'Great Smoky Mountains, TN/NC');

-- ============================================================
-- Sample waypoints (JMT trip)
-- ============================================================
INSERT INTO public.waypoints (id, trip_id, name, type, lat, lng, elevation, mile_marker, sort_order) VALUES
  ('aaaa1111-0000-0000-0000-000000000001',
   '11111111-1111-1111-1111-111111111111',
   'Happy Isles Trailhead', 'trailhead',
   37.7327, -119.5583, 4035.0, 0.0, 0),

  ('aaaa1111-0000-0000-0000-000000000002',
   '11111111-1111-1111-1111-111111111111',
   'Tuolumne Meadows', 'resupply',
   37.8735, -119.3594, 8619.0, 22.4, 1),

  ('aaaa1111-0000-0000-0000-000000000003',
   '11111111-1111-1111-1111-111111111111',
   'Reds Meadow', 'campsite',
   37.6148, -119.0754, 7580.0, 57.2, 2),

  ('aaaa1111-0000-0000-0000-000000000004',
   '11111111-1111-1111-1111-111111111111',
   'Mt Whitney Summit', 'summit',
   36.5785, -118.2923, 14505.0, 211.0, 3);

-- Sample waypoints (Olympic Coast trip)
INSERT INTO public.waypoints (id, trip_id, name, type, lat, lng, elevation, mile_marker, sort_order) VALUES
  ('aaaa2222-0000-0000-0000-000000000001',
   '22222222-2222-2222-2222-222222222222',
   'Rialto Beach Trailhead', 'trailhead',
   47.9218, -124.6374, 10.0, 0.0, 0),

  ('aaaa2222-0000-0000-0000-000000000002',
   '22222222-2222-2222-2222-222222222222',
   'Chilean Memorial', 'poi',
   47.9392, -124.6598, 25.0, 1.5, 1);

-- ============================================================
-- Sample gear items (JMT trip)
-- ============================================================
INSERT INTO public.gear_items (trip_id, user_id, name, category, weight_oz, quantity, is_worn, is_packed) VALUES
  ('11111111-1111-1111-1111-111111111111',
   'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
   'Zpacks Duplex', 'shelter', 21.0, 1, false, true),

  ('11111111-1111-1111-1111-111111111111',
   'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
   'Enlightened Equipment Enigma 20°', 'sleep', 22.5, 1, false, true),

  ('11111111-1111-1111-1111-111111111111',
   'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
   'BeFree Water Filter', 'safety', 2.3, 1, false, true),

  ('11111111-1111-1111-1111-111111111111',
   'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
   'Trail Runners', 'clothing', 20.0, 1, true, false);
