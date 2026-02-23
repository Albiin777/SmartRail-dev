-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PNR Bookings Table
CREATE TABLE public.pnr_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pnr VARCHAR(10) UNIQUE NOT NULL,
    "trainNumber" VARCHAR(10) NOT NULL,
    "journeyDate" DATE NOT NULL,
    "classCode" VARCHAR(5) NOT NULL,
    source VARCHAR(5) NOT NULL,
    destination VARCHAR(5) NOT NULL,
    "fromIndex" INTEGER NOT NULL,  -- For segment overlap logic
    "toIndex" INTEGER NOT NULL,    -- For segment overlap logic
    "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Passengers Table
CREATE TABLE public.passengers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "bookingId" UUID REFERENCES public.pnr_bookings(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    age INTEGER NOT NULL,
    gender VARCHAR(10),
    "seatNumber" VARCHAR(10), -- e.g. "S1-12" or NULL if WL/RAC
    status VARCHAR(5) NOT NULL CHECK (status IN ('CNF', 'RAC', 'WL', 'CAN')),
    "racNumber" INTEGER,      -- e.g. 5 for RAC 5
    "wlNumber" INTEGER,       -- e.g. 10 for WL 10
    "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Indexes for Performance
CREATE INDEX idx_train_date_class ON public.pnr_bookings("trainNumber", "journeyDate", "classCode");
CREATE INDEX idx_pnr ON public.pnr_bookings(pnr);
CREATE INDEX idx_booking_id ON public.passengers("bookingId");
