import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/server';

type Payload = { applianceId?: unknown; applianceType?: unknown; brand?: unknown; model?: unknown; issue?: unknown; diagnosisSummary?: unknown; troubleshootingPerformed?: unknown; severity?: unknown };
const value = (input: unknown) => typeof input === 'string' ? input.trim() : '';
const applianceType = (input: unknown) => value(input).toLowerCase().replace(/[\s-]+/g, '_');

export async function POST(request: Request) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });
  const supabase = getServerSupabase();
  const { data: auth } = await supabase.auth.getUser(token);
  if (!auth.user?.email) return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });
  const body = await request.json().catch(() => ({})) as Payload;
  let applianceId = value(body.applianceId); const issue = value(body.issue);
  if (!issue || issue.length > 1000) return NextResponse.json({ error: 'issue is required.' }, { status: 400 });
  let { data: customer } = await supabase.from('customers').select('id').ilike('email', auth.user.email).maybeSingle();
  if (!customer) {
    const { data: createdCustomer, error } = await supabase.from('customers').insert({ name: auth.user.user_metadata?.full_name || auth.user.email.split('@')[0], email: auth.user.email, phone: 'Not provided', city: 'Not provided', status: 'active' }).select('id').single();
    if (error || !createdCustomer) {
      console.error('[service-request] customer registration failed', { code: error?.code, message: error?.message });
      return NextResponse.json({ error: 'Unable to register your customer profile.' }, { status: 409 });
    }
    customer = createdCustomer;
  }
  let appliance = applianceId ? (await supabase.from('appliances').select('id, customer_id, appliance_type').eq('id', applianceId).eq('customer_id', customer.id).maybeSingle()).data : null;
  if (applianceId && !appliance) return NextResponse.json({ error: 'This appliance is not available to your account.' }, { status: 403 });
  if (!appliance) {
    const type = applianceType(body.applianceType);
    if (!type) return NextResponse.json({ error: 'An identified appliance is required before arranging service.' }, { status: 400 });
    const { data: existingAppliance } = await supabase.from('appliances').select('id, customer_id, appliance_type').eq('customer_id', customer.id).eq('appliance_type', type).limit(1).maybeSingle();
    appliance = existingAppliance;
    if (!appliance) {
      const { data: createdAppliance, error } = await supabase.from('appliances').insert({ customer_id: customer.id, appliance_type: type, brand: value(body.brand) || 'Not specified', model: value(body.model) || 'Not specified', serial_number: `UNVERIFIED-${crypto.randomUUID()}`, status: 'active', purchase_date: new Date().toISOString().slice(0, 10), warranty_start_date: new Date().toISOString().slice(0, 10), warranty_end_date: new Date().toISOString().slice(0, 10) }).select('id, customer_id, appliance_type').single();
      if (error || !createdAppliance) {
        console.error('[service-request] appliance registration failed', { code: error?.code, message: error?.message });
        return NextResponse.json({ error: 'Unable to register the identified appliance.' }, { status: 409 });
      }
      appliance = createdAppliance;
    }
    applianceId = appliance.id;
  }
  const { data: existing } = await supabase.from('service_requests').select('id, request_number, status').eq('customer_id', customer.id).eq('appliance_id', applianceId).eq('issue', issue).in('status', ['OPEN', 'DIAGNOSING', 'WAITING_FOR_APPOINTMENT', 'SCHEDULED', 'new', 'assigned', 'technician_scheduled']).limit(1).maybeSingle();
  if (existing) return NextResponse.json({ serviceRequest: existing, duplicate: true });
  const { data: created, error } = await supabase.from('service_requests').insert({
    request_number: `SR-${Date.now().toString().slice(-8)}`, customer_id: customer.id, appliance_id: appliance.id,
    issue, category: appliance.appliance_type, priority: value(body.severity) || 'Medium', status: 'WAITING_FOR_APPOINTMENT',
    ai_summary: value(body.diagnosisSummary) || null, troubleshooting_performed: value(body.troubleshootingPerformed) || null, technician_required: true,
  }).select('id, request_number, status').single();
  if (error) {
    console.error('[service-request] insert failed', { code: error.code, message: error.message, details: error.details });
    return NextResponse.json({ error: 'Unable to create service request. The service-request database schema may need its pending migration applied.' }, { status: 409 });
  }
  return NextResponse.json({ serviceRequest: created, duplicate: false }, { status: 201 });
}
