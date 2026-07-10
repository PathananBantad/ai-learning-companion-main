import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || ''; // Use SUPABASE_SERVICE_ROLE_KEY if bypassing RLS is needed on the server

if (!supabaseUrl || !supabaseKey) {
  console.warn('Missing Supabase environment variables. Database features will not work until SUPABASE_URL and SUPABASE_ANON_KEY are set in .env.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
