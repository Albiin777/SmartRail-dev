-- SQL Script to seed mock passenger data for Admin Seat Layout view
-- This table stores booking details and maps directly to the seat layout logic
-- Run this script in the Supabase SQL editor

-- 1. Create table if it doesn't exist
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

-- 2. Clear out any existing demo data for today so we don't get duplicates if ran twice
DELETE FROM passenger_details WHERE date = CURRENT_DATE;

-- ==========================================
-- TRAIN 1: 12082 CAN JANSHATABDI (CHAIR CAR)
-- ==========================================
-- D1 Coach (Chair Car configuration - Window, Middle, Aisle)
INSERT INTO passenger_details (pnr_number, train_no, date, coach, seat_number, berth_type, passenger_name, passenger_age, passenger_gender) VALUES
('PNR12082D1001', '12082', CURRENT_DATE, 'D1', '1', 'WS', 'Aryan Nair', 28, 'Male'),
('PNR12082D1002', '12082', CURRENT_DATE, 'D1', '2', 'MS', 'Riya Varghese', 25, 'Female'),
('PNR12082D1003', '12082', CURRENT_DATE, 'D1', '3', 'AS', 'Mohammed Ali', 42, 'Male'),
('PNR12082D1004', '12082', CURRENT_DATE, 'D1', '7', 'WS', 'Kavya Krishna', 31, 'Female'),
('PNR12082D1005', '12082', CURRENT_DATE, 'D1', '9', 'AS', 'Joseph Thomas', 55, 'Male'),
('PNR12082D1006', '12082', CURRENT_DATE, 'D1', '21', 'WS', 'Ananthu P', 22, 'Male'),
('PNR12082D1007', '12082', CURRENT_DATE, 'D1', '23', 'AS', 'Smita R', 38, 'Female'),
('PNR12082D1008', '12082', CURRENT_DATE, 'D1', '40', 'WS', 'Gopal Krishnan', 62, 'Male'),
('PNR12082D1009', '12082', CURRENT_DATE, 'D1', '45', 'AS', 'Lekshmi S', 29, 'Female'),
('PNR12082D1010', '12082', CURRENT_DATE, 'D1', '50', 'MS', 'Rahul K', 35, 'Male');


-- ==========================================
-- TRAIN 2: 16346 NETRAVATI EXP (SLEEPER)
-- ==========================================
-- S2 Coach (Sleeper configuration - LB, MB, UB, SL, SU)
INSERT INTO passenger_details (pnr_number, train_no, date, coach, seat_number, berth_type, passenger_name, passenger_age, passenger_gender) VALUES
('PNR16346S2001', '16346', CURRENT_DATE, 'S2', '1', 'LB', 'Ammini Amma', 68, 'Female'),
('PNR16346S2002', '16346', CURRENT_DATE, 'S2', '2', 'MB', 'Suresh Kumar', 40, 'Male'),
('PNR16346S2003', '16346', CURRENT_DATE, 'S2', '3', 'UB', 'Arun', 20, 'Male'),
('PNR16346S2004', '16346', CURRENT_DATE, 'S2', '7', 'SL', 'Meera V', 25, 'Female'),
('PNR16346S2005', '16346', CURRENT_DATE, 'S2', '8', 'SU', 'Vishnu P', 26, 'Male'),
('PNR16346S2006', '16346', CURRENT_DATE, 'S2', '10', 'MB', 'John Doe', 30, 'Male'),
('PNR16346S2007', '16346', CURRENT_DATE, 'S2', '17', 'LB', 'Bhavani R', 60, 'Female'),
('PNR16346S2008', '16346', CURRENT_DATE, 'S2', '20', 'MB', 'Ananya S', 21, 'Female'),
('PNR16346S2009', '16346', CURRENT_DATE, 'S2', '21', 'UB', 'Rakesh M', 45, 'Male'),
('PNR16346S2010', '16346', CURRENT_DATE, 'S2', '24', 'SU', 'Fathima KS', 19, 'Female');


