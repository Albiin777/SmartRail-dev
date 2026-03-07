const supabase = require('../db/supabase');
const { generateUniquePNR } = require('./pnrGenerator');
const { encrypt } = require('../utils/encryption');

// ---------------------------------------------
// IN-MEMORY FALLBACK STORE (used when Supabase is unavailable)
// ---------------------------------------------
const memoryStore = {
    bookings: [],
};

const saveToMemory = (pnr, trainNumber, journeyDate, classCode, source, destination, fromIndex, toIndex, passengers) => {
    memoryStore.bookings.push({ pnr, trainNumber, journeyDate, classCode, source, destination, fromIndex, toIndex, passengers });
};

const getFromMemory = (pnr) => {
    return memoryStore.bookings.find(b => b.pnr === pnr) || null;
};

// Check if Supabase is properly configured
const isSupabaseAvailable = () => {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;
    return !!(url && key && url !== 'MISSING' && key !== 'MISSING');
};

// ---------------------------------------------
// HELPER
// ---------------------------------------------
const getStationIndex = (schedule, stationCode) => {
    return schedule.findIndex(s => s.stationCode === stationCode);
};

const doSegmentsOverlap = (reqFrom, reqTo, existingFrom, existingTo) => {
    return (existingFrom < reqTo && existingTo > reqFrom);
};

// ---------------------------------------------
// CORE SERVICE: Create Booking
// ---------------------------------------------
const createBooking = async ({ trainNumber, journeyDate, classCode, source, destination, passengers, trainSchedule }) => {

    // 0. Determine valid coaches
    let trainId = null;
    let validCoaches = [];

    if (isSupabaseAvailable()) {
        try {
            const { data: trainData } = await supabase
                .from('admin_trains')
                .select('id, name')
                .eq('train_number', String(trainNumber))
                .maybeSingle();

            trainId = trainData ? trainData.id : null;

            if (trainId) {
                const { data: coachData } = await supabase
                    .from('coaches')
                    .select('coach_id')
                    .eq('train_id', trainId)
                    .eq('coach_type', classCode);
                if (coachData && coachData.length > 0) validCoaches = coachData.map(c => c.coach_id);
            }
        } catch (e) {
            console.warn('[BookingService] Supabase train/coach lookup failed:', e.message);
        }
    }

    // Fallback coach IDs
    if (validCoaches.length === 0) {
        if (classCode === '1A') validCoaches = ['H1'];
        else if (classCode === '2A') validCoaches = ['A1', 'A2'];
        else if (classCode === '3A') validCoaches = ['B1', 'B2', 'B3'];
        else if (classCode === 'SL') validCoaches = ['S1', 'S2', 'S3'];
        else if (classCode === 'CC') validCoaches = ['C1'];
        else if (classCode === '2S') validCoaches = ['D1'];
        else validCoaches = ['GS'];
    }

    // 1. Station indexes
    const fromIndex = getStationIndex(trainSchedule, source);
    const toIndex = getStationIndex(trainSchedule, destination);

    if (fromIndex === -1 || toIndex === -1 || fromIndex >= toIndex) {
        throw new Error('Invalid source/destination or route direction.');
    }

    // 2. Fetch existing bookings for seat conflict check
    let existingBookings = [];

    if (isSupabaseAvailable()) {
        try {
            const { data, error } = await supabase
                .from('pnr_bookings')
                .select(`id, fromIndex, toIndex, passengers ( seatNumber, status, racNumber, wlNumber )`)
                .eq('trainNumber', trainNumber)
                .eq('journeyDate', journeyDate)
                .eq('classCode', classCode);

            if (!error && data) existingBookings = data;
        } catch (e) {
            console.warn('[BookingService] Existing bookings query failed, using in-memory:', e.message);
            existingBookings = memoryStore.bookings
                .filter(b => b.trainNumber === trainNumber && b.journeyDate === journeyDate && b.classCode === classCode)
                .map(b => ({ fromIndex: b.fromIndex, toIndex: b.toIndex, passengers: b.passengers }));
        }
    } else {
        existingBookings = memoryStore.bookings
            .filter(b => b.trainNumber === trainNumber && b.journeyDate === journeyDate && b.classCode === classCode)
            .map(b => ({ fromIndex: b.fromIndex, toIndex: b.toIndex, passengers: b.passengers }));
    }

    // 3. Build occupancy
    const occupiedSeats = new Set();
    let currentRACCount = 0;
    let currentWLCount = 0;

    existingBookings.forEach(booking => {
        if (doSegmentsOverlap(fromIndex, toIndex, booking.fromIndex, booking.toIndex)) {
            (booking.passengers || []).forEach(p => {
                if (p.status === 'CNF') occupiedSeats.add(p.seatNumber || p.seatId);
                if (p.status === 'RAC') currentRACCount = Math.max(currentRACCount, p.racNumber || 0);
                if (p.status === 'WL') currentWLCount = Math.max(currentWLCount, p.wlNumber || 0);
            });
        }
    });

    // 4. Limits
    const TOTAL_SEATS = 72;
    const RAC_LIMIT = 10;
    const WL_LIMIT = 20;

    // 5. Generate PNR
    const pnr = await generateUniquePNR(source);

    // 6. Allocate seats
    const passengerRecords = [];

    for (const p of passengers) {
        let status = 'WL';
        let seatNumber = null;
        let racNumber = null;
        let wlNumber = null;

        if (p.seatNumber && p.coachId) {
            status = 'CNF';
            seatNumber = `${p.coachId}-${p.seatNumber}`;
            occupiedSeats.add(seatNumber);
        } else {
            for (const coach of validCoaches) {
                for (let s = 1; s <= TOTAL_SEATS; s++) {
                    const seatId = `${coach}-${s}`;
                    if (!occupiedSeats.has(seatId)) {
                        status = 'CNF';
                        seatNumber = seatId;
                        occupiedSeats.add(seatId);
                        break;
                    }
                }
                if (status === 'CNF') break;
            }

            if (status !== 'CNF') {
                if (currentRACCount < RAC_LIMIT) {
                    status = 'RAC';
                    currentRACCount++;
                    racNumber = currentRACCount;
                } else if (currentWLCount < WL_LIMIT) {
                    status = 'WL';
                    currentWLCount++;
                    wlNumber = currentWLCount;
                } else {
                    throw new Error('Booking Failed: No seats, RAC or Waitlist available.');
                }
            }
        }

        const [coach_id, sNo] = seatNumber ? seatNumber.split('-') : [null, null];

        passengerRecords.push({
            name: p.name,
            age: p.age,
            gender: p.gender,
            status,
            seatNumber,
            seat_no: sNo ? parseInt(sNo, 10) : null,
            coach_id: coach_id || validCoaches[0],
            racNumber,
            wlNumber,
            pnr,
            train_id: trainId,
            journey_date: journeyDate,
            boarding: source,
            destination,
            ticket_class: classCode,
            fare: 1500,
            verified: false,
            aadhar: p.aadhar ? encrypt(p.aadhar) : null
        });
    }

    // 7. Persist — Supabase first, in-memory fallback
    let savedToSupabase = false;

    if (isSupabaseAvailable()) {
        try {
            const { data: bookingData, error: bookingError } = await supabase
                .from('pnr_bookings')
                .insert({ pnr, trainNumber, journeyDate, classCode, source, destination, fromIndex, toIndex })
                .select()
                .single();

            if (!bookingError && bookingData) {
                const passengersToInsert = passengerRecords.map(p => ({ ...p, bookingId: bookingData.id }));
                const { error: passengerError } = await supabase.from('passengers').insert(passengersToInsert);

                if (!passengerError) {
                    savedToSupabase = true;
                } else {
                    await supabase.from('pnr_bookings').delete().eq('id', bookingData.id);
                    console.warn('[BookingService] Passenger insert failed:', passengerError.message);
                }
            } else {
                console.warn('[BookingService] PNR insert failed:', bookingError?.message);
            }
        } catch (e) {
            console.warn('[BookingService] Supabase write error, using in-memory:', e.message);
        }
    }

    if (!savedToSupabase) {
        saveToMemory(pnr, trainNumber, journeyDate, classCode, source, destination, fromIndex, toIndex, passengerRecords);
        console.log(`[BookingService] ✅ Booking saved in-memory. PNR: ${pnr}`);
    }

    return { pnr, status: passengerRecords[0].status, passengers: passengerRecords };
};

