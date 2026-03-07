const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
// Support both SUPABASE_ANON_KEY and SUPABASE_KEY naming conventions
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.warn("⚠️  WARNING: SUPABASE_URL or SUPABASE_ANON_KEY is missing in .env file.");
}

const supabase = createClient(supabaseUrl || 'MISSING', supabaseKey || 'MISSING');

module.exports = supabase;
