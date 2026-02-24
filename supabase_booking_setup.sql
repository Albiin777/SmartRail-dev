-- Aadhar dropped from requirements

-- Verify or create passengers table if it doesn't exist (Backup for clean setup)
CREATE TABLE IF NOT EXISTS public.pnr_bookings (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    pnr text NOT NULL UNIQUE,
    trainNumber text NOT NULL,
    journeyDate date NOT NULL,
    classCode text NOT NULL,
    source text NOT NULL,
    destination text NOT NULL,
    fromIndex integer NOT NULL,
    toIndex integer NOT NULL,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.passengers (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    bookingId uuid REFERENCES public.pnr_bookings(id) ON DELETE CASCADE,
    name text NOT NULL,
    age integer NOT NULL,
    gender text NOT NULL,
    status text NOT NULL, -- CNF, RAC, WL
    seatNumber text,      -- e.g., "S1-12" or "3A-45"
    racNumber integer,
    wlNumber integer,
    berthPreference text,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pnr_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passengers ENABLE ROW LEVEL SECURITY;

-- Policies (Simplified for dev)
CREATE POLICY "Public Read PNR" ON public.pnr_bookings FOR SELECT USING (true);
CREATE POLICY "Public Insert PNR" ON public.pnr_bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Read Passengers" ON public.passengers FOR SELECT USING (true);
CREATE POLICY "Public Insert Passengers" ON public.passengers FOR INSERT WITH CHECK (true);