// ---------------------------------------------
// CORE SERVICE: Cancel Booking
// ---------------------------------------------
const cancelBooking = async (pnr) => {
    if (isSupabaseAvailable()) {
        try {
            const { data: booking, error } = await supabase
                .from('pnr_bookings')
                .select(`*, passengers(*)`)
                .eq('pnr', pnr)
                .single();

            if (!error && booking) {
                await supabase.from('passengers').delete().eq('bookingId', booking.id);
                await supabase.from('pnr_bookings').delete().eq('id', booking.id);
                return { message: 'Booking Cancelled' };
            }
        } catch (e) {
            console.warn('[BookingService] Supabase cancel failed, trying in-memory:', e.message);
        }
    }

    const idx = memoryStore.bookings.findIndex(b => b.pnr === pnr);
    if (idx !== -1) {
        memoryStore.bookings.splice(idx, 1);
        return { message: 'Booking Cancelled' };
    }

    throw new Error('PNR not found');
};

// ---------------------------------------------
// CORE SERVICE: Get Booking Status
// ---------------------------------------------
const getBookingStatus = async (pnr) => {
    if (isSupabaseAvailable()) {
        try {
            // Check standard bookings first
            const { data: standardData, error: standardError } = await supabase
                .from('pnr_bookings')
                .select(`id, pnr, trainNumber, journeyDate, classCode, source, destination, passengers ( name, age, gender, seatNumber, status, racNumber, wlNumber )`)
                .eq('pnr', pnr)
                .single();

            if (!standardError && standardData) return standardData;

            // Check TTE issued tickets
            const { data: issuedData, error: issuedError } = await supabase
                .from('issued_tickets')
                .select('*, admin_trains(train_number)')
                .eq('pnr', pnr)
                .single();

            if (!issuedError && issuedData) {
                return {
                    id: issuedData.id,
                    pnr: issuedData.pnr,
                    trainNumber: issuedData.admin_trains ? issuedData.admin_trains.train_number : '12622',
                    journeyDate: issuedData.created_at.split('T')[0],
                    classCode: issuedData.ticket_class,
                    source: issuedData.boarding,
                    destination: issuedData.destination,
                    passengers: [{
                        name: issuedData.passenger_name,
                        age: issuedData.age,
                        gender: issuedData.gender,
                        seatNumber: issuedData.coach_id + '-TTE', // Placeholder to show it was issued by TTE
                        status: 'CNF',
                        racNumber: null,
                        wlNumber: null
                    }]
                };
            }

        } catch (e) {
            console.warn('[BookingService] Supabase status lookup failed, trying in-memory:', e.message);
        }
    }

    const booking = getFromMemory(pnr);
    if (booking) return booking;

    throw new Error('PNR not found or server error');
};

module.exports = { createBooking, cancelBooking, getBookingStatus };
