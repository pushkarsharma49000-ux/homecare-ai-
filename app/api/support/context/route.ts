import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });
  const supabase = getServerSupabase(); const { data: auth } = await supabase.auth.getUser(token);
  if (!auth.user?.email) return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });
  const { data: customer } = await supabase.from('customers').select('id, name').ilike('email', auth.user.email).maybeSingle();
  if (!customer) return NextResponse.json({ customer: null, appliance: null });
  const { data: appliance } = await supabase.from('appliances').select('id, appliance_type, brand, model, warranty_end_date').eq('customer_id', customer.id).order('created_at').limit(1).maybeSingle();
  return NextResponse.json({ customer, appliance });
}
