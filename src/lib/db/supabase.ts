import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

/**
 * Server-side Supabase client using the service role key.
 * This client bypasses RLS and should ONLY be used in API routes or server components.
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
