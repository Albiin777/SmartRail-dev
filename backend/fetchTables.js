import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log('--- ALL TABLES ---');
    // Query information_schema.tables using RPC or raw REST if possible
    // Since we use JS SDK, we can't directly query information_schema without a view or rpc.
    // Let's just try to query all potential tables to see which ones error.
    const tables = ['tte_accounts', 'tte_assignments', 'admin_trains', 'passengers', 'pnr_bookings', 'passenger_details', 'tte_passengers'];

    for (const table of tables) {
        const { error } = await supabase.from(table).select('*').limit(1);
        if (error) {
            console.log(`❌ ${table}: ${error.message}`);
        } else {
            console.log(`✅ ${table}: Exists`);
        }
    }
}

run();
