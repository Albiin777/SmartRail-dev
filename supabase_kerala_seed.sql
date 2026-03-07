-- ============================================================
-- SmartRail Kerala Dummy Data Seed
-- Run this in Supabase SQL Editor: https://ngeolbaurqbjcfczsmdj.supabase.co
-- → your project → SQL Editor → New query
-- ============================================================

-- Function to safely insert a booking and passengers
CREATE OR REPLACE FUNCTION seed_kerala_booking(
    p_train_number text,
    p_journey_date date,
    p_class_code text,
    p_source text,
    p_destination text,
    p_passengers jsonb
) RETURNS void AS $$
DECLARE
    v_booking_id uuid;
    v_pnr text;
    v_passenger record;
BEGIN
    -- Generate pseudo-random PNR based on source and time
    v_pnr := substring(md5(random()::text) from 1 for 10);
    
    -- Insert Booking
    INSERT INTO public.pnr_bookings (pnr, trainnumber, journeydate, classcode, source, destination, fromindex, toindex)
    VALUES (v_pnr, p_train_number, p_journey_date, p_class_code, p_source, p_destination, 1, 5)
    RETURNING id INTO v_booking_id;

    -- Insert Passengers
    FOR v_passenger IN SELECT * FROM jsonb_to_recordset(p_passengers) AS x(name text, age int, gender text, status text, seat text)
    LOOP
        INSERT INTO public.passengers (bookingid, name, age, gender, status, seatnumber)
        VALUES (v_booking_id, v_passenger.name, v_passenger.age, v_passenger.gender, v_passenger.status, v_passenger.seat);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Insert bookings for tomorrow
DO $$
DECLARE
    v_date date := CURRENT_DATE + interval '1 day';
BEGIN
    -- Booking 1: Family from Trivandrum to Ernakulam
    PERFORM seed_kerala_booking(
        '16342', v_date, '3A', 'Thiruvananthapuram Central', 'Ernakulam Town',
        '[
            {"name": "Anil Menon", "age": 45, "gender": "Male", "status": "CNF", "seat": "B1-12"},
            {"name": "Bindu Anil", "age": 41, "gender": "Female", "status": "CNF", "seat": "B1-13"},
            {"name": "Rahul Menon", "age": 16, "gender": "Male", "status": "CNF", "seat": "B1-14"}
        ]'::jsonb
    );

    -- Booking 2: Students heading to Kozhikode
    PERFORM seed_kerala_booking(
        '16629', v_date, 'SL', 'Ernakulam Jn', 'Kozhikode',
        '[
            {"name": "Pranav Mohan", "age": 21, "gender": "Male", "status": "CNF", "seat": "S4-45"},
            {"name": "Vishnu V", "age": 22, "gender": "Male", "status": "CNF", "seat": "S4-46"},
            {"name": "Arjun Das", "age": 21, "gender": "Male", "status": "CNF", "seat": "S4-47"}
        ]'::jsonb
    );

    -- Booking 3: Waitlisted passenger to Kannur
    PERFORM seed_kerala_booking(
        '16606', v_date, '2A', 'Thrissur', 'Kannur',
        '[
            {"name": "Lakshmi Nair", "age": 58, "gender": "Female", "status": "WL", "seat": null}
        ]'::jsonb
    );

    -- Booking 4: Business traveler on Jan Shatabdi
    PERFORM seed_kerala_booking(
        '12082', v_date, 'CC', 'Trivandrum', 'Kozhikode',
        '[
            {"name": "Thomas Kurian", "age": 35, "gender": "Male", "status": "CNF", "seat": "C2-15"}
        ]'::jsonb
    );
    
    -- Booking 5: Group traveling to Mangalore via Kerala
    PERFORM seed_kerala_booking(
        '16604', v_date, 'SL', 'Kollam Jn', 'Mangaluru Central',
        '[
            {"name": "Deepa Balakrishnan", "age": 29, "gender": "Female", "status": "CNF", "seat": "S2-12"},
            {"name": "Sneha R", "age": 28, "gender": "Female", "status": "CNF", "seat": "S2-13"}
        ]'::jsonb
    );
    
    -- Add some TTE passengers directly to tte_passengers chart as well
    -- Assuming admin_trains ID exists for 12622 (Tamil Nadu Express) just for charting visualization
    INSERT INTO public.tte_passengers (train_id, pnr, name, age, gender, mobile, coach_id, seat_no, ticket_class, boarding, destination, status)
    SELECT id, 'PNR' || md5(random()::text), 'Vidhya Prakash', 32, 'Female', '9876543210', 'B2', 40, '3A', 'Ernakulam Towns', 'Coimbatore', 'Confirmed'
    FROM public.admin_trains
    LIMIT 1;
    
    INSERT INTO public.tte_passengers (train_id, pnr, name, age, gender, mobile, coach_id, seat_no, ticket_class, boarding, destination, status)
    SELECT id, 'PNR' || md5(random()::text), 'Mohammad Shafi', 44, 'Male', '9876543211', 'S1', 15, 'SL', 'Aluva', 'Palakkad Jn', 'Confirmed'
    FROM public.admin_trains
    LIMIT 1;

END $$;
