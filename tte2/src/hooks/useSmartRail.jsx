import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

const SmartRailContext = createContext(null);

/* ──────────────────────────────────────────────────────────
   Indian Railways Coach Classes & Berth Layouts
   ─────────────────────────────────────────────────────────
   1A  (First AC)      → 4/coupe × 6 coupes = 24 berths : LB, UB (2 per side)
   2A  (AC 2-Tier)     → 6/bay × 8 bays    = 48 berths : LB, UB, LB, UB + SL, SU
   3A  (AC 3-Tier)     → 8/bay × 9 bays    = 72 berths : LB, MB, UB, LB, MB, UB + SL, SU
   SL  (Sleeper)       → 8/bay × 9 bays    = 72 berths : same as 3A without AC
   CC  (AC Chair Car)  → 78 seats           : Window, Middle, Aisle × rows
   2S  (Second Sitting) → 108 seats         : bench-style
   GEN (General)       → Unreserved         : no assigned seats
────────────────────────────────────────────────────────── */

const COACH_CONFIGS = {
    '1A': { label: 'First AC', berths: 24, berthsPerBay: 4, bays: 6, bayLabels: ['LB', 'UB', 'LB', 'UB'], hasSide: false, color: '#a855f7' },
    '2A': { label: 'AC 2-Tier', berths: 48, berthsPerBay: 6, bays: 8, bayLabels: ['LB', 'UB', 'LB', 'UB', 'SL', 'SU'], hasSide: true, color: '#3b82f6' },
    '3A': { label: 'AC 3-Tier', berths: 72, berthsPerBay: 8, bays: 9, bayLabels: ['LB', 'MB', 'UB', 'LB', 'MB', 'UB', 'SL', 'SU'], hasSide: true, color: '#22c55e' },
    'SL': { label: 'Sleeper', berths: 72, berthsPerBay: 8, bays: 9, bayLabels: ['LB', 'MB', 'UB', 'LB', 'MB', 'UB', 'SL', 'SU'], hasSide: true, color: '#eab308' },
    'CC': { label: 'AC Chair Car', berths: 78, berthsPerBay: 5, bays: 15, bayLabels: ['W', 'M', 'A', 'A', 'W'], hasSide: false, color: '#06b6d4', isChair: true },
    '2S': { label: '2nd Sitting', berths: 108, berthsPerBay: 6, bays: 18, bayLabels: ['W', 'M', 'A', 'A', 'M', 'W'], hasSide: false, color: '#f97316', isChair: true },
};

/* ── MOCK DATA (fallback when Supabase is unavailable) ── */

const MOCK_COACHES = [
    { id: 'H1', type: '1A', label: 'H1 — First AC' },
    { id: 'A1', type: '2A', label: 'A1 — AC 2-Tier' },
    { id: 'A2', type: '2A', label: 'A2 — AC 2-Tier' },
    { id: 'B1', type: '3A', label: 'B1 — AC 3-Tier' },
    { id: 'B2', type: '3A', label: 'B2 — AC 3-Tier' },
    { id: 'B3', type: '3A', label: 'B3 — AC 3-Tier' },
    { id: 'B4', type: '3A', label: 'B4 — AC 3-Tier' },
    { id: 'S1', type: 'SL', label: 'S1 — Sleeper' },
    { id: 'S2', type: 'SL', label: 'S2 — Sleeper' },
    { id: 'S3', type: 'SL', label: 'S3 — Sleeper' },
    { id: 'S4', type: 'SL', label: 'S4 — Sleeper' },
    { id: 'C1', type: 'CC', label: 'C1 — Chair Car' },
    { id: 'D1', type: '2S', label: 'D1 — 2nd Sitting' },
    { id: 'GS', type: 'GEN', label: 'GS — General' },
];

