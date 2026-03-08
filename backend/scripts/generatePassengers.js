import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const layoutDataPath = path.join(__dirname, '../data', 'smartRailTrainsLayout.json');
const coachTypesPath = path.join(__dirname, '../data', 'coachTypes.json');

// Read files
let layouts = [];
let coachTypes = [];
try {
    layouts = JSON.parse(fs.readFileSync(layoutDataPath, 'utf8'));
    coachTypes = JSON.parse(fs.readFileSync(coachTypesPath, 'utf8'));
} catch (e) {
    console.error("Error reading data files:", e.message);
    process.exit(1);
}

// Convert coachTypes to a map
const coachTypesMap = new Map();
coachTypes.forEach(ct => coachTypesMap.set(ct.coachTypeId, ct));

// Mock Data generators
const firstNames = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan', 'Shaurya', 'Atharv', 'Diya', 'Ananya', 'Aadhya', 'Pari', 'Saanvi', 'Avni', 'Aarohi', 'Myra', 'Ira', 'Zara'];
const lastNames = ['Nair', 'Menon', 'Pillai', 'Kurian', 'Verghese', 'Iyer', 'Sharma', 'Patel', 'Singh', 'Kumar', 'Das', 'Roy'];
const genders = ['Male', 'Female', 'Other'];

const generatePNR = () => Math.floor(1000000000 + Math.random() * 9000000000).toString();

const generateBerthSequence = (coachType) => {
    if (!coachType || !coachType.layout?.rowStructure) {
        return Array.from({ length: coachType?.totalSeats || 72 }, () => 'SEAT');
    }
    return coachType.layout.rowStructure.flat().filter(b => b !== 'AISLE');
};

const run = async () => {
    console.log("Locating all active trains...");

    // Generate for next 3 days
    const dates = [];
    for (let i = 0; i < 3; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        dates.push(d.toISOString().split('T')[0]);
    }

    const allRecords = [];

    // For each train in the layout file
    for (const trainLayout of layouts) {
        const trainNo = trainLayout.trainNumber;

        // For each date
        for (const date of dates) {

            // For each coach
            for (const coach of trainLayout.coaches) {
                // Skip engine, unreserved, SLR
                if (['ENGINE', 'UR', 'GS', 'SLR', 'PANTRY'].includes(coach.classCode)) continue;

                const coachTypeInfo = coachTypesMap.get(coach.coachTypeId);
                if (!coachTypeInfo) continue;

                const totalSeats = coachTypeInfo.totalSeats;
                const berthSeq = generateBerthSequence(coachTypeInfo);

                // Determine a random occupancy rate for this coach (e.g. 30% to 95%)
                const occupancyRate = 0.3 + (Math.random() * 0.65);
                const seatsToFill = Math.floor(totalSeats * occupancyRate);

                // Pick random seats
                const allSeatNumbers = Array.from({ length: totalSeats }, (_, i) => i + 1);
                // Shuffle array
                for (let i = allSeatNumbers.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [allSeatNumbers[i], allSeatNumbers[j]] = [allSeatNumbers[j], allSeatNumbers[i]];
                }
                const bookedSeatNumbers = allSeatNumbers.slice(0, seatsToFill);

                // Group people slightly into PNRs (1 to 4 people per PNR)
                let seatsIndex = 0;
                while (seatsIndex < bookedSeatNumbers.length) {
                    const groupSize = Math.min(Math.floor(Math.random() * 4) + 1, bookedSeatNumbers.length - seatsIndex);
                    const pnr = generatePNR();

                    for (let g = 0; g < groupSize; g++) {
                        const seatNum = bookedSeatNumbers[seatsIndex++];
                        const berthType = berthSeq[(seatNum - 1) % berthSeq.length] || 'SEAT';

                        allRecords.push({
                            pnr_number: pnr,
                            train_no: trainNo,
                            date: date,
                            coach: coach.coachId || coach.coachNumber,
                            seat_number: seatNum.toString(),
                            berth_type: berthType,
                            passenger_name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
                            passenger_age: Math.floor(Math.random() * 60) + 12, // 12 to 71
                            passenger_gender: genders[Math.floor(Math.random() * genders.length)],
                            booking_status: 'CONFIRMED'
                        });
                    }
                }
            }
        }
    }

    console.log(`Generated ${allRecords.length} mock passenger records.`);

    // Clear out any old future dates starting from today in passenger_details (for the generated dates)
    console.log(`Clearing existing records for ${dates[0]} to ${dates[dates.length - 1]}...`);
    const { error: delErr } = await supabase
        .from('passenger_details')
        .delete()
        .gte('date', dates[0])
        .lte('date', dates[dates.length - 1]);

    if (delErr) {
        console.error("Deletion failed", delErr);
    }

    console.log("Inserting new mock data to Supabase...");

    // Insert in chunks of 1000 to prevent payload too large errors
    const chunkSize = 1000;
    for (let i = 0; i < allRecords.length; i += chunkSize) {
        const chunk = allRecords.slice(i, i + chunkSize);
        console.log(`Inserting chunk ${i / chunkSize + 1} of ${Math.ceil(allRecords.length / chunkSize)}...`);
        const { error } = await supabase.from('passenger_details').insert(chunk);
        if (error) {
            console.error("Insert error in chunk:", error);
        }
    }

    console.log("Mock data generation successfully completed!");
    process.exit(0);
};

run();
