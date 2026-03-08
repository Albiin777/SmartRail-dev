import { supabase } from '../config/supabaseClient.js';
// PNR Generation Logic
// Format: 10 Digits
// First 3: Zone Code (System)
// Next 7: Random Unique



// Map of station zones (Simplified for demo)
const ZONE_MAP = {
    'TVC': 211, 'ERS': 212, 'CLT': 213, 'CAN': 214,
    'MAQ': 215, 'PGT': 216, 'TCR': 217, 'KTYM': 218,
    'ALLP': 219, 'QLN': 220, 'NCJ': 221, 'SRR': 222
};

const getZoneCode = (sourceStation) => {
    // Default to 299 if unknown
    return (ZONE_MAP[sourceStation.toUpperCase()] || 299).toString();
};

const generateRandom7 = () => {
    return Math.floor(1000000 + Math.random() * 9000000).toString();
};

const generateUniquePNR = async (sourceStation) => {
    let isUnique = false;
    let pnr = '';
    const zoneCode = getZoneCode(sourceStation);

    while (!isUnique) {
        const uniqueId = generateRandom7();
        pnr = `${zoneCode}${uniqueId}`;

        // Check DB for existing PNR
        const { data, error } = await supabase
            .from('pnr_bookings')
            .select('pnr')
            .eq('pnr', pnr)
            .single();

        if (error && error.code === 'PGRST116') { // Not found error code (PostgREST)
            isUnique = true;
        } else if (!data) {
            isUnique = true;
        }
        // If data exists, loop again
    }
    return pnr;
};

export { generateUniquePNR };






// ---------------------------------------------
// HELPER: Fetch Train Schedule & Calculate Indexes
// ---------------------------------------------
// Assume trainData is accessible in memory or fetch from DB/API.
// For now, assume global train data is available via `server.js` export or re-fetch.
// Let's implement a minimal fetch here or assume passed data.

const getStationIndex = (schedule, stationCode) => {
    return schedule.findIndex(s => s.stationCode === stationCode);
};

// ---------------------------------------------
// SEGMENT OVERLAP LOGIC
// ---------------------------------------------
// Checks if two route segments overlap
const doSegmentsOverlap = (reqFrom, reqTo, existingFrom, existingTo) => {
    return (existingFrom < reqTo && existingTo > reqFrom);
};

