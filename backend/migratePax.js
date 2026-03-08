import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY || key);

async function run() {
    // Fetch passenger_details
    const { data: oldPax, error: e1 } = await supabase.from('passenger_details').select('*');
    if (e1) { console.error('Error fetching old pax', e1); return; }

    if (!oldPax || oldPax.length === 0) {
        console.log('No old passengers found.');
        return;
    }

    // Group by train_no to minimize admin_trains lookups
    const trainNumbers = [...new Set(oldPax.map(p => p.train_no))];
    console.log(`Migrating for trains: ${trainNumbers.join(', ')}`);

    for (const trainNo of trainNumbers) {
        // Find the train in admin_trains (TTE uses this ID)
        let { data: train } = await supabase.from('admin_trains').select('id, train_number').eq('train_number', trainNo).maybeSingle();

        if (!train) {
            console.log(`Admin train ${trainNo} not initialized in setup script yet. Auto-creating basic stub...`);
            const { data: newTrain, error: tErr } = await supabase.from('admin_trains').insert({
                train_number: trainNo,
                name: `Legacy Train ${trainNo}`,
                source: 'Origin',
                destination: 'Destination'
            }).select().single();

            if (tErr) {
                console.error(`Failed to create stub train ${trainNo}:`, tErr);
                continue;
            }
            train = newTrain;
        }

        const paxForTrain = oldPax.filter(p => p.train_no === trainNo);
        console.log(`Preparing ${paxForTrain.length} passengers for train ${trainNo} (${train.id})`);

        const ttePaxToInsert = paxForTrain.map(p => {
            // Parse coach and seat
            let coach = p.coach || 'GS';
            let seatNo = parseInt(p.seat_number, 10) || 0;

            // Fallbacks for missing info
            return {
                train_id: train.id,
                journey_date: p.date || new Date().toISOString().split('T')[0],
                pnr: p.pnr_number || 'UNKNOWN',
                name: p.passenger_name || 'Legacy Passenger',
                age: p.passenger_age || 0,
                gender: p.passenger_gender || 'U',
                mobile: 'N/A',
                coach_id: coach,
                seat_no: seatNo,
                boarding: 'Origin',
                destination: 'Destination',
                status: p.booking_status === 'CONFIRMED' ? 'Confirmed' : 'Waitlist',
                id_proof: 'Ticket',
                ticket_class: p.berth_type || coach,
                verified: false
            };
        });

        console.log('Inserting payload:', ttePaxToInsert[0]);

        // Bulk insert
        const { data: inserted, error: iErr } = await supabase.from('tte_passengers').insert(ttePaxToInsert).select();

        if (iErr) {
            console.error(`Failed to insert for train ${trainNo}:`, JSON.stringify(iErr, null, 2));
        } else {
            console.log(`Successfully migrated ${inserted?.length} passengers for train ${trainNo}!`);
        }
    }
}

run();
