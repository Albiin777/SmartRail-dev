import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase configuration or Service Role Key.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const users = [
    { email: 'hashlinairah@gmail.com', password: '000000', name: 'Admin Hashly' },
    { email: 'binthalhamza@gmail.com', password: '123456', name: 'TTE 1' },
    { email: 'raishahashly15@gmail.com', password: '123456', name: 'TTE 2' }
];

async function setupUsers() {
    console.log('Registering users in Supabase Auth...');

    for (const u of users) {
        const { data, error } = await supabase.auth.admin.createUser({
            email: u.email,
            password: u.password,
            email_confirm: true,
            user_metadata: { name: u.name }
        });

        if (error) {
            if (error.message.includes('already registered') || error.message.includes('already exists')) {
                console.log(`User ${u.email} already exists. Attempting to update password...`);

                // Attempt password update for existing users
                const { data: usersData, error: getUserErr } = await supabase.auth.admin.listUsers();
                const existing = usersData?.users?.find(x => x.email === u.email);

                if (existing) {
                    const { error: updErr } = await supabase.auth.admin.updateUserById(existing.id, { password: u.password, email_confirm: true });
                    if (updErr) console.error(`Failed to update password for ${u.email}:`, updErr.message);
                    else console.log(`Successfully updated password for ${u.email}`);
                }
            } else {
                console.error(`Error creating ${u.email}:`, error.message);
            }
        } else {
            console.log(`Successfully created user: ${u.email}`);
        }
    }

    console.log('\nAssigning TTE Details to `tte_accounts` table...');
    const tteData = [
        { email: 'binthalhamza@gmail.com', name: 'TTE Binthal', base_station: 'CAN', employee_id: 'TTE001' },
        { email: 'raishahashly15@gmail.com', name: 'TTE Raisha', base_station: 'SRR', employee_id: 'TTE002' }
    ];

    for (const tte of tteData) {
        const { error } = await supabase.from('tte_accounts').upsert({ email: tte.email, ...tte }, { onConflict: 'email' });
        if (error) console.error(`Error putting ${tte.email} into tte_accounts:`, error.message);
        else console.log(`Saved TTE profile info for ${tte.email}`);
    }

    console.log('Setup Complete!');
}

setupUsers();
