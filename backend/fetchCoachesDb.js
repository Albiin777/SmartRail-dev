import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(url, key);

async function run() {
    const { data: trains } = await supabase.from('admin_trains').select('id, train_number');
    console.log('Trains:', trains);

    const { data: coaches } = await supabase.from('coaches').select('id, train_id, coach_id');
    console.log('Coaches count:', coaches ? coaches.length : 0);
    console.log('Sample coaches:', coaches ? coaches.slice(0, 5) : null);
}

run();
