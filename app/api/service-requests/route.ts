import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/server';

type Payload = { applianceId?: unknown; issue?: unknown; diagnosisSummary?: unknown; troubleshootingPerformed?: unknown; severity?: unknown };
const value = (input: unknown) => typeof input === 'string' ? input.trim() : '';

export async function POST(request: Request) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });
  const supabase = getServerSupabase();
  const { data: auth } = await supabase.auth.getUser(token);
  if (!auth.user?.email) return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });
  const body = await request.json().catch(() => ({})) as Payload;
  const applianceId = value(body.applianceId), issue = value(body.issue);
  if (!applianceId || !issue || issue.length > 1000) return NextResponse.json({ error: 'applianceId and issue are required.' }, { status: 400 });
  const { data: appliance } = await supabase.from('appliances').select('id, customer_id, appliance_type').eq('id', applianceId).maybeSingle();
  if (!appliance) return NextResponse.json({ error: 'Appliance not found.' }, { status: 404 });
  const { data: customer } = await supabase.from('customers').select('id').eq('id', appliance.customer_id).ilike('email', auth.user.email).maybeSingle();
  if (!customer) return NextResponse.json({ error: 'This appliance is not available to your account.' }, { status: 403 });
  const { data: existing } = await supabase.from('service_requests').select('id, request_number, status').eq('customer_id', customer.id).eq('appliance_id', applianceId).eq('issue', issue).in('status', ['OPEN', 'DIAGNOSING', 'WAITING_FOR_APPOINTMENT', 'SCHEDULED', 'new', 'assigned', 'technician_scheduled']).limit(1).maybeSingle();
  if (existing) return NextResponse.json({ serviceRequest: existing, duplicate: true });
  const { data: created, error } = await supabase.from('service_requests').insert({
    request_number: `SR-${Date.now().toString().slice(-8)}`, customer_id: customer.id, appliance_id: applianceId,
    issue, category: appliance.appliance_type, priority: value(body.severity) || 'Medium', status: 'WAITING_FOR_APPOINTMENT',
    ai_summary: value(body.diagnosisSummary) || null, troubleshooting_performed: value(body.troubleshootingPerformed) || null, technician_required: true,
  }).select('id, request_number, status').single();
  if (error) return NextResponse.json({ error: 'Unable to create service request.' }, { status: 409 });
  return NextResponse.json({ serviceRequest: created, duplicate: false }, { status: 201 });
}
