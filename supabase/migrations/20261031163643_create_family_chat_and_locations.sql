/*
# Family chat and live location tracking

1. New Tables
- `family_chat_messages`: messages posted in the shared family chat.
  - `id` (uuid, primary key)
  - `member_id` (text, must be one of the seven family member keys)
  - `body` (text, 1 to 1000 characters)
  - `route` (jsonb, optional route summary attached to a sent ski route)
  - `created_at` (timestamp)
- `member_locations`: the latest GPS position and ski statistics per family member.
  - `member_id` (text, primary key, one row per family member)
  - `lat`, `lng` (double precision, last known coordinates)
  - `speed_kmh`, `max_speed_kmh` (real, current and top speed)
  - `distance_m` (double precision, distance covered in the current session)
  - `updated_at` (timestamp)

2. Security
- Row level security is enabled on both tables.
- The app has no sign-in screen, so both tables grant access to `anon` and `authenticated`.
- Chat messages can be read and inserted only; they cannot be edited or deleted.
- Locations can be read, inserted and updated; they cannot be deleted.
- `member_id` is restricted to the known family member keys by a check constraint.

3. Realtime
- Both tables are added to the realtime publication so all family devices receive live updates.

4. Notes
- Statements are idempotent: tables, policies, and publication membership are only created when missing.
*/

CREATE TABLE IF NOT EXISTS family_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id text NOT NULL CHECK (member_id IN ('greti', 'szabina', 'pisti', 'david', 'zoli', 'gyongyi', 'kitti')),
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 1000),
  route jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS family_chat_messages_created_at_idx ON family_chat_messages (created_at);

ALTER TABLE family_chat_messages ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT ON family_chat_messages TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_chat_messages" ON family_chat_messages;
CREATE POLICY "anon_select_chat_messages" ON family_chat_messages FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_chat_messages" ON family_chat_messages;
CREATE POLICY "anon_insert_chat_messages" ON family_chat_messages FOR INSERT
  TO anon, authenticated WITH CHECK (true);

CREATE TABLE IF NOT EXISTS member_locations (
  member_id text PRIMARY KEY CHECK (member_id IN ('greti', 'szabina', 'pisti', 'david', 'zoli', 'gyongyi', 'kitti')),
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  speed_kmh real NOT NULL DEFAULT 0,
  max_speed_kmh real NOT NULL DEFAULT 0,
  distance_m double precision NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE member_locations ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON member_locations TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_member_locations" ON member_locations;
CREATE POLICY "anon_select_member_locations" ON member_locations FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_member_locations" ON member_locations;
CREATE POLICY "anon_insert_member_locations" ON member_locations FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_member_locations" ON member_locations;
CREATE POLICY "anon_update_member_locations" ON member_locations FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'family_chat_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE family_chat_messages;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'member_locations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE member_locations;
  END IF;
END $$;
