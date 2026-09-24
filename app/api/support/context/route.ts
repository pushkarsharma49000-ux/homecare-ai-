import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });
  const supabase = getServerSupabase(); const { data: auth } = await supabase.auth.getUser(token);
  if (!auth.user?.email) return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });
  const { data: customer } = await supabase.from('customers').select('id, name').ilike('email', auth.user.email).maybeSingle();
  if (!customer) return NextResponse.json({ customer: null, appliance: null });
  const requestedType = new URL(request.url).searchParams.get('applianceType')?.trim().toLowerCase().replace(/[\s-]+/g, '_');
  let appliance = null;
  let applianceSelectionRequired = false;
  if (requestedType) {
    const { data: matches } = await supabase.from('appliances').select('id, appliance_type, brand, model, warranty_end_date').eq('customer_id', customer.id).eq('appliance_type', requestedType).limit(2);
    appliance = matches?.[0] ?? null;
    applianceSelectionRequired = Boolean(matches && matches.length > 1);
  }
  return NextResponse.json({ customer, appliance, requestedApplianceType: requestedType ?? null, applianceSelectionRequired });
}