const MOCK_PASSENGERS = [
    // H1 (1A)
    { id: 101, pnr: '2541800001', name: 'Dr. Arvind Mehta', age: 58, gender: 'Male', mobile: '9810001001', seatNo: 1, coach: 'H1', boarding: 'Chennai Central', destination: 'New Delhi', status: 'Confirmed', idProof: 'Aadhaar', ticketClass: 'First AC', verified: true, flags: [], fare: 5200 },
    { id: 102, pnr: '2541800002', name: 'Mrs. Kavita Mehta', age: 54, gender: 'Female', mobile: '9810001002', seatNo: 2, coach: 'H1', boarding: 'Chennai Central', destination: 'New Delhi', status: 'Confirmed', idProof: 'Passport', ticketClass: 'First AC', verified: true, flags: [], fare: 5200 },
    // A1 (2A)
    { id: 201, pnr: '2541810001', name: 'Col. Ranjit Deshmukh', age: 65, gender: 'Male', mobile: '9820001001', seatNo: 1, coach: 'A1', boarding: 'Chennai Central', destination: 'New Delhi', status: 'Confirmed', idProof: 'Aadhaar', ticketClass: 'AC 2-Tier', verified: false, flags: ['senior'], fare: 3150 },
    { id: 202, pnr: '2541810002', name: 'Ananya Krishnan', age: 27, gender: 'Female', mobile: '9820001002', seatNo: 5, coach: 'A1', boarding: 'Chennai Central', destination: 'Nagpur Jn', status: 'Confirmed', idProof: 'Passport', ticketClass: 'AC 2-Tier', verified: false, flags: [], fare: 2420 },
    { id: 203, pnr: '2541810003', name: 'Harish Chandra', age: 48, gender: 'Male', mobile: '9820001003', seatNo: 10, coach: 'A1', boarding: 'Vijayawada Jn', destination: 'Bhopal Jn', status: 'Confirmed', idProof: 'PAN Card', ticketClass: 'AC 2-Tier', verified: false, flags: [], fare: 1800 },
    // B1 (3A) — main coach for TTE
    { id: 1, pnr: '2541876230', name: 'Rajesh Kumar', age: 62, gender: 'Male', mobile: '9876543210', seatNo: 1, coach: 'B1', boarding: 'Chennai Central', destination: 'New Delhi', status: 'Confirmed', idProof: 'Aadhaar', ticketClass: 'AC 3-Tier', verified: false, flags: ['senior'], fare: 1850 },
    { id: 2, pnr: '2541876231', name: 'Priya Sharma', age: 28, gender: 'Female', mobile: '9876543211', seatNo: 2, coach: 'B1', boarding: 'Chennai Central', destination: 'Nagpur Jn', status: 'Confirmed', idProof: 'Passport', ticketClass: 'AC 3-Tier', verified: true, flags: [], fare: 1420 },
    { id: 3, pnr: '2541876232', name: 'Amit Patel', age: 45, gender: 'Male', mobile: '9876543212', seatNo: 4, coach: 'B1', boarding: 'Chennai Central', destination: 'Bhopal Jn', status: 'Confirmed', idProof: 'Voter ID', ticketClass: 'AC 3-Tier', verified: false, flags: [], fare: 1650 },
    { id: 4, pnr: '2541876233', name: 'Sunita Devi', age: 70, gender: 'Female', mobile: '9876543213', seatNo: 9, coach: 'B1', boarding: 'Chennai Central', destination: 'New Delhi', status: 'Confirmed', idProof: 'Aadhaar', ticketClass: 'AC 3-Tier', verified: true, flags: ['senior', 'medical'], fare: 1850 },
    { id: 5, pnr: '4832971045', name: 'Vikram Singh', age: 35, gender: 'Male', mobile: '9876543214', seatNo: 15, coach: 'B1', boarding: 'Vijayawada Jn', destination: 'New Delhi', status: 'Waitlist', idProof: 'Driving License', ticketClass: 'AC 3-Tier', verified: false, flags: [], fare: 1650 },
    { id: 6, pnr: '4832971046', name: 'Meena Kumari', age: 32, gender: 'Female', mobile: '9876543215', seatNo: 17, coach: 'B1', boarding: 'Vijayawada Jn', destination: 'Bhopal Jn', status: 'Confirmed', idProof: 'Aadhaar', ticketClass: 'AC 3-Tier', verified: false, flags: ['pregnant'], fare: 1200 },
    { id: 7, pnr: '4832971047', name: 'Rohit Gupta', age: 24, gender: 'Male', mobile: '9876543216', seatNo: 19, coach: 'B1', boarding: 'Chennai Central', destination: 'Agra Cantt', status: 'Confirmed', idProof: 'PAN Card', ticketClass: 'AC 3-Tier', verified: true, flags: [], fare: 1780 },
    { id: 8, pnr: '6729384501', name: 'Fatima Begum', age: 55, gender: 'Female', mobile: '9876543217', seatNo: 20, coach: 'B1', boarding: 'Nagpur Jn', destination: 'New Delhi', status: 'Confirmed', idProof: 'Aadhaar', ticketClass: 'AC 3-Tier', verified: false, flags: [], fare: 1100 },
    { id: 9, pnr: '6729384502', name: 'Suresh Reddy', age: 50, gender: 'Male', mobile: '9876543218', seatNo: 23, coach: 'B1', boarding: 'Vijayawada Jn', destination: 'Jhansi Jn', status: 'RAC', idProof: 'Voter ID', ticketClass: 'AC 3-Tier', verified: false, flags: [], fare: 1350 },
    { id: 10, pnr: '6729384503', name: 'Deepa Nair', age: 29, gender: 'Female', mobile: '9876543219', seatNo: 25, coach: 'B1', boarding: 'Chennai Central', destination: 'Gwalior Jn', status: 'Confirmed', idProof: 'Passport', ticketClass: 'AC 3-Tier', verified: true, flags: [], fare: 1750 },
    { id: 11, pnr: '8123456789', name: 'Karan Mehta', age: 42, gender: 'Male', mobile: '9876543220', seatNo: 30, coach: 'B1', boarding: 'Nagpur Jn', destination: 'New Delhi', status: 'Waitlist', idProof: 'Aadhaar', ticketClass: 'AC 3-Tier', verified: false, flags: ['blacklisted'], fare: 1100 },
    { id: 12, pnr: '8123456790', name: 'Lakshmi Iyer', age: 67, gender: 'Female', mobile: '9876543221', seatNo: 33, coach: 'B1', boarding: 'Chennai Central', destination: 'New Delhi', status: 'Confirmed', idProof: 'Aadhaar', ticketClass: 'AC 3-Tier', verified: false, flags: ['senior'], fare: 1850 },
    { id: 13, pnr: '8123456791', name: 'Anil Verma', age: 38, gender: 'Male', mobile: '9876543222', seatNo: 36, coach: 'B1', boarding: 'Bhopal Jn', destination: 'Agra Cantt', status: 'Confirmed', idProof: 'Driving License', ticketClass: 'AC 3-Tier', verified: false, flags: [], fare: 680 },
    { id: 14, pnr: '8123456792', name: 'Geeta Pandey', age: 44, gender: 'Female', mobile: '9876543223', seatNo: 41, coach: 'B1', boarding: 'Chennai Central', destination: 'Jhansi Jn', status: 'Confirmed', idProof: 'Aadhaar', ticketClass: 'AC 3-Tier', verified: false, flags: [], fare: 1550 },
    { id: 15, pnr: '8123456793', name: 'Mohan Das', age: 72, gender: 'Male', mobile: '9876543224', seatNo: 49, coach: 'B1', boarding: 'Chennai Central', destination: 'New Delhi', status: 'Confirmed', idProof: 'Voter ID', ticketClass: 'AC 3-Tier', verified: false, flags: ['senior'], fare: 1850 },
    { id: 16, pnr: '8123456794', name: 'Rekha Saxena', age: 31, gender: 'Female', mobile: '9876543225', seatNo: 55, coach: 'B1', boarding: 'Vijayawada Jn', destination: 'Nagpur Jn', status: 'RAC', idProof: 'Aadhaar', ticketClass: 'AC 3-Tier', verified: false, flags: [], fare: 780 },
    { id: 17, pnr: '8123456795', name: 'Prakash Joshi', age: 58, gender: 'Male', mobile: '9876543226', seatNo: 57, coach: 'B1', boarding: 'Chennai Central', destination: 'New Delhi', status: 'Confirmed', idProof: 'PAN Card', ticketClass: 'AC 3-Tier', verified: false, flags: [], fare: 1850 },
    { id: 18, pnr: '8123456796', name: 'Nandini Rao', age: 26, gender: 'Female', mobile: '9876543227', seatNo: 65, coach: 'B1', boarding: 'Nagpur Jn', destination: 'Agra Cantt', status: 'Confirmed', idProof: 'Passport', ticketClass: 'AC 3-Tier', verified: true, flags: [], fare: 890 },
    // S1 (Sleeper)
    { id: 301, pnr: '2541820001', name: 'Ramesh Yadav', age: 34, gender: 'Male', mobile: '9830001001', seatNo: 3, coach: 'S1', boarding: 'Chennai Central', destination: 'Nagpur Jn', status: 'Confirmed', idProof: 'Aadhaar', ticketClass: 'Sleeper', verified: false, flags: [], fare: 520 },
    { id: 302, pnr: '2541820002', name: 'Pooja Bhatt', age: 22, gender: 'Female', mobile: '9830001002', seatNo: 8, coach: 'S1', boarding: 'Chennai Central', destination: 'Bhopal Jn', status: 'Confirmed', idProof: 'Voter ID', ticketClass: 'Sleeper', verified: false, flags: [], fare: 620 },
    { id: 303, pnr: '2541820003', name: 'Shankar Pillai', age: 61, gender: 'Male', mobile: '9830001003', seatNo: 17, coach: 'S1', boarding: 'Vijayawada Jn', destination: 'New Delhi', status: 'Confirmed', idProof: 'Aadhaar', ticketClass: 'Sleeper', verified: false, flags: ['senior'], fare: 680 },
    // C1 (Chair Car)
    { id: 401, pnr: '2541830001', name: 'Nitin Desai', age: 30, gender: 'Male', mobile: '9840001001', seatNo: 5, coach: 'C1', boarding: 'Chennai Central', destination: 'Vijayawada Jn', status: 'Confirmed', idProof: 'PAN Card', ticketClass: 'Chair Car', verified: false, flags: [], fare: 780 },
    { id: 402, pnr: '2541830002', name: 'Swati Kulkarni', age: 35, gender: 'Female', mobile: '9840001002', seatNo: 12, coach: 'C1', boarding: 'Chennai Central', destination: 'Vijayawada Jn', status: 'Confirmed', idProof: 'Aadhaar', ticketClass: 'Chair Car', verified: false, flags: [], fare: 780 },
];

