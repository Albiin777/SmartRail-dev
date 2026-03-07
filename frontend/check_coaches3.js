import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://ngeolbaurqbjcfczsmdj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nZW9sYmF1cnFiamNmY3pzbWRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1MzkyNTMsImV4cCI6MjA4ODExNTI1M30.OOVRoQzbmCelC5hW6tt1oIESFoBfe-8PlVeEr0g-poc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    const { data: train } = await supabase.from('admin_trains').select('id').eq('train_number', '12622').maybeSingle();
    const { data: myCoaches } = await supabase.from('coaches').select('*').eq('train_id', train.id);
    fs.writeFileSync('coach_data.json', JSON.stringify(myCoaches, null, 2), 'utf8');
}
checkData();