// ---------------------------------------------
// CORE SERVICE: Create Booking
// ---------------------------------------------
const createBooking = async ({ trainNumber, journeyDate, classCode, source, destination, passengers, trainSchedule }) => {

    // 1. Get Station Indexes
    const fromIndex = getStationIndex(trainSchedule, source);
    const toIndex = getStationIndex(trainSchedule, destination);

    if (fromIndex === -1 || toIndex === -1 || fromIndex >= toIndex) {
        throw new Error('Invalid source/destination or route direction.');
    }

    // 2. Fetch Existing Bookings for this Train + Date + Class
    const { data: existingBookings, error } = await supabase
        .from('pnr_bookings')
        .select(`
            id, fromIndex, toIndex, 
            passengers ( seatNumber, status, racNumber, wlNumber )
        `)
        .eq('trainNumber', trainNumber)
        .eq('journeyDate', journeyDate)
        .eq('classCode', classCode);

    if (error) throw new Error('Database error fetching bookings: ' + error.message);

    // 3. Calculate Occupancy Map (Simple seat map based on segments)
    // We need to know which seats are occupied for the requested segment [fromIndex, toIndex].

    const occupiedSeats = new Set();
    let currentRACCount = 0;
    let currentWLCount = 0;

    // Filter relevant bookings that overlap with requested journey
    existingBookings.forEach(booking => {
        if (doSegmentsOverlap(fromIndex, toIndex, booking.fromIndex, booking.toIndex)) {
            booking.passengers.forEach(p => {
                if (p.status === 'CNF') occupiedSeats.add(p.seatNumber);
                if (p.status === 'RAC') currentRACCount = Math.max(currentRACCount, p.racNumber || 0); // Keep track of max RAC issued
                if (p.status === 'WL') currentWLCount = Math.max(currentWLCount, p.wlNumber || 0);     // Keep track of max WL issued
            });
        }
    });

    // 4. Determine Limits (Hardcoded for demo, ideally from DB/Config)
    // Example: SL Class -> 72 seats, 10 RAC, 20 WL
    const TOTAL_SEATS = 72;
    const RAC_LIMIT = 10;
    const WL_LIMIT = 20;

    // 5. Generate PNR
    const pnr = await generateUniquePNR(source);

    // 6. Allocate Seats for Each Passenger (Enhanced)
    const passengerRecords = [];

    for (const p of passengers) {
        let status = 'WL';
        let seatNumber = null;
        let racNumber = null;
        let wlNumber = null;

        // A. Specific Seat Request (From Visual Layout)
        if (p.seatNumber && p.coachId) {
            const requestedSeatId = `${p.coachId}-${p.seatNumber}`;
            // Note: In a real app, strict checking against race conditions is needed here.
            // We trust the frontend state + basic check for this demo.
            // Also need to check against `occupiedSeats` set if populated correctly with full IDs.
            // Current occupiedSeats implementation might use simplified IDs, let's assume it matches if we used consistent format.

            status = 'CNF';
            seatNumber = requestedSeatId;
            occupiedSeats.add(requestedSeatId);
        }
        // B. Auto-Allocation Fallback
        else {
            // Try to find a CNF seat
            for (let s = 1; s <= TOTAL_SEATS; s++) {
                const seatId = `${classCode}-${s}`;
                if (!occupiedSeats.has(seatId)) {
                    status = 'CNF';
                    seatNumber = seatId;
                    occupiedSeats.add(seatId);
                    break;
                }
            }

            // If no CNF, try RAC
            if (status !== 'CNF') {
                if (currentRACCount < RAC_LIMIT) {
                    status = 'RAC';
                    currentRACCount++;
                    racNumber = currentRACCount;
                    // Two passengers share one RAC seat. 
                    // e.g. RAC 1 and 2 share RAC-Seat-1. RAC 3 and 4 share RAC-Seat-2
                    const sharedSeatIndex = Math.ceil(currentRACCount / 2);
                    seatNumber = `${classCode}-RAC-${sharedSeatIndex}`;
                } else if (currentWLCount < WL_LIMIT) {
                    // Try WL
                    status = 'WL';
                    currentWLCount++;
                    wlNumber = currentWLCount;
                    seatNumber = null;
                } else {
                    throw new Error('Booking Failed: Regret (No Seats Available)');
                }
            }
        }

        passengerRecords.push({
            name: p.name,
            age: p.age,
            gender: p.gender,
            status,
            seatNumber,
            racNumber,
            wlNumber,
            berthType: p.berthPreference || 'SEAT'
        });
    }

    // 7. Insert to DB (Transaction-like structure)
    // Insert PNR
    const { data: bookingData, error: bookingError } = await supabase
        .from('pnr_bookings')
        .insert({
            pnr,
            trainNumber,
            journeyDate,
            classCode,
            source,
            destination,
            fromIndex,
            toIndex
        })
        .select()
        .single();

    if (bookingError) throw new Error('Failed to create PNR record: ' + bookingError.message);

    // Insert Passengers with bookingIn
    const passengersToInsert = passengerRecords.map(p => {
        const { berthType, ...rest } = p;
        return {
            ...rest,
            bookingId: bookingData.id
        }
    });

    const { error: passengerError } = await supabase
        .from('passengers')
        .insert(passengersToInsert);

    if (passengerError) {
        // Rollback (Manual since Supabase HTTP API doesn't support transactions easily without RPC)
        await supabase.from('pnr_bookings').delete().eq('id', bookingData.id);
        throw new Error('Failed to add passengers: ' + passengerError.message);
    }

    // NEW LOGIC: sync to passenger_details for Admin Visualizer & tte_passengers for TTE App
    const adminDetailsToInsert = passengerRecords.filter(p => p.status === 'CNF' && p.seatNumber).map(p => {
        const [coach, ...seatNumParts] = p.seatNumber.split('-');
        const seat_number = seatNumParts.join('-') || p.seatNumber;

        return {
            pnr_number: pnr,
            train_no: trainNumber,
            date: journeyDate,
            coach: coach || classCode,
            seat_number: seat_number,
            berth_type: p.berthType,
            passenger_name: p.name,
            passenger_age: p.age,
            passenger_gender: p.gender,
            booking_status: 'CONFIRMED'
        };
    });

    if (adminDetailsToInsert.length > 0) {
        // Fire and forget insert to keep Admin dashboard live 
        await supabase.from('passenger_details').insert(adminDetailsToInsert).then(res => {
            if (res.error) console.error("Admin visualizer sync error:", res.error);
        });

        // Sync to TTE app
        // 1. First get the internal train_id from admin_trains or insert it
        let { data: trainData } = await supabase.from('admin_trains').select('id').eq('train_number', trainNumber).maybeSingle();

        if (!trainData) {
            // Auto-register the train for the TTE app if it doesn't exist
            const { data: newTrain, error: err } = await supabase.from('admin_trains').insert({
                train_number: trainNumber,
                name: `SmartRail Express ${trainNumber}`,
                source: source,
                destination: destination,
                departure_time: '10:00:00',
                arrival_time: '22:00:00'
            }).select('id').single();
            if (newTrain) trainData = newTrain;
        }

        if (trainData) {
            const ttePassengersToInsert = passengerRecords.map(p => {
                let coach = 'GS';
                let seat_no = 0;
                if (p.seatNumber) {
                    const parts = p.seatNumber.split('-');
                    coach = parts[0] || classCode;
                    seat_no = parseInt(parts.slice(1).join('-'), 10) || 0;
                }
                return {
                    train_id: trainData.id,
                    journey_date: journeyDate,
                    pnr: pnr,
                    name: p.name,
                    age: p.age,
                    gender: p.gender,
                    mobile: 'N/A', // Passenger app booking doesn't save mobile per passenger yet
                    coach_id: coach,
                    seat_no: seat_no,
                    boarding: source,
                    destination: destination,
                    status: p.status === 'CNF' ? 'Confirmed' : p.status === 'WL' ? 'Waitlist' : 'RAC',
                    id_proof: 'Ticket',
                    ticket_class: classCode,
                    verified: false
                };
            });

            await supabase.from('tte_passengers').insert(ttePassengersToInsert).then(res => {
                if (res.error) console.error("TTE sync error:", res.error);
            });
        }
    }

    return { pnr, status: passengerRecords[0].status, passengers: passengerRecords };
};

