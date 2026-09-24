import { NextResponse } from 'next/server';
import { resolveCustomerForUser } from '@/lib/customers/resolve';
import { getServerSupabase } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });
  const supabase = getServerSupabase(); const { data: auth } = await supabase.auth.getUser(token);
  if (!auth.user) return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });
  try {
    const customer = await resolveCustomerForUser(supabase, auth.user);
    return NextResponse.json({ customer });
  } catch {
    return NextResponse.json({ error: 'Unable to load your profile.' }, { status: 502 });
  }
}
