-- 1. Disable RLS for Service Role (Backend) but keep enabled for Anon (Frontend)
-- Backend uses Service Role Key which bypasses RLS automatically.
-- We must restrict Anon Key access.

-- Drop existing insecure policies
DROP POLICY IF EXISTS "Public Read PNR" ON public.pnr_bookings;
DROP POLICY IF EXISTS "Public Insert PNR" ON public.pnr_bookings;
DROP POLICY IF EXISTS "Public Read Passengers" ON public.passengers;
DROP POLICY IF EXISTS "Public Insert Passengers" ON public.passengers;

-- 2. Restrict Access
-- Allow public (anon) users to ONLY insert bookings (via frontend call if needed directly, but our app uses backend API)
-- Since we use Backend API, we can actually disable ALL public access to these tables.
-- The Backend (Service Role) will still have full access.

-- Policy: Allow authenticated users to view bookings they created (Future proofing)
-- First, add user_id column if you have auth
-- ALTER TABLE public.pnr_bookings ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- For now, purely backend-driven app:
-- DENY ALL for public/anon roles is the safest.

CREATE POLICY "Deny Public Read PNR" ON public.pnr_bookings FOR SELECT TO anon USING (false);
CREATE POLICY "Deny Public Insert PNR" ON public.pnr_bookings FOR INSERT TO anon WITH CHECK (false);
CREATE POLICY "Deny Public Update PNR" ON public.pnr_bookings FOR UPDATE TO anon USING (false);
CREATE POLICY "Deny Public Delete PNR" ON public.pnr_bookings FOR DELETE TO anon USING (false);

-- Same for Passengers
CREATE POLICY "Deny Public Read Passengers" ON public.passengers FOR SELECT TO anon USING (false);
CREATE POLICY "Deny Public Insert Passengers" ON public.passengers FOR INSERT TO anon WITH CHECK (false);
CREATE POLICY "Deny Public Update Passengers" ON public.passengers FOR UPDATE TO anon USING (false);
CREATE POLICY "Deny Public Delete Passengers" ON public.passengers FOR DELETE TO anon USING (false);

-- If you want logged-in users to see their own bookings:
-- CREATE POLICY "Users can see own bookings" ON public.pnr_bookings FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- 3. Grant Access to Authenticated Users (Admins/TTE) based on role
-- Assuming you use Supabase Auth and have a 'role' claim or a profiles table with role.
-- For now, relying on Service Role (Backend) is sufficient for Admin/TTE tasks via API.
