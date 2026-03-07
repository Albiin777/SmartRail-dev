import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ngeolbaurqbjcfczsmdj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nZW9sYmF1cnFiamNmY3pzbWRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1MzkyNTMsImV4cCI6MjA4ODExNTI1M30.OOVRoQzbmCelC5hW6tt1oIESFoBfe-8PlVeEr0g-poc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    console.log("Checking Live Bookings/Passengers...");
    const { data: bookings, error: bErr } = await supabase
        .from('pnr_bookings')
        .select('*')
        .eq('trainNumber', '12622');

    if (bErr) {
        console.error("Fetch error:", bErr);
        return;
    }

    if (!bookings || bookings.length === 0) {
        console.log("No live bookings found for 12622.");
        return;
    }

    const bookingIds = bookings.map(b => b.id);
    const { data: pax, error: pErr } = await supabase
        .from('passengers')
        .select('*')
        .in('bookingId', bookingIds);

    if (pErr) console.error("Passenger error:", pErr);
    else {
        console.log(`Found ${pax?.length || 0} passengers for these bookings.`);
        if (pax?.length > 0) {
            console.log("Sample passenger:", pax[0]);
        }
    }
}
checkData();