const MOCK_INCIDENTS = [
    { id: 1, type: 'Medical', description: 'Passenger feeling chest pain in Coach B2', status: 'Active', time: '14:30', coach: 'B2', reporter: 'TTE Arun Prasad' },
    { id: 2, type: 'Security', description: 'Unattended bag in Coach S2 upper berth', status: 'Resolved', time: '11:15', coach: 'S2', reporter: 'Co-passenger' },
];

const MOCK_FINES = [
    { id: 1, passenger: 'Unknown Male', reason: 'No ticket', amount: 500, method: 'Cash', time: '10:30', receipt: 'FN-001' },
    { id: 2, passenger: 'Ravi Kumar', reason: 'Wrong class (SL ticket in AC 3-Tier)', amount: 750, method: 'UPI', time: '12:45', receipt: 'FN-002' },
];

/* ── Utility functions ── */

const getBerthLabel = (num, coachType) => {
    const cfg = COACH_CONFIGS[coachType];
    if (!cfg) return '—';
    const pos = ((num - 1) % cfg.berthsPerBay);
    return cfg.bayLabels[pos] || '—';
};

const getBerthFull = (num, coachType) => {
    const short = getBerthLabel(num, coachType);
    const map = { LB: 'Lower Berth', MB: 'Middle Berth', UB: 'Upper Berth', SL: 'Side Lower', SU: 'Side Upper', W: 'Window', M: 'Middle', A: 'Aisle' };
    return map[short] || short;
};

