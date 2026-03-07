-- ============================================================
-- SmartRail TTE Issued Tickets Setup
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard
-- → your project → SQL Editor → New query
-- ============================================================

CREATE TABLE IF NOT EXISTS public.issued_tickets (
    id bigserial PRIMARY KEY,
    train_id uuid REFERENCES public.admin_trains(id) ON DELETE CASCADE,
    pnr text NOT NULL UNIQUE,
    passenger_name text NOT NULL,
    age integer,
    gender text,
    mobile text,
    id_type text,
    id_number text,
    coach_id text NOT NULL,
    ticket_class text NOT NULL,
    boarding text NOT NULL,
    destination text NOT NULL,
    distance integer,
    fare numeric(10,2) NOT NULL DEFAULT 0,
    payment_method text NOT NULL,
    issued_by text NOT NULL,
    issued_at text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.issued_tickets ENABLE ROW LEVEL SECURITY;

-- Allow authenticated TTEs full access
CREATE POLICY "TTE issued_tickets access" ON public.issued_tickets USING (true) WITH CHECK (true);
