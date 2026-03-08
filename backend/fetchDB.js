import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log('--- TTE ASSIGNMENTS ---');
    let { data: assignments, error: err2 } = await supabase.from('tte_assignments').select('*').limit(5);
    console.log(err2 || assignments);

    console.log('\n--- TTE PASSENGERS ---');
    let { data: pax, error: err3 } = await supabase.from('tte_passengers').select('*').limit(5);
    console.log(err3 || pax);
}

run();
