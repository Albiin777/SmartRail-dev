import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
    console.log('--- ADMIN TRAINS ---');
    let { data: trains, error: err1 } = await supabase.from('admin_trains').select('*').limit(5);
    console.log(err1 || trains);

    console.log('\n--- TTE ASSIGNMENTS ---');
    let { data: assignments, error: err2 } = await supabase.from('tte_assignments').select('*').limit(5);
    console.log(err2 || assignments);
}

run();
