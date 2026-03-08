import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(url, key);

async function run() {
    const { data, error } = await supabase.from('passenger_details').select('*');
    console.log('Old Passenger Details Count:', data ? data.length : 0);
    if (data && data.length > 0) {
        console.log('Sample:', data[0]);
    }
}

run();
