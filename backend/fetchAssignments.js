import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(url, key);

async function run() {
    const { data } = await supabase.from('tte_assignments').select('*');
    console.log(JSON.stringify(data, null, 2));
}

run();
