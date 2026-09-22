import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });
  const supabase = getServerSupabase(); const { data: auth } = await supabase.auth.getUser(token);
  if (!auth.user?.email) return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });
  const { data: customer } = await supabase.from('customers').select('id').ilike('email', auth.user.email).maybeSingle();
  if (!customer) return NextResponse.json({ requests: [] });
  const { data, error } = await supabase.from('service_requests').select('id, request_number, issue, status, created_at, appliances(brand, model, appliance_type), appointments(id, scheduled_start, scheduled_end, status)').eq('customer_id', customer.id).order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: 'Unable to load service requests.' }, { status: 502 });
  return NextResponse.json({ requests: data ?? [] });
}
