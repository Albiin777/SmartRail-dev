import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load variables from frontend env
dotenv.config({ path: path.join(process.cwd(), 'frontend', '.env') });

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function checkTteData() {
    console.log("Checking Admin Trains...");
    const { data: trains, error: tErr } = await supabase.from('admin_trains').select('*');
    if (tErr) console.error("Error trains:", tErr.message);
    else console.log(`Found ${trains?.length || 0} trains.`, trains);

    console.log("\nChecking TTE Passengers...");
    const { data: pax, error: pErr } = await supabase.from('tte_passengers').select('*');
    if (pErr) console.error("Error pax:", pErr.message);
    else console.log(`Found ${pax?.length || 0} passengers.`);
}

checkTteData();
