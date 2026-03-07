-- =============================================================
-- SmartRail Mock Passenger Data for Train 12082 (Jan Shatabdi)
-- Coach D1 (2S - Second Seating, 108 seats total)
-- 
-- Today    (2026-03-07): 12 booked → 96 available
-- Tomorrow (2026-03-08): 18 booked → 90 available
-- Day +2   (2026-03-09): 29 booked → 79 available
--
-- Run this AFTER smartrail_full_setup.sql  
-- =============================================================

-- STEP 1: Create the passenger_details table if not already done
CREATE TABLE IF NOT EXISTS passenger_details (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pnr_number VARCHAR(20) NOT NULL,
  train_no VARCHAR(20) NOT NULL,
  date DATE NOT NULL,
  coach VARCHAR(10) NOT NULL,
  seat_number VARCHAR(10) NOT NULL,
  berth_type VARCHAR(5) NOT NULL,
  passenger_name VARCHAR(100) NOT NULL,
  passenger_age INTEGER NOT NULL,
  passenger_gender VARCHAR(10) NOT NULL,
  booking_status VARCHAR(20) DEFAULT 'CONFIRMED',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- STEP 2: Enable RLS and allow public read for seat layout display
ALTER TABLE passenger_details ENABLE ROW LEVEL SECURITY;

-- Allow anyone (users/admin/TTE) to read passenger_details for seat layout
DROP POLICY IF EXISTS "Allow read passenger details" ON passenger_details;
CREATE POLICY "Allow read passenger details"
ON passenger_details FOR SELECT USING (true);

-- Allow authenticated users to insert their own bookings
DROP POLICY IF EXISTS "Allow insert booking" ON passenger_details;
CREATE POLICY "Allow insert booking"
ON passenger_details FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow service role to do everything
DROP POLICY IF EXISTS "Allow service role all" ON passenger_details;
CREATE POLICY "Allow service role all"
ON passenger_details FOR ALL USING (auth.role() = 'service_role');

-- STEP 3: Clear existing mock data for this train
DELETE FROM passenger_details WHERE train_no = '12082';

-- =============================================================
-- DATE 1: 2026-03-07 (Today) — 12 passengers booked in D1
-- Available: 108 - 12 = 96
-- =============================================================
INSERT INTO passenger_details (pnr_number, train_no, date, coach, seat_number, berth_type, passenger_name, passenger_age, passenger_gender, booking_status) VALUES
('PNR2603001', '12082', '2026-03-07', 'D1', '3',   'AS', 'Rajan Pillai',       45, 'Male',   'CONFIRMED'),
('PNR2603001', '12082', '2026-03-07', 'D1', '4',   'AS', 'Meena Pillai',       42, 'Female', 'CONFIRMED'),
('PNR2603002', '12082', '2026-03-07', 'D1', '9',   'AS', 'Arun Kumar',         28, 'Male',   'CONFIRMED'),
('PNR2603002', '12082', '2026-03-07', 'D1', '10',  'AS', 'Priya Kumar',        25, 'Female', 'CONFIRMED'),
('PNR2603003', '12082', '2026-03-07', 'D1', '15',  'AS', 'Suresh Nair',        55, 'Male',   'CONFIRMED'),
('PNR2603003', '12082', '2026-03-07', 'D1', '16',  'AS', 'Lakshmi Nair',       52, 'Female', 'CONFIRMED'),
('PNR2603004', '12082', '2026-03-07', 'D1', '21',  'AS', 'Vishnu Menon',       33, 'Male',   'CONFIRMED'),
('PNR2603004', '12082', '2026-03-07', 'D1', '22',  'AS', 'Divya Menon',        30, 'Female', 'CONFIRMED'),
('PNR2603005', '12082', '2026-03-07', 'D1', '1',   'WS', 'Gopalan Kutty',      67, 'Male',   'CONFIRMED'),
('PNR2603005', '12082', '2026-03-07', 'D1', '2',   'MS', 'Kamala Kutty',       64, 'Female', 'CONFIRMED'),
('PNR2603006', '12082', '2026-03-07', 'D1', '27',  'AS', 'Deepak Varma',       22, 'Male',   'CONFIRMED'),
('PNR2603006', '12082', '2026-03-07', 'D1', '28',  'AS', 'Sneha Varma',        20, 'Female', 'CONFIRMED');

-- =============================================================
-- DATE 2: 2026-03-08 (Tomorrow) — 18 passengers booked in D1
-- Available: 108 - 18 = 90
-- =============================================================
INSERT INTO passenger_details (pnr_number, train_no, date, coach, seat_number, berth_type, passenger_name, passenger_age, passenger_gender, booking_status) VALUES
('PNR2603101', '12082', '2026-03-08', 'D1', '3',   'AS', 'Babu Thomas',        40, 'Male',   'CONFIRMED'),
('PNR2603101', '12082', '2026-03-08', 'D1', '4',   'AS', 'Santha Thomas',      38, 'Female', 'CONFIRMED'),
('PNR2603102', '12082', '2026-03-08', 'D1', '9',   'AS', 'Manoj Krishnan',     26, 'Male',   'CONFIRMED'),
('PNR2603102', '12082', '2026-03-08', 'D1', '10',  'AS', 'Rekha Krishnan',     24, 'Female', 'CONFIRMED'),
('PNR2603103', '12082', '2026-03-08', 'D1', '15',  'AS', 'Anand Vijayan',      47, 'Male',   'CONFIRMED'),
('PNR2603103', '12082', '2026-03-08', 'D1', '16',  'AS', 'Sindhu Vijayan',     44, 'Female', 'CONFIRMED'),
('PNR2603104', '12082', '2026-03-08', 'D1', '21',  'AS', 'Rohit Sharma',       31, 'Male',   'CONFIRMED'),
('PNR2603104', '12082', '2026-03-08', 'D1', '22',  'AS', 'Pooja Sharma',       28, 'Female', 'CONFIRMED'),
('PNR2603105', '12082', '2026-03-08', 'D1', '1',   'WS', 'Krishnadas',         58, 'Male',   'CONFIRMED'),
('PNR2603105', '12082', '2026-03-08', 'D1', '2',   'MS', 'Sarada Devi',        55, 'Female', 'CONFIRMED'),
('PNR2603106', '12082', '2026-03-08', 'D1', '27',  'AS', 'Santhosh Jose',      35, 'Male',   'CONFIRMED'),
('PNR2603106', '12082', '2026-03-08', 'D1', '28',  'AS', 'Anitha Jose',        32, 'Female', 'CONFIRMED'),
('PNR2603107', '12082', '2026-03-08', 'D1', '33',  'AS', 'Murugan Pillai',     60, 'Male',   'CONFIRMED'),
('PNR2603107', '12082', '2026-03-08', 'D1', '34',  'AS', 'Usha Pillai',        57, 'Female', 'CONFIRMED'),
('PNR2603108', '12082', '2026-03-08', 'D1', '39',  'AS', 'Ajith Kumar',        29, 'Male',   'CONFIRMED'),
('PNR2603108', '12082', '2026-03-08', 'D1', '40',  'AS', 'Nisha Kumar',        27, 'Female', 'CONFIRMED'),
('PNR2603109', '12082', '2026-03-08', 'D1', '7',   'WS', 'Jacob Mathew',       43, 'Male',   'CONFIRMED'),
('PNR2603109', '12082', '2026-03-08', 'D1', '8',   'MS', 'Alice Mathew',       40, 'Female', 'CONFIRMED');

-- =============================================================
-- DATE 3: 2026-03-09 (Day after tomorrow) — 29 passengers in D1
-- Available: 108 - 29 = 79
-- =============================================================
INSERT INTO passenger_details (pnr_number, train_no, date, coach, seat_number, berth_type, passenger_name, passenger_age, passenger_gender, booking_status) VALUES
('PNR2603201', '12082', '2026-03-09', 'D1', '3',   'AS', 'Rajeev Nambiar',     51, 'Male',   'CONFIRMED'),
('PNR2603201', '12082', '2026-03-09', 'D1', '4',   'AS', 'Geetha Nambiar',     48, 'Female', 'CONFIRMED'),
('PNR2603202', '12082', '2026-03-09', 'D1', '9',   'AS', 'Sujith Madhavan',    32, 'Male',   'CONFIRMED'),
('PNR2603202', '12082', '2026-03-09', 'D1', '10',  'AS', 'Anjali Madhavan',    29, 'Female', 'CONFIRMED'),
('PNR2603203', '12082', '2026-03-09', 'D1', '15',  'AS', 'Rajesh Kurup',       44, 'Male',   'CONFIRMED'),
('PNR2603203', '12082', '2026-03-09', 'D1', '16',  'AS', 'Sobha Kurup',        41, 'Female', 'CONFIRMED'),
('PNR2603204', '12082', '2026-03-09', 'D1', '21',  'AS', 'Faisal Rahman',      36, 'Male',   'CONFIRMED'),
('PNR2603204', '12082', '2026-03-09', 'D1', '22',  'AS', 'Aisha Rahman',       33, 'Female', 'CONFIRMED'),
('PNR2603205', '12082', '2026-03-09', 'D1', '1',   'WS', 'Harikrishnan',       62, 'Male',   'CONFIRMED'),
('PNR2603205', '12082', '2026-03-09', 'D1', '2',   'MS', 'Vasantha',           59, 'Female', 'CONFIRMED'),
('PNR2603206', '12082', '2026-03-09', 'D1', '27',  'AS', 'Bibin George',       27, 'Male',   'CONFIRMED'),
('PNR2603206', '12082', '2026-03-09', 'D1', '28',  'AS', 'Rina George',        25, 'Female', 'CONFIRMED'),
('PNR2603207', '12082', '2026-03-09', 'D1', '33',  'AS', 'Narayanan Kutty',    70, 'Male',   'CONFIRMED'),
('PNR2603207', '12082', '2026-03-09', 'D1', '34',  'AS', 'Kalyani Kutty',      67, 'Female', 'CONFIRMED'),
('PNR2603208', '12082', '2026-03-09', 'D1', '39',  'AS', 'Unnikrishnan',       39, 'Male',   'CONFIRMED'),
('PNR2603208', '12082', '2026-03-09', 'D1', '40',  'AS', 'Bindhu Unni',        36, 'Female', 'CONFIRMED'),
('PNR2603209', '12082', '2026-03-09', 'D1', '7',   'WS', 'Samuel John',        48, 'Male',   'CONFIRMED'),
('PNR2603209', '12082', '2026-03-09', 'D1', '8',   'MS', 'Mary John',          45, 'Female', 'CONFIRMED'),
('PNR2603210', '12082', '2026-03-09', 'D1', '45',  'AS', 'Krishnamoorthi',     53, 'Male',   'CONFIRMED'),
('PNR2603210', '12082', '2026-03-09', 'D1', '46',  'AS', 'Radhadevi',          50, 'Female', 'CONFIRMED'),
('PNR2603211', '12082', '2026-03-09', 'D1', '51',  'AS', 'Sreenivasan',        42, 'Male',   'CONFIRMED'),
('PNR2603211', '12082', '2026-03-09', 'D1', '52',  'AS', 'Indira Sreenivasan', 39, 'Female', 'CONFIRMED'),
('PNR2603212', '12082', '2026-03-09', 'D1', '57',  'AS', 'Thomas Cherian',     56, 'Male',   'CONFIRMED'),
('PNR2603212', '12082', '2026-03-09', 'D1', '58',  'AS', 'Leena Cherian',      53, 'Female', 'CONFIRMED'),
('PNR2603213', '12082', '2026-03-09', 'D1', '63',  'AS', 'Jibin Jacob',        24, 'Male',   'CONFIRMED'),
('PNR2603213', '12082', '2026-03-09', 'D1', '64',  'AS', 'Jisna Jacob',        22, 'Female', 'CONFIRMED'),
('PNR2603214', '12082', '2026-03-09', 'D1', '13',  'WS', 'Mohanan Nair',       65, 'Male',   'CONFIRMED'),
('PNR2603214', '12082', '2026-03-09', 'D1', '14',  'MS', 'Sukumari Nair',      60, 'Female', 'CONFIRMED'),
('PNR2603215', '12082', '2026-03-09', 'D1', '19',  'WS', 'Shyam Prasad',       37, 'Male',   'CONFIRMED');

-- =============================================================
-- Verification Query (run after inserting to confirm)
-- =============================================================
SELECT
  date,
  COUNT(*) as booked_seats,
  (108 - COUNT(*)) as available_seats
FROM passenger_details
WHERE train_no = '12082' AND coach = 'D1'
GROUP BY date
ORDER BY date;
