-- Clean up existing mock data for these specific trains to avoid duplicates upon re-running
DELETE FROM passenger_details WHERE train_no IN ('12081', '20632', '16650', '16606', '12695', '16791');
-- 1. Jan Shatabdi Express 12081 (Classes: 2S, CC)
-- 2S coach: D1 (Coach = '2S1')
INSERT INTO passenger_details (pnr_number, passenger_name, passenger_age, passenger_gender, train_no, date, coach, seat_number, berth_type, booking_status) VALUES 
('PNR12081_01', 'Rahul Nair', 34, 'Male', '12081', CURRENT_DATE, '2S1', '12', 'WS', 'CONFIRMED'),
('PNR12081_02', 'Sneha Menon', 28, 'Female', '12081', CURRENT_DATE, '2S1', '13', 'MS', 'CONFIRMED'),
('PNR12081_03', 'Vivek S', 45, 'Male', '12081', CURRENT_DATE, '2S1', '15', 'AS', 'CONFIRMED');
-- CC coach: C1 (Coach = 'CC1')
INSERT INTO passenger_details (pnr_number, passenger_name, passenger_age, passenger_gender, train_no, date, coach, seat_number, berth_type, booking_status) VALUES 
('PNR12081_04', 'Anu Thomas', 31, 'Female', '12081', CURRENT_DATE, 'CC1', '4', 'WS', 'CONFIRMED'),
('PNR12081_05', 'Rohan T', 25, 'Male', '12081', CURRENT_DATE, 'CC1', '5', 'MS', 'CONFIRMED');
-- 2. Vande Bharat Express 20632 (Classes: CC, EC)
-- CC coach: C1 (Coach = 'CC1')
INSERT INTO passenger_details (pnr_number, passenger_name, passenger_age, passenger_gender, train_no, date, coach, seat_number, berth_type, booking_status) VALUES 
('PNR20632_01', 'Arjun K', 29, 'Male', '20632', CURRENT_DATE, 'CC1', '2', 'WS', 'CONFIRMED'),
('PNR20632_02', 'Meera V', 27, 'Female', '20632', CURRENT_DATE, 'CC1', '3', 'MS', 'CONFIRMED');
-- EC coach: E1 (Coach = 'EC1')
INSERT INTO passenger_details (pnr_number, passenger_name, passenger_age, passenger_gender, train_no, date, coach, seat_number, berth_type, booking_status) VALUES 
('PNR20632_03', 'Dr. Suresh', 55, 'Male', '20632', CURRENT_DATE, 'EC1', '1', 'WS', 'CONFIRMED'),
('PNR20632_04', 'Lakshmi S', 50, 'Female', '20632', CURRENT_DATE, 'EC1', '4', 'AS', 'CONFIRMED');
-- 3. Parasuram Express 16650 (Classes: GEN, 2S)
-- GEN coach: GS1
INSERT INTO passenger_details (pnr_number, passenger_name, passenger_age, passenger_gender, train_no, date, coach, seat_number, berth_type, booking_status) VALUES 
('PNR16650_01', 'Aditi Rao', 22, 'Female', '16650', CURRENT_DATE, 'GS1', '10', 'WS', 'CONFIRMED'),
('PNR16650_02', 'George P', 60, 'Male', '16650', CURRENT_DATE, 'GS1', '11', 'MS', 'CONFIRMED');
-- 2S coach: D1 (Coach = '2S1')
INSERT INTO passenger_details (pnr_number, passenger_name, passenger_age, passenger_gender, train_no, date, coach, seat_number, berth_type, booking_status) VALUES 
('PNR16650_03', 'Kiran M', 35, 'Male', '16650', CURRENT_DATE, '2S1', '44', 'WS', 'CONFIRMED');
-- 4. Ernad Express 16606 (Classes: GEN, 2S)
-- GEN coach: GS1
INSERT INTO passenger_details (pnr_number, passenger_name, passenger_age, passenger_gender, train_no, date, coach, seat_number, berth_type, booking_status) VALUES 
('PNR16606_01', 'Sumesh B', 41, 'Male', '16606', CURRENT_DATE, 'GS1', '22', 'WS', 'CONFIRMED'),
('PNR16606_02', 'Neetha S', 38, 'Female', '16606', CURRENT_DATE, 'GS1', '23', 'MS', 'CONFIRMED');
-- 5. Chennai SF Express 12695 (Classes: SL, 3AC)
-- SL coach: S1 (Coach = 'SL1')
INSERT INTO passenger_details (pnr_number, passenger_name, passenger_age, passenger_gender, train_no, date, coach, seat_number, berth_type, booking_status) VALUES 
('PNR12695_01', 'Hari Krishnan', 26, 'Male', '12695', CURRENT_DATE, 'SL1', '1', 'LB', 'CONFIRMED'),
('PNR12695_02', 'Sruti K', 24, 'Female', '12695', CURRENT_DATE, 'SL1', '2', 'MB', 'CONFIRMED'),
('PNR12695_03', 'Ajith M', 31, 'Male', '12695', CURRENT_DATE, 'SL1', '7', 'SL', 'CONFIRMED');
-- 3A coach: B1 (Coach = '3A1')
INSERT INTO passenger_details (pnr_number, passenger_name, passenger_age, passenger_gender, train_no, date, coach, seat_number, berth_type, booking_status) VALUES 
('PNR12695_04', 'Lata Mohan', 58, 'Female', '12695', CURRENT_DATE, '3A1', '10', 'LB', 'CONFIRMED'),
('PNR12695_05', 'Mohan V', 62, 'Male', '12695', CURRENT_DATE, '3A1', '11', 'MB', 'CONFIRMED');

-- 6. Palaruvi Express 16791 (Classes: GEN, SL)
-- SL coach: S1 (Coach = 'SL1')
INSERT INTO passenger_details (pnr_number, passenger_name, passenger_age, passenger_gender, train_no, date, coach, seat_number, berth_type, booking_status) VALUES 
('PNR16791_01', 'Viji P', 33, 'Female', '16791', CURRENT_DATE, 'SL1', '21', 'LB', 'CONFIRMED'),
('PNR16791_02', 'Alex J', 34, 'Male', '16791', CURRENT_DATE, 'SL1', '24', 'UB', 'CONFIRMED');
-- GEN coach: GS1
INSERT INTO passenger_details (pnr_number, passenger_name, passenger_age, passenger_gender, train_no, date, coach, seat_number, berth_type, booking_status) VALUES 
('PNR16791_03', 'Deepu R', 21, 'Male', '16791', CURRENT_DATE, 'GS1', '50', 'WS', 'CONFIRMED');