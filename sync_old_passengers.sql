-- ============================================================
-- SQL Script to Migrate Old Passenger Data into TTE Portal
-- Use this to sync bookings made BEFORE you created the TTE tables
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard
-- ============================================================

-- 1. Ensure any trains previously booked but missing from admin_trains are registered
INSERT INTO public.admin_trains (train_number, name, source, destination, departure_time, arrival_time)
SELECT DISTINCT train_no, 'Legacy Train ' || train_no, 'Origin', 'Destination', '10:00:00', '22:00:00'
FROM public.passenger_details
ON CONFLICT (train_number) DO NOTHING;

-- 2. Migrate passengers from passenger_details into tte_passengers
INSERT INTO public.tte_passengers (
    train_id,
    pnr,
    name,
    age,
    gender,
    mobile,
    coach_id,
    seat_no,
    boarding,
    destination,
    status,
    id_proof,
    ticket_class,
    verified,
    journey_date
)
SELECT 
    t.id,
    pd.pnr_number,
    pd.passenger_name,
    pd.passenger_age,
    pd.passenger_gender,
    'N/A',
    COALESCE(pd.coach, 'GS'),
    CAST(COALESCE(NULLIF(regexp_replace(pd.seat_number, '\D', '', 'g'), ''), '0') AS integer),
    'Origin',
    'Destination',
    CASE WHEN pd.booking_status = 'CONFIRMED' THEN 'Confirmed' ELSE 'Waitlist' END,
    'Ticket',
    COALESCE(pd.berth_type, pd.coach, 'GS'),
    false,
    pd.date::date
FROM public.passenger_details pd
JOIN public.admin_trains t ON t.train_number = pd.train_no
WHERE NOT EXISTS (
    SELECT 1 FROM public.tte_passengers tp 
    WHERE tp.pnr = pd.pnr_number 
    AND tp.name = pd.passenger_name
);