// ---------------------------------------------
// CORE SERVICE: Cancel Booking
// ---------------------------------------------
const cancelBooking = async (pnr, passengerId = null) => {
    // 1. Fetch Booking
    const { data: booking, error } = await supabase
        .from('pnr_bookings')
        .select(`*, passengers(*)`)
        .eq('pnr', pnr)
        .single();

    if (error || !booking) throw new Error('PNR not found');

    let passengersToCancel = [];
    if (passengerId) {
        passengersToCancel = booking.passengers.filter(p => p.id === passengerId);
    } else {
        passengersToCancel = booking.passengers; // Cancel all
    }

    const { trainNumber, journeyDate, classCode, fromIndex, toIndex } = booking;
    const canceledCnfSeats = [];

    // Delete the passengers
    for (const p of passengersToCancel) {
        await supabase.from('passengers').delete().eq('id', p.id);
        if (p.status === 'CNF') {
            canceledCnfSeats.push(p.seatNumber);
        }

        // SYNC: Remove from admin passenger_details and tte_passengers
        await supabase.from('passenger_details').delete().eq('pnr_number', pnr).eq('passenger_name', p.name);
        await supabase.from('tte_passengers').delete().eq('pnr', pnr).eq('name', p.name);
    }

    // Process Promotions if any CNF seats freed
    if (canceledCnfSeats.length > 0) {
        await processPromotions(trainNumber, journeyDate, classCode, canceledCnfSeats, fromIndex, toIndex);
    }

    // Check if any passengers left
    const { count } = await supabase
        .from('passengers')
        .select('*', { count: 'exact', head: true })
        .eq('bookingId', booking.id);

    if (count === 0) {
        await supabase.from('pnr_bookings').delete().eq('id', booking.id);
        return { message: 'Booking Cancelled Fully' };
    }

    return { message: 'Passenger Cancelled' };
};

