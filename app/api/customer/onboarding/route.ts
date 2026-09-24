import { NextResponse } from 'next/server';
import { resolveCustomerForUser } from '@/lib/customers/resolve';
import { getServerSupabase } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });
  const supabase = getServerSupabase();
  const { data: auth } = await supabase.auth.getUser(token);
  if (!auth.user) return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });
  try {
    const customer = await resolveCustomerForUser(supabase, auth.user);
    if (!customer) return NextResponse.json({ error: 'A verified email is required.' }, { status: 400 });
    return NextResponse.json({ customer });
  } catch (error) {
    console.error('[customer-onboarding] profile resolution failed', { code: typeof error === 'object' && error && 'code' in error ? error.code : undefined, message: error instanceof Error ? error.message : 'Unknown error' });
    return NextResponse.json({ error: 'Unable to prepare your customer profile.' }, { status: 409 });
  }
}
