-- ============================================================
-- SMARTRAIL FULL DATABASE SETUP SCRIPT
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard
-- Combines: Core App, Bookings, TTE Functions, and Dummy Data
-- ============================================================


-- ============================================================
-- PART 1: CORE APP (Profiles, Complaints & Storage)
-- ============================================================

-- Create the Complaints Table
create table if not exists public.complaints (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  subject text not null,
  description text not null,
  status text default 'open' check (status in ('open', 'in_progress', 'resolved', 'closed')),
  images text[] default '{}',
  created_at timestamptz default now()
);

-- Enable Row Level Security (RLS)
alter table public.complaints enable row level security;

-- Policies for complaints
create policy "Users can insert their own complaints" on public.complaints for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can view their own complaints" on public.complaints for select to authenticated using (auth.uid() = user_id);
create policy "Users can delete their own open complaints" on public.complaints for delete to authenticated using (auth.uid() = user_id and status = 'open');

-- Create Storage Bucket for Evidence
insert into storage.buckets (id, name, public) values ('support-evidence', 'support-evidence', true) on conflict (id) do nothing;

-- Storage Policies
create policy "Authenticated users can upload evidence" on storage.objects for insert to authenticated with check (bucket_id = 'support-evidence');
create policy "Anyone can view evidence" on storage.objects for select to public using (bucket_id = 'support-evidence');
create policy "Authenticated users can delete evidence" on storage.objects for delete to authenticated using (bucket_id = 'support-evidence');

-- Create Profiles Table (Publicly Accessible User Data)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  full_name text,
  dob date,
  gender text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);

-- Trigger to auto-create auth profile
create or replace function public.handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, dob, gender)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', (new.raw_user_meta_data->>'dob')::date, new.raw_user_meta_data->>'gender');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

-- Trigger to auto-update auth profile
create or replace function public.handle_user_update() returns trigger as $$
begin
  update public.profiles set full_name = new.raw_user_meta_data->>'full_name', dob = (new.raw_user_meta_data->>'dob')::date, gender = new.raw_user_meta_data->>'gender', updated_at = now() where id = new.id;
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_updated after update on auth.users for each row execute procedure public.handle_user_update();


-- ============================================================
-- PART 2: BOOKINGS ENGINE
-- ============================================================

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
    "bookingId" uuid REFERENCES public.pnr_bookings(id) ON DELETE CASCADE,
    name text NOT NULL,
    age integer NOT NULL,
    gender text NOT NULL,
    status text NOT NULL, 
    "seatNumber" text,      
    "racNumber" integer,
    "wlNumber" integer,
    berthPreference text,
    aadhar text,          
    created_at timestamptz DEFAULT now()
);

ALTER TABLE public.pnr_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passengers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read PNR" ON public.pnr_bookings FOR SELECT USING (true);
CREATE POLICY "Public Insert PNR" ON public.pnr_bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Read Passengers" ON public.passengers FOR SELECT USING (true);
CREATE POLICY "Public Insert Passengers" ON public.passengers FOR INSERT WITH CHECK (true);


-- ============================================================
-- PART 3: TTE (TRAIN TICKET EXAMINER) ADMINISTRATION
-- ============================================================