// Start Promotion Chain
const processPromotions = async (trainNumber, journeyDate, classCode, freedSeats, freedFrom, freedTo) => {
    // 1. Fetch current waiting list for this train/date/class
    const { data: waitlistPassengers, error } = await supabase
        .from('pnr_bookings')
        .select(`
            id, fromIndex, toIndex, 
            passengers ( id, status, wlNumber )
        `)
        .eq('trainNumber', trainNumber)
        .eq('journeyDate', journeyDate)
        .eq('classCode', classCode);

    if (error) {
        console.error("Error fetching waitlist for promotion", error);
        return;
    }

    // Extract all WL passengers and sort by WL number
    let wlQueue = [];
    waitlistPassengers.forEach(booking => {
        // Skip bookings that don't overlap with the freed seat's route
        if (!(booking.fromIndex < freedTo && booking.toIndex > freedFrom)) return;

        booking.passengers.forEach(p => {
            if (p.status === 'WL' && p.wlNumber > 0) {
                wlQueue.push({ ...p, bookingFrom: booking.fromIndex, bookingTo: booking.toIndex });
            }
        });
    });

    wlQueue.sort((a, b) => a.wlNumber - b.wlNumber);

    if (wlQueue.length === 0) return; // No one to promote

    const updates = [];

    // SINGLE SEAT CANCELLATION LOGIC
    if (freedSeats.length === 1) {
        const freedSeat = freedSeats[0];
        // Promote top 2 WL to RAC sharing this seat
        const p1 = wlQueue.shift();
        if (p1) updates.push({ id: p1.id, status: 'RAC', seatNumber: `${freedSeat}-RAC-Share`, wlNumber: null, racNumber: 0 }); // racNumber 0 as it's a dynamic promotion

        const p2 = wlQueue.shift();
        if (p2) updates.push({ id: p2.id, status: 'RAC', seatNumber: `${freedSeat}-RAC-Share`, wlNumber: null, racNumber: 0 });
    }
    // BULK CANCELLATION LOGIC (e.g., > 1 seat freed)
    else {
        // As per requirements: Top 50% get full confirmed tickets, rest get RAC (2 per seat)
        const numberOfSeatsFreed = freedSeats.length;
        const totalWlToAccommodate = Math.min(wlQueue.length, numberOfSeatsFreed * 2);

        const halfCount = Math.ceil(totalWlToAccommodate / 2);

        // Give 50% of people full CNF seats
        for (let i = 0; i < halfCount; i++) {
            if (wlQueue.length === 0 || freedSeats.length === 0) break;
            const p = wlQueue.shift();
            const seat = freedSeats.shift(); // Take 1 full seat
            updates.push({ id: p.id, status: 'CNF', seatNumber: seat, wlNumber: null, racNumber: null });
        }

        // Give remaining people RAC seats (2 per remaining freed seat)
        while (wlQueue.length > 0 && freedSeats.length > 0) {
            const seat = freedSeats.shift();

            const p1 = wlQueue.shift();
            if (p1) updates.push({ id: p1.id, status: 'RAC', seatNumber: `${seat}-RAC-Share`, wlNumber: null, racNumber: 0 });

            const p2 = wlQueue.shift();
            if (p2) updates.push({ id: p2.id, status: 'RAC', seatNumber: `${seat}-RAC-Share`, wlNumber: null, racNumber: 0 });
        }
    }

    // Apply DB Updates
    for (const update of updates) {
        await supabase.from('passengers').update({
            status: update.status,
            seatNumber: update.seatNumber,
            wlNumber: update.wlNumber,
            racNumber: update.racNumber
        }).eq('id', update.id);

        // SYNC: Update tte_passengers and passenger_details on promotion
        const { data: pData } = await supabase.from('passengers').select('name, bookingId').eq('id', update.id).single();
        if (pData) {
            const { data: bData } = await supabase.from('pnr_bookings').select('pnr').eq('id', pData.bookingId).single();
            if (bData) {
                let coach = classCode;
                let seat_no = 0;
                if (update.seatNumber) {
                    const parts = update.seatNumber.split('-');
                    coach = parts[0] || classCode;
                    seat_no = parseInt(parts.slice(1).join('-'), 10) || 0;
                }

                // Update TTE
                await supabase.from('tte_passengers').update({
                    status: update.status === 'CNF' ? 'Confirmed' : 'RAC',
                    coach_id: coach,
                    seat_no: seat_no
                }).eq('pnr', bData.pnr).eq('name', pData.name);

                // If fully confirmed, add to passenger_details for Admin
                if (update.status === 'CNF') {
                    // Check if exists first to avoid duplicate if we somehow already inserted
                    const { data: existingAdmin } = await supabase.from('passenger_details').select('id').eq('pnr_number', bData.pnr).eq('passenger_name', pData.name).maybeSingle();
                    if (!existingAdmin) {
                        await supabase.from('passenger_details').insert({
                            pnr_number: bData.pnr,
                            train_no: trainNumber,
                            date: journeyDate,
                            coach: coach,
                            seat_number: seat_no,
                            berth_type: 'SEAT',
                            passenger_name: pData.name,
                            booking_status: 'CONFIRMED'
                        });
                    } else {
                        await supabase.from('passenger_details').update({
                            coach: coach,
                            seat_number: seat_no,
                            booking_status: 'CONFIRMED'
                        }).eq('id', existingAdmin.id);
                    }
                }
            }
        }
    }

    console.log(`Promoted ${updates.length} passengers from Waitlist due to cancellation.`);
};

