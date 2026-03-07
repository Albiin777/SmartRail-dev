import { createClient } from '@supabase/supabase-js';
import process from 'process';

const supabaseUrl = 'https://ngeolbaurqbjcfczsmdj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nZW9sYmF1cnFiamNmY3pzbWRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1MzkyNTMsImV4cCI6MjA4ODExNTI1M30.OOVRoQzbmCelC5hW6tt1oIESFoBfe-8PlVeEr0g-poc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    const { data: train } = await supabase.from('admin_trains').select('id, train_number').eq('train_number', '12622').maybeSingle();
    console.log("Train:", train);
    if (!train) return;

    const { data: coaches, error } = await supabase.from('coaches').select('*');
    if (error) console.error("Coach error:", error);
    else console.log(`Total coaches in DB:`, coaches?.length);

    const { data: myCoaches } = await supabase.from('coaches').select('*').eq('train_id', train.id);
    console.log(`Coaches for train 12622:`, myCoaches?.length);
    if (myCoaches && myCoaches.length > 0) {
        console.log("Sample coach:", myCoaches[0]);
    }
}
checkData();
