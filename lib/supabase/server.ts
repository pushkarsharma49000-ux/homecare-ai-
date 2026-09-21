import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export function getServerSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) throw new Error('Server Supabase credentials are not configured.');
  return createClient(url.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, ''), serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
