import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const VITE_SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://ngeolbaurqbjcfczsmdj.supabase.co';
const VITE_SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nZW9sYmF1cnFiamNmY3pzbWRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1MzkyNTMsImV4cCI6MjA4ODExNTI1M30.OOVRoQzbmCelC5hW6tt1oIESFoBfe-8PlVeEr0g-poc';

const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY);

async function testLogin() {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'tte@gmail.com',
        password: 'password123' // assuming they used something simple, or we just check if it returns "Invalid login credentials"
    });
    console.log("Login Test Result:");
    if (error) {
        console.error("ERROR:", error.message);
    } else {
        console.log("SUCCESS:", data.user.email);
    }
}
testLogin();