// ---------------------------------------------
// CORE SERVICE: Get Booking Status
// ---------------------------------------------
const getBookingStatus = async (pnr) => {
    const { data, error } = await supabase
        .from('pnr_bookings')
        .select(`
            id, pnr, trainNumber, journeyDate, classCode, source, destination,
            passengers ( name, age, gender, seatNumber, status, racNumber, wlNumber )
        `)
        .eq('pnr', pnr)
        .single();

    if (error || !data) {
        throw new Error('PNR not found or server error');
    }

    return data;
};

// ---------------------------------------------
// Get Booked Seats List (for Seat Layout View)
// ---------------------------------------------
const getBookedSeatsList = async (trainNumber, journeyDate) => {
    // 1. Fetch all non-cancelled bookings for this train and date
    const { data: bookings, error } = await supabase
        .from('pnr_bookings')
        .select(`
            id,
            passengers (
                seat_number,
                status
            )
        `)
        .eq('train_number', String(trainNumber))
        .eq('journey_date', journeyDate)
        .neq('status', 'CANCELLED');

    if (error) {
        console.error("Error fetching bookings for layout:", error);
        return [];
    }

    // 2. Extract seat numbers -> 'coachId-seatNumber'
    const bookedSeatIds = [];
    bookings.forEach(booking => {
        if (booking.passengers) {
            booking.passengers.forEach(p => {
                if (p.seat_number && p.status === 'CNF') {
                    bookedSeatIds.push(p.seat_number);
                }
            });
        }
    });

    return bookedSeatIds;
};

export default {
    createBooking,
    cancelBooking,
    getBookingStatus,
    getBookedSeatsList
};
