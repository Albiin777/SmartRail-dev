-- ============================================================
-- SmartRail Additional Tables (run AFTER smartrail_full_setup.sql)
-- ============================================================

-- 1. Fare Overrides (admin can set custom fares per train)
CREATE TABLE IF NOT EXISTS fare_overrides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  train_no VARCHAR(20) NOT NULL UNIQUE,
  train_name VARCHAR(200),
  fares JSONB NOT NULL DEFAULT '{}',
  updated_by VARCHAR(100) DEFAULT 'admin',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE fare_overrides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "fare_overrides_select" ON fare_overrides;
CREATE POLICY "fare_overrides_select" ON fare_overrides FOR SELECT USING (true);

DROP POLICY IF EXISTS "fare_overrides_insert_admin" ON fare_overrides;
CREATE POLICY "fare_overrides_insert_admin" ON fare_overrides FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "fare_overrides_update_admin" ON fare_overrides;
CREATE POLICY "fare_overrides_update_admin" ON fare_overrides FOR UPDATE USING (true);

-- 2. Ensure notifications table has all needed columns
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='target_audience') THEN
    ALTER TABLE notifications ADD COLUMN target_audience VARCHAR(20) DEFAULT 'all';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='sent_by') THEN
    ALTER TABLE notifications ADD COLUMN sent_by VARCHAR(100) DEFAULT 'admin';
  END IF;
END $$;

-- 3. Ensure complaints table has admin_reply column
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='complaints' AND column_name='admin_reply') THEN
    ALTER TABLE complaints ADD COLUMN admin_reply TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='complaints' AND column_name='status') THEN
    ALTER TABLE complaints ADD COLUMN status VARCHAR(20) DEFAULT 'open';
  END IF;
END $$;

-- 4. Ensure tte_assignments has all needed columns
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tte_assignments' AND column_name='tte_id') THEN
    ALTER TABLE tte_assignments ADD COLUMN tte_id VARCHAR(50);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tte_assignments' AND column_name='tte_email') THEN
    ALTER TABLE tte_assignments ADD COLUMN tte_email VARCHAR(200);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tte_assignments' AND column_name='train_name') THEN
    ALTER TABLE tte_assignments ADD COLUMN train_name VARCHAR(200);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tte_assignments' AND column_name='source_station') THEN
    ALTER TABLE tte_assignments ADD COLUMN source_station VARCHAR(100);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tte_assignments' AND column_name='dest_station') THEN
    ALTER TABLE tte_assignments ADD COLUMN dest_station VARCHAR(100);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tte_assignments' AND column_name='notes') THEN
    ALTER TABLE tte_assignments ADD COLUMN notes TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tte_assignments' AND column_name='shift_start') THEN
    ALTER TABLE tte_assignments ADD COLUMN shift_start VARCHAR(10);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tte_assignments' AND column_name='shift_end') THEN
    ALTER TABLE tte_assignments ADD COLUMN shift_end VARCHAR(10);
  END IF;
END $$;

-- 5. Ensure tte_accounts has employee_id column
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tte_accounts' AND column_name='employee_id') THEN
    ALTER TABLE tte_accounts ADD COLUMN employee_id VARCHAR(50);
  END IF;
END $$;

SELECT 'Migration complete! All tables updated.' as result;
