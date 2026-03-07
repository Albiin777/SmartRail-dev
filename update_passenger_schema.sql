-- Add missing columns to passengers table to match what tte2 and admin portals expect

ALTER TABLE IF EXISTS public.passengers 
ADD COLUMN IF NOT EXISTS pnr text,
ADD COLUMN IF NOT EXISTS train_id uuid, -- Link to admin_trains (we can use uuid assuming admin_trains uses uuid)
ADD COLUMN IF NOT EXISTS journey_date date,
ADD COLUMN IF NOT EXISTS coach_id text,
ADD COLUMN IF NOT EXISTS seat_no integer,
ADD COLUMN IF NOT EXISTS boarding text,
ADD COLUMN IF NOT EXISTS destination text,
ADD COLUMN IF NOT EXISTS ticket_class text,
ADD COLUMN IF NOT EXISTS fare numeric,
ADD COLUMN IF NOT EXISTS verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS flags text[] DEFAULT '{}';

-- Remove old seatNumber text column if we want, or keep it, but we'll use seat_no and coach_id directly
-- ALTER TABLE public.passengers DROP COLUMN IF EXISTS "seatNumber";