-- ==========================================
-- TRAIN 3: 16127 MS GURUVAYUR EXP (SLEEPER)
-- ==========================================
-- S5 Coach
INSERT INTO passenger_details (pnr_number, train_no, date, coach, seat_number, berth_type, passenger_name, passenger_age, passenger_gender) VALUES
('PNR16127S5001', '16127', CURRENT_DATE, 'S5', '9', 'LB', 'Narayanan N', 72, 'Male'),
('PNR16127S5002', '16127', CURRENT_DATE, 'S5', '15', 'SL', 'Sreekumar', 50, 'Male'),
('PNR16127S5003', '16127', CURRENT_DATE, 'S5', '16', 'SU', 'Athira K', 28, 'Female'),
('PNR16127S5004', '16127', CURRENT_DATE, 'S5', '30', 'MB', 'Jitin Raj', 33, 'Male'),
('PNR16127S5005', '16127', CURRENT_DATE, 'S5', '33', 'LB', 'Valsala K', 65, 'Female'),
('PNR16127S5006', '16127', CURRENT_DATE, 'S5', '41', 'LB', 'Unni', 24, 'Male'),
('PNR16127S5007', '16127', CURRENT_DATE, 'S5', '44', 'UB', 'Devika M', 23, 'Female'),
('PNR16127S5008', '16127', CURRENT_DATE, 'S5', '50', 'MB', 'Ramu', 35, 'Male');


-- ==========================================
-- TRAIN 4: 16604 MAVELI EXPRESS (AC 3 TIER)
-- ==========================================
-- B1 Coach
INSERT INTO passenger_details (pnr_number, train_no, date, coach, seat_number, berth_type, passenger_name, passenger_age, passenger_gender) VALUES
('PNR16604B1001', '16604', CURRENT_DATE, 'B1', '2', 'MB', 'Akhil Dev', 31, 'Male'),
('PNR16604B1002', '16604', CURRENT_DATE, 'B1', '5', 'MB', 'Sarah K', 27, 'Female'),
('PNR16604B1003', '16604', CURRENT_DATE, 'B1', '9', 'LB', 'Prakash P', 58, 'Male'),
('PNR16604B1004', '16604', CURRENT_DATE, 'B1', '12', 'UB', 'Aisha', 22, 'Female'),
('PNR16604B1005', '16604', CURRENT_DATE, 'B1', '18', 'UB', 'George', 40, 'Male'),
('PNR16604B1006', '16604', CURRENT_DATE, 'B1', '23', 'SL', 'Rajeev', 51, 'Male'),
('PNR16604B1007', '16604', CURRENT_DATE, 'B1', '24', 'SU', 'Sneha', 26, 'Female'),
('PNR16604B1008', '16604', CURRENT_DATE, 'B1', '40', 'MB', 'Anand M', 34, 'Male');


-- ==========================================
-- TRAIN 5: 16307 ALLEPPEY EXP (SLEEPER)
-- ==========================================
-- S1 Coach
INSERT INTO passenger_details (pnr_number, train_no, date, coach, seat_number, berth_type, passenger_name, passenger_age, passenger_gender) VALUES
('PNR16307S1001', '16307', CURRENT_DATE, 'S1', '4', 'LB', 'Madhavan', 61, 'Male'),
('PNR16307S1002', '16307', CURRENT_DATE, 'S1', '5', 'MB', 'Deepa', 55, 'Female'),
('PNR16307S1003', '16307', CURRENT_DATE, 'S1', '11', 'MB', 'Kiran C', 25, 'Male'),
('PNR16307S1004', '16307', CURRENT_DATE, 'S1', '15', 'SL', 'Haris', 29, 'Male'),
('PNR16307S1005', '16307', CURRENT_DATE, 'S1', '21', 'UB', 'Nandini', 32, 'Female'),
('PNR16307S1006', '16307', CURRENT_DATE, 'S1', '25', 'LB', 'Saraswathi', 70, 'Female'),
('PNR16307S1007', '16307', CURRENT_DATE, 'S1', '39', 'UB', 'Varun', 21, 'Male'),
('PNR16307S1008', '16307', CURRENT_DATE, 'S1', '45', 'MB', 'Vidhya', 28, 'Female');
 
