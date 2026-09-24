import type { SupabaseClient, User } from '@supabase/supabase-js';

export type ResolvedCustomer = { id: string; name: string; email: string };

export async function resolveCustomerForUser(supabase: SupabaseClient, user: User): Promise<ResolvedCustomer | null> {
  const email = user.email?.trim().toLowerCase();
  if (!email) return null;

  const { data: existing, error: lookupError } = await supabase
    .from('customers')
    .select('id, name, email')
    .ilike('email', email)
    .maybeSingle();
  if (lookupError) throw lookupError;
  if (existing) return existing;

  const name = typeof user.user_metadata?.full_name === 'string' && user.user_metadata.full_name.trim()
    ? user.user_metadata.full_name.trim()
    : email.split('@')[0];
  const { data: created, error: createError } = await supabase
    .from('customers')
    .insert({ name, email, phone: 'Not provided', city: 'Not provided', status: 'active' })
    .select('id, name, email')
    .single();
  if (!createError && created) return created;
  if (createError?.code === '23505') {
    const { data: concurrent } = await supabase.from('customers').select('id, name, email').ilike('email', email).maybeSingle();
    if (concurrent) return concurrent;
  }
  throw createError ?? new Error('Customer profile could not be created.');
}
