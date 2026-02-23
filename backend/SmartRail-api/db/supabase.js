const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.warn("⚠️  WARNING: SUPABASE_URL or SUPABASE_KEY is missing in .env file.");
}

const supabase = createClient(supabaseUrl || 'MISSING', supabaseKey || 'MISSING');

module.exports = supabase;