const getBay = (num, coachType) => {
    const cfg = COACH_CONFIGS[coachType];
    if (!cfg) return 1;
    return Math.ceil(num / cfg.berthsPerBay);
};

const isSideBerth = (num, coachType) => {
    const cfg = COACH_CONFIGS[coachType];
    if (!cfg || !cfg.hasSide) return false;
    const pos = ((num - 1) % cfg.berthsPerBay);
    return pos >= (cfg.berthsPerBay - 2);
};

/* Build seats for a given coach */
function buildCoachSeats(coachId, coachType, passengerList) {
    const cfg = COACH_CONFIGS[coachType];
    if (!cfg) return [];
    const coachPassengers = passengerList.filter(p => p.coach === coachId);
    return Array.from({ length: cfg.berths }, (_, i) => {
        const num = i + 1;
        const passenger = coachPassengers.find(p => p.seatNo === num);
        let status = 'available';
        if (passenger) {
            if (passenger.status === 'Confirmed') status = 'booked';
            else if (passenger.status === 'RAC') status = 'rac';
            else if (passenger.status === 'Waitlist') status = 'waitlist';
        }
        return {
            number: num,
            bay: getBay(num, coachType),
            type: getBerthFull(num, coachType),
            typeShort: getBerthLabel(num, coachType),
            isSide: isSideBerth(num, coachType),
            status,
            passenger: passenger || null,
        };
    });
}

