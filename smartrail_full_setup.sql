-- ============================================================
-- SmartRail Full Setup SQL
-- Run this in Supabase SQL Editor (safe to re-run)
-- ============================================================

-- ── 1. TTE Accounts ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tte_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone TEXT,
  employee_id TEXT,
  base_station TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE tte_accounts ENABLE ROW LEVEL SECURITY;

-- Allow admin full access, TTEs can read their own row
CREATE POLICY "Anyone authenticated can read tte_accounts"
  ON tte_accounts FOR SELECT TO authenticated USING (true);

CREATE POLICY "Anyone authenticated can insert tte_accounts"
  ON tte_accounts FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Anyone authenticated can update tte_accounts"
  ON tte_accounts FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Anyone authenticated can delete tte_accounts"
  ON tte_accounts FOR DELETE TO authenticated USING (true);

-- ── 2. TTE Assignments ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tte_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tte_email TEXT NOT NULL,
  tte_name TEXT NOT NULL,
  train_no TEXT NOT NULL,
  train_name TEXT,
  coach_ids TEXT[] DEFAULT '{}',
  from_station TEXT,
  to_station TEXT,
  duty_date DATE NOT NULL,
  shift_start TEXT,
  shift_end TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE tte_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read tte_assignments"
  ON tte_assignments FOR SELECT TO authenticated USING (true);

CREATE POLICY "Anyone authenticated can insert tte_assignments"
  ON tte_assignments FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Anyone authenticated can update tte_assignments"
  ON tte_assignments FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Anyone authenticated can delete tte_assignments"
  ON tte_assignments FOR DELETE TO authenticated USING (true);

-- ── 3. Passenger Details (seat visualizer) ────────────────────
CREATE TABLE IF NOT EXISTS passenger_details (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pnr_number VARCHAR(20) NOT NULL,
  train_no VARCHAR(20) NOT NULL,
  date DATE NOT NULL,
  coach VARCHAR(10) NOT NULL,
  seat_number VARCHAR(10) NOT NULL,
  berth_type VARCHAR(5) NOT NULL DEFAULT 'SEAT',
  passenger_name VARCHAR(100) NOT NULL,
  passenger_age INTEGER NOT NULL,
  passenger_gender VARCHAR(10) NOT NULL,
  booking_status VARCHAR(20) DEFAULT 'CONFIRMED',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE passenger_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read passenger_details"
  ON passenger_details FOR SELECT TO authenticated USING (true);

CREATE POLICY "Anyone authenticated can insert passenger_details"
  ON passenger_details FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Anyone authenticated can delete passenger_details"
  ON passenger_details FOR DELETE TO authenticated USING (true);

-- Also allow anon read for seat layout display
CREATE POLICY "Anon can read passenger_details"
  ON passenger_details FOR SELECT TO anon USING (true);

-- ── 4. Admin can read ALL complaints ─────────────────────────
-- (Run only if not already exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admin can view all complaints' AND tablename = 'complaints'
  ) THEN
    EXECUTE 'CREATE POLICY "Admin can view all complaints"
      ON public.complaints FOR SELECT TO authenticated
      USING (true)';
  END IF;
END $$;

-- ── 5. Notifications table ────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'alert')),
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read notifications"
  ON notifications FOR SELECT TO anon USING (true);

CREATE POLICY "Authenticated can read notifications"
  ON notifications FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can insert notifications"
  ON notifications FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated can delete notifications"
  ON notifications FOR DELETE TO authenticated USING (true);

-- ── Done! ─────────────────────────────────────────────────────
SELECT 'SmartRail tables setup complete' AS result;
