import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), 'frontend', '.env') });

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function checkLiveBookings() {
    console.log("Checking Live Bookings/Passengers...");
    const { data: bookings, error } = await supabase
        .from('pnr_bookings')
        .select(`
            pnr, trainNumber, source, destination, classCode,
            passengers ( id, name, age, gender, status, seatNumber )
        `)
        .eq('trainNumber', '12622');

    if (error) {
        console.error("Error:", error.message);
    } else {
        console.log(JSON.stringify(bookings, null, 2));
    }
}

checkLiveBookings();