/* Real Tamil Nadu SF Express stops */
const STATIONS = [
    'Chennai Central', 'Perambur', 'Arakkonam Jn', 'Renigunta Jn',
    'Vijayawada Jn', 'Warangal', 'Nagpur Jn', 'Bhopal Jn',
    'Jhansi Jn', 'Gwalior Jn', 'Agra Cantt', 'New Delhi',
];

/* ══════════════════════════════════════════════
   PROVIDER — Supabase-first, mock data fallback
   ══════════════════════════════════════════════ */

export function SmartRailProvider({ children }) {
    const [time, setTime] = useState(new Date());
    const [stationIndex, setStationIndex] = useState(4);
    const [selectedCoach, setSelectedCoach] = useState('B1');
    const [passengers, setPassengers] = useState(MOCK_PASSENGERS);
    const [coaches, setCoaches] = useState(MOCK_COACHES);
    const [incidents, setIncidents] = useState(MOCK_INCIDENTS);
    const [fines, setFines] = useState(MOCK_FINES);
    const [dataSource, setDataSource] = useState('mock'); // 'supabase' or 'mock'
    const [loading, setLoading] = useState(true);
    const [trainId, setTrainId] = useState(null);
    const [logs, setLogs] = useState([
        { time: '15:02', action: 'Passenger Priya Sharma verified — Berth 2 (MB), Coach B1, Bay 1', type: 'verify' },
        { time: '14:58', action: 'Station arrival: Vijayawada Jn', type: 'station' },
        { time: '14:30', action: 'Medical emergency reported in Coach B2', type: 'incident' },
        { time: '12:45', action: 'Fine ₹750: Wrong class — Ravi Kumar', type: 'fine' },
        { time: '10:30', action: 'Ticketless travel fine ₹500', type: 'fine' },
        { time: '09:15', action: 'Journey started from Chennai Central', type: 'station' },
    ]);

    // Clock
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // ── Try loading from Supabase on mount ──
    useEffect(() => {
        async function loadFromSupabase() {
            if (!supabase) {
                console.log('SmartRail: No Supabase client — using mock data');
                setDataSource('mock');
                setLoading(false);
                return;
            }

            try {
                // 1. Find the train (Tamil Nadu Express 12622)
                const { data: trainData, error: trainErr } = await supabase
                    .from('admin_trains')
                    .select('id, train_number, name')
                    .eq('train_number', '12622')
                    .maybeSingle();

                if (trainErr || !trainData) {
                    console.log('SmartRail: Train not found in Supabase — using mock data');
                    setDataSource('mock');
                    setLoading(false);
                    return;
                }

                setTrainId(trainData.id);

                // 2. Load coaches
                const { data: coachData } = await supabase
                    .from('coaches')
                    .select('*')
                    .eq('train_id', trainData.id)
                    .order('position');

                if (coachData && coachData.length > 0) {
                    const mapped = coachData.map(c => ({
                        id: c.coach_id,
                        type: c.coach_type,
                        label: c.label,
                        dbId: c.id,
                    }));
                    setCoaches(mapped);
                }

                // 3. Load passengers
                const today = new Date().toISOString().split('T')[0];
                const { data: paxData } = await supabase
                    .from('passengers')
                    .select('*')
                    .eq('train_id', trainData.id)
                    .eq('journey_date', today);

                if (paxData && paxData.length > 0) {
                    const mapped = paxData.map(p => ({
                        id: p.id,
                        pnr: p.pnr,
                        name: p.name,
                        age: p.age,
                        gender: p.gender,
                        mobile: p.mobile,
                        seatNo: p.seat_no,
                        coach: p.coach_id,
                        boarding: p.boarding,
                        destination: p.destination,
                        status: p.status,
                        idProof: p.id_proof,
                        ticketClass: p.ticket_class,
                        verified: p.verified,
                        flags: p.flags || [],
                        fare: parseFloat(p.fare) || 0,
                    }));
                    setPassengers(mapped);
                    setDataSource('supabase');
                    console.log(`SmartRail: Loaded ${mapped.length} passengers from Supabase`);
                } else {
                    console.log('SmartRail: No passengers in Supabase for today — using mock data');
                    setDataSource('mock');
                }

                // 4. Load incidents
                const { data: incData } = await supabase
                    .from('incidents')
                    .select('*')
                    .eq('train_id', trainData.id)
                    .order('created_at', { ascending: false });

                if (incData && incData.length > 0) {
                    const mapped = incData.map(i => ({
                        id: i.id,
                        type: i.type,
                        description: i.description,
                        status: i.status,
                        time: new Date(i.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                        coach: i.coach,
                        reporter: i.reporter_name || 'TTE',
                    }));
                    setIncidents(mapped);
                }

                // 5. Load fines
                const { data: fineData } = await supabase
                    .from('fines')
                    .select('*')
                    .eq('train_id', trainData.id)
                    .order('created_at', { ascending: false });

                if (fineData && fineData.length > 0) {
                    const mapped = fineData.map(f => ({
                        id: f.id,
                        passenger: f.passenger_name || 'Unknown',
                        reason: f.reason,
                        amount: parseFloat(f.amount),
                        method: 'Cash',
                        time: new Date(f.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                        receipt: f.receipt_no || `FN-${String(f.id).slice(0, 3)}`,
                    }));
                    setFines(mapped);
                }

            } catch (err) {
                console.error('SmartRail: Supabase error — falling back to mock data', err);
                setDataSource('mock');
            } finally {
                setLoading(false);
            }
        }

        loadFromSupabase();
    }, []);

    // Current coach info
    const currentCoachObj = coaches.find(c => c.id === selectedCoach);
    const currentCoachType = currentCoachObj?.type || '3A';
    const currentConfig = COACH_CONFIGS[currentCoachType];
    const seats = buildCoachSeats(selectedCoach, currentCoachType, passengers);

    // Stats for current coach
    const coachPassengers = passengers.filter(p => p.coach === selectedCoach);
    const confirmed = coachPassengers.filter(p => p.status === 'Confirmed').length;
    const rac = coachPassengers.filter(p => p.status === 'RAC').length;
    const waitlist = coachPassengers.filter(p => p.status === 'Waitlist').length;
    const verified = coachPassengers.filter(p => p.verified).length;
    const totalSeats = currentConfig?.berths || 72;
    const booked = confirmed + rac;

    const stats = {
        totalSeats,
        booked,
        vacant: totalSeats - booked,
        rac,
        waitlist,
        noShows: passengers.filter(p => p.status === 'No-Show').length,
        fineCollected: fines.reduce((sum, f) => sum + f.amount, 0),
        totalPassengers: coachPassengers.length,
        verified,
        unverified: coachPassengers.length - verified,
    };

    const tteInfo = {
        name: 'Arun Prasad',
        id: 'TTE-4521',
        trainNo: '12622',
        trainName: 'Tamil Nadu SF Express',
        route: 'Chennai Central → New Delhi',
        source: 'MAS (Chennai Central)',
        destination: 'NDLS (New Delhi)',
        date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        departure: '22:00',
        arrival: '06:35 +1',
        duration: '32h 35m',
        shift: '06:00 — 22:00',
        coach: selectedCoach,
        coachType: currentCoachType,
        coachLabel: currentCoachObj?.label || selectedCoach,
        zone: 'Southern Railway',
        division: 'Chennai Division',
        rakeType: 'LHB',
        pantryAvailable: 'Yes (Coach PC)',
        dataSource, // expose which data source is active
    };

    const addLog = (action, type = 'info') => {
        const t = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        setLogs(prev => [{ time: t, action, type }, ...prev]);
    };

    // ── CRUD Operations (Supabase + local state) ──

    const verifyPassenger = useCallback(async (id) => {
        // Always update local state first (optimistic)
        setPassengers(prev => prev.map(p => p.id === id ? { ...p, verified: true } : p));
        const p = passengers.find(x => x.id === id);
        if (p) addLog(`Verified: ${p.name} — Berth ${p.seatNo} (${getBerthLabel(p.seatNo, currentCoachType)}), Coach ${p.coach}`, 'verify');

        // Persist to Supabase if connected
        if (supabase && dataSource === 'supabase') {
            try {
                await supabase.from('passengers').update({ verified: true, verified_at: new Date().toISOString() }).eq('id', id);
                await supabase.from('verifications').insert({
                    passenger_id: id,
                    action: 'verified',
                    coach_id: p?.coach,
                    seat_no: p?.seatNo,
                    scanned_via: 'manual',
                });
            } catch (err) {
                console.error('Supabase verify error:', err);
            }
        }
    }, [passengers, dataSource, currentCoachType]);

    const markNoShow = useCallback(async (id) => {
        setPassengers(prev => prev.map(p => p.id === id ? { ...p, status: 'No-Show' } : p));
        const p = passengers.find(x => x.id === id);
        if (p) addLog(`No-show: ${p.name} — Berth ${p.seatNo}, Coach ${p.coach}`, 'noshow');

        if (supabase && dataSource === 'supabase') {
            try {
                await supabase.from('passengers').update({ status: 'No-Show' }).eq('id', id);
                await supabase.from('no_shows').insert({
                    passenger_id: id,
                    train_id: trainId,
                    coach_id: p?.coach,
                    seat_no: p?.seatNo,
                });
            } catch (err) {
                console.error('Supabase no-show error:', err);
            }
        }
    }, [passengers, dataSource, trainId]);

    const addFine = useCallback(async (fine) => {
        const newFine = { ...fine, id: fines.length + 1, receipt: `FN-${String(fines.length + 1).padStart(3, '0')}` };
        setFines(prev => [...prev, newFine]);
        addLog(`Fine ₹${fine.amount}: ${fine.reason}`, 'fine');

        if (supabase && dataSource === 'supabase') {
            try {
                await supabase.from('fines').insert({
                    train_id: trainId,
                    passenger_name: fine.passenger,
                    reason: fine.reason,
                    amount: fine.amount,
                    coach: fine.coach || selectedCoach,
                    receipt_no: newFine.receipt,
                });
            } catch (err) {
                console.error('Supabase fine error:', err);
            }
        }
    }, [fines, dataSource, trainId, selectedCoach]);

    const addIncident = useCallback(async (incident) => {
        const newInc = { ...incident, id: incidents.length + 1, status: 'Active', time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) };
        setIncidents(prev => [...prev, newInc]);
        addLog(`Incident: ${incident.type} — ${incident.description}`, 'incident');

        if (supabase && dataSource === 'supabase') {
            try {
                await supabase.from('incidents').insert({
                    train_id: trainId,
                    type: incident.type,
                    description: incident.description,
                    coach: incident.coach || selectedCoach,
                    reporter_name: 'TTE Arun Prasad',
                });
            } catch (err) {
                console.error('Supabase incident error:', err);
            }
        }
    }, [incidents, dataSource, trainId, selectedCoach]);

    const upgradeRAC = useCallback(async (id) => {
        setPassengers(prev => prev.map(p => p.id === id ? { ...p, status: 'Confirmed' } : p));
        const p = passengers.find(x => x.id === id);
        if (p) addLog(`RAC Upgraded: ${p.name} — Berth ${p.seatNo}, Coach ${p.coach} → Confirmed`, 'verify');

        if (supabase && dataSource === 'supabase') {
            try {
                await supabase.from('passengers').update({ status: 'Confirmed' }).eq('id', id);
            } catch (err) {
                console.error('Supabase RAC upgrade error:', err);
            }
        }
    }, [passengers, dataSource]);

    const nextStation = () => {
        if (stationIndex < STATIONS.length - 1) {
            setStationIndex(prev => prev + 1);
            addLog(`Arrived at ${STATIONS[stationIndex + 1]}`, 'station');
        }
    };

    const value = {
        time, stats, tteInfo, passengers: coachPassengers, allPassengers: passengers, seats, incidents, fines, logs, stationIndex,
        stations: STATIONS, currentStation: STATIONS[stationIndex],
        coaches, coachConfigs: COACH_CONFIGS, selectedCoach, setSelectedCoach,
        currentCoachType, currentConfig,
        verifyPassenger, markNoShow, upgradeRAC, addFine, addIncident, nextStation, addLog,
        setPassengers, getBerthLabel, getBerthFull, getBay, isSideBerth,
        dataSource, loading, trainId,
    };

    return <SmartRailContext.Provider value={value}>{children}</SmartRailContext.Provider>;
}

export function useSmartRail() {
    const ctx = useContext(SmartRailContext);
    if (!ctx) throw new Error('useSmartRail must be used within SmartRailProvider');
    return ctx;
}
