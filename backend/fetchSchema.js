import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;

fetch(`${url}/rest/v1/`, { headers: { 'apikey': key } })
    .then(r => r.json())
    .then(d => {
        if (d.definitions) {
            console.log('Tables:', Object.keys(d.definitions).join(', '));
        } else {
            console.log('No definitions found', d);
        }
    }).catch(console.error);
