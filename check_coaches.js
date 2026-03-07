import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), 'frontend', '.env') });

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function checkCoaches() {
    console.log("Checking train 12622...");
    const { data: train } = await supabase.from('admin_trains').select('id').eq('train_number', '12622').single();
    if (!train) {
        console.log("Train 12622 not found");
        return;
    }
    console.log("Train ID:", train.id);

    console.log("Checking coaches...");
    const { data: coaches, error } = await supabase.from('coaches').select('*').eq('train_id', train.id);
    if (error) {
        console.error("Error:", error.message);
    } else {
        console.log(`Found ${coaches.length} coaches:`, coaches.map(c => c.coach_id).join(', '));
    }
}
checkCoaches();