CREATE TABLE IF NOT EXISTS public.admin_trains (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    train_number text NOT NULL UNIQUE,
    name text NOT NULL,
    source text NOT NULL,
    destination text NOT NULL,
    departure_time text,
    arrival_time text,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.coaches (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    train_id uuid REFERENCES public.admin_trains(id) ON DELETE CASCADE,
    coach_id text NOT NULL,         
    coach_type text NOT NULL,       
    label text NOT NULL,            
    position integer NOT NULL DEFAULT 1,
    created_at timestamptz DEFAULT now(),
    UNIQUE (train_id, coach_id)
);

CREATE TABLE IF NOT EXISTS public.tte_passengers (
    id bigserial PRIMARY KEY,
    train_id uuid REFERENCES public.admin_trains(id) ON DELETE CASCADE,
    pnr text NOT NULL,
    name text NOT NULL,
    age integer,
    gender text,
    mobile text,
    seat_no integer,
    coach_id text NOT NULL,
    boarding text,
    destination text,
    status text DEFAULT 'Confirmed' CHECK (status IN ('Confirmed', 'RAC', 'Waitlist', 'No-Show')),
    id_proof text,
    ticket_class text,
    verified boolean DEFAULT false,
    verified_at timestamptz,
    flags text[] DEFAULT '{}',
    fare numeric(10,2) DEFAULT 0,
    journey_date date DEFAULT CURRENT_DATE,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.incidents (
    id bigserial PRIMARY KEY,
    train_id uuid REFERENCES public.admin_trains(id) ON DELETE CASCADE,
    type text NOT NULL,
    description text NOT NULL,
    status text DEFAULT 'Active' CHECK (status IN ('Active', 'Resolved')),
    coach text,
    reporter_name text,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.fines (
    id bigserial PRIMARY KEY,
    train_id uuid REFERENCES public.admin_trains(id) ON DELETE CASCADE,
    passenger_name text,
    reason text NOT NULL,
    amount numeric(10,2) NOT NULL,
    coach text,
    receipt_no text,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.verifications (
    id bigserial PRIMARY KEY,
    passenger_id bigint REFERENCES public.tte_passengers(id) ON DELETE CASCADE,
    action text DEFAULT 'verified',
    coach_id text,
    seat_no integer,
    scanned_via text DEFAULT 'manual',
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.no_shows (
    id bigserial PRIMARY KEY,
    passenger_id bigint REFERENCES public.tte_passengers(id) ON DELETE CASCADE,
    train_id uuid REFERENCES public.admin_trains(id) ON DELETE CASCADE,
    coach_id text,
    seat_no integer,
    created_at timestamptz DEFAULT now()
);

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

-- TTE RLS
ALTER TABLE public.tte_passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.no_shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_trains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issued_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "TTE full access" ON public.tte_passengers USING (true) WITH CHECK (true);
CREATE POLICY "TTE incidents access" ON public.incidents USING (true) WITH CHECK (true);
CREATE POLICY "TTE fines access" ON public.fines USING (true) WITH CHECK (true);
CREATE POLICY "TTE verifications access" ON public.verifications USING (true) WITH CHECK (true);
CREATE POLICY "TTE no_shows access" ON public.no_shows USING (true) WITH CHECK (true);
CREATE POLICY "Public read trains" ON public.admin_trains FOR SELECT USING (true);
CREATE POLICY "Public read coaches" ON public.coaches FOR SELECT USING (true);
CREATE POLICY "TTE issued_tickets access" ON public.issued_tickets USING (true) WITH CHECK (true);


-- ============================================================
-- PART 4: DATA SEEDING
-- ============================================================

-- Seed Tamil Nadu SF Express
INSERT INTO public.admin_trains (train_number, name, source, destination, departure_time, arrival_time)
VALUES ('12622', 'Tamil Nadu SF Express', 'Chennai Central', 'New Delhi', '22:00', '06:35')
ON CONFLICT (train_number) DO NOTHING;

-- Seed coaches for Tamil Nadu SF Express
DO $$
DECLARE
    v_train_id uuid;
BEGIN
    SELECT id INTO v_train_id FROM public.admin_trains WHERE train_number = '12622';

    INSERT INTO public.coaches (train_id, coach_id, coach_type, label, position) VALUES
        (v_train_id, 'H1', '1A',  'H1 — First AC',      1),
        (v_train_id, 'A1', '2A',  'A1 — AC 2-Tier',     2),
        (v_train_id, 'A2', '2A',  'A2 — AC 2-Tier',     3),
        (v_train_id, 'B1', '3A',  'B1 — AC 3-Tier',     4),
        (v_train_id, 'B2', '3A',  'B2 — AC 3-Tier',     5),
        (v_train_id, 'B3', '3A',  'B3 — AC 3-Tier',     6),
        (v_train_id, 'B4', '3A',  'B4 — AC 3-Tier',     7),
        (v_train_id, 'S1', 'SL',  'S1 — Sleeper',       8),
        (v_train_id, 'S2', 'SL',  'S2 — Sleeper',       9),
        (v_train_id, 'S3', 'SL',  'S3 — Sleeper',       10),
        (v_train_id, 'S4', 'SL',  'S4 — Sleeper',       11),
        (v_train_id, 'C1', 'CC',  'C1 — Chair Car',     12),
        (v_train_id, 'D1', '2S',  'D1 — 2nd Sitting',   13),
        (v_train_id, 'GS', 'GEN', 'GS — General',       14)
    ON CONFLICT (train_id, coach_id) DO NOTHING;
END $$;

-- Seed function for testing data
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
    v_pnr := substring(md5(random()::text) from 1 for 10);
    
    INSERT INTO public.pnr_bookings (pnr, trainnumber, journeydate, classcode, source, destination, fromindex, toindex)
    VALUES (v_pnr, p_train_number, p_journey_date, p_class_code, p_source, p_destination, 1, 5)
    RETURNING id INTO v_booking_id;

    FOR v_passenger IN SELECT * FROM jsonb_to_recordset(p_passengers) AS x(name text, age int, gender text, status text, seat text)
    LOOP
        INSERT INTO public.passengers (bookingid, name, age, gender, status, seatnumber)
        VALUES (v_booking_id, v_passenger.name, v_passenger.age, v_passenger.gender, v_passenger.status, v_passenger.seat);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Insert bookings
DO $$
DECLARE
    v_date date := CURRENT_DATE + interval '1 day';
BEGIN
    PERFORM seed_kerala_booking('16342', v_date, '3A', 'Thiruvananthapuram Central', 'Ernakulam Town', '[{"name": "Anil Menon", "age": 45, "gender": "Male", "status": "CNF", "seat": "B1-12"}]'::jsonb);
    PERFORM seed_kerala_booking('16629', v_date, 'SL', 'Ernakulam Jn', 'Kozhikode', '[{"name": "Pranav Mohan", "age": 21, "gender": "Male", "status": "CNF", "seat": "S4-45"}]'::jsonb);
    PERFORM seed_kerala_booking('16606', v_date, '2A', 'Thrissur', 'Kannur', '[{"name": "Lakshmi Nair", "age": 58, "gender": "Female", "status": "WL", "seat": null}]'::jsonb);
    
    -- Chart Passengers
    INSERT INTO public.tte_passengers (train_id, pnr, name, age, gender, mobile, coach_id, seat_no, ticket_class, boarding, destination, status)
    SELECT id, 'PNR' || md5(random()::text), 'Vidhya Prakash', 32, 'Female', '9876543210', 'B2', 40, '3A', 'Ernakulam Town', 'Coimbatore', 'Confirmed'
    FROM public.admin_trains LIMIT 1;
END $$;
