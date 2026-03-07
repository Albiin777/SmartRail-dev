import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://smartrail.jiobase.com';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sbHpxeHljcmh5eXd2c2RxZnJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4OTA3MDEsImV4cCI6MjA4NjQ2NjcwMX0.RyTA23V6ZmekC69n2iQDH65UTjLpsE-aIGNsftS7JHo';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkDb() {
    console.log("Checking admin_trains...");
    const { data: trains, error: tErr } = await supabase.from('admin_trains').select('*').eq('train_number', '12622');
    if (tErr) console.error("Error trains:", tErr.message);
    else console.log(`Found ${trains?.length || 0} trains.`);

    console.log("Checking tte_passengers...");
    const { data: pax, error: pErr } = await supabase.from('tte_passengers').select('*').limit(1);
    if (pErr) console.error("Error pax:", pErr.message);
    else console.log(`Found ${pax?.length || 0} passengers.`);
}

checkDb();
