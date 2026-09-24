import { NextResponse } from 'next/server';
import { resolveCustomerForUser } from '@/lib/customers/resolve';
import { getServerSupabase } from '@/lib/supabase/server';

type Payload = { applianceId?: unknown; applianceType?: unknown; brand?: unknown; model?: unknown; issue?: unknown; diagnosisSummary?: unknown; troubleshootingPerformed?: unknown; severity?: unknown };
const value = (input: unknown) => typeof input === 'string' ? input.trim() : '';
const applianceType = (input: unknown) => value(input).toLowerCase().replace(/[\s-]+/g, '_');
const priority = (input: unknown): 'low' | 'medium' | 'high' | 'critical' => {
  const normalized = String(input ?? '').trim().toLowerCase();
  return normalized === 'low' || normalized === 'medium' || normalized === 'high' || normalized === 'critical'
    ? normalized
    : 'medium';
};

export async function POST(request: Request) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });
  const supabase = getServerSupabase();
  const { data: auth } = await supabase.auth.getUser(token);
  if (!auth.user?.email) return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });
  const body = await request.json().catch(() => ({})) as Payload;
  let applianceId = value(body.applianceId); const issue = value(body.issue);
  if (!issue || issue.length > 1000) return NextResponse.json({ error: 'issue is required.' }, { status: 400 });
  let customer;
  try { customer = await resolveCustomerForUser(supabase, auth.user); }
  catch (error) {
    console.error('[service-request] customer registration failed', { code: typeof error === 'object' && error && 'code' in error ? error.code : undefined, message: error instanceof Error ? error.message : 'Unknown error' });
    return NextResponse.json({ error: 'Unable to register your customer profile.' }, { status: 409 });
  }
  if (!customer) return NextResponse.json({ error: 'A verified email is required.' }, { status: 400 });
  let appliance = null;
  const applianceIdSupplied = Boolean(applianceId);
  if (applianceId) {
    const { data: requestedAppliance, error: applianceLookupError } = await supabase
      .from('appliances')
      .select('id, customer_id, appliance_type')
      .eq('id', applianceId)
      .maybeSingle();
    if (applianceLookupError) {
      console.error('[service-request] appliance lookup failed', { stage: 'APPLIANCE_RESOLUTION', code: applianceLookupError.code, message: applianceLookupError.message, details: applianceLookupError.details });
      return NextResponse.json({ error: 'Unable to verify the selected appliance.' }, { status: 502 });
    }
    if (!requestedAppliance) {
      console.info('[service-request] appliance resolution', { stage: 'APPLIANCE_RESOLUTION', applianceIdSupplied, source: 'tool_arguments', found: false, reason: 'untrusted_appliance_id' });
      applianceId = '';
    }
    if (requestedAppliance && requestedAppliance.customer_id !== customer.id) {
      console.error('[service-request] authorization failed', { stage: 'APPLIANCE_OWNERSHIP', reason: 'appliance_customer_mismatch' });
      return NextResponse.json({ error: 'This appliance is not available to your account.' }, { status: 403 });
    }
    appliance = requestedAppliance;
  }
  if (!appliance) {
    const type = applianceType(body.applianceType);
    if (!type) return NextResponse.json({ error: 'An identified appliance is required before arranging service.' }, { status: 400 });
    const { data: matchingAppliances, error: applianceMatchError } = await supabase.from('appliances').select('id, customer_id, appliance_type').eq('customer_id', customer.id).eq('appliance_type', type).limit(2);
    if (applianceMatchError) {
      console.error('[service-request] appliance resolution failed', { stage: 'APPLIANCE_RESOLUTION', code: applianceMatchError.code, message: applianceMatchError.message, details: applianceMatchError.details });
      return NextResponse.json({ error: 'Unable to resolve your appliance.' }, { status: 502 });
    }
    if (matchingAppliances && matchingAppliances.length > 1) {
      console.info('[service-request] appliance resolution', { stage: 'APPLIANCE_RESOLUTION', applianceIdSupplied, source: 'authenticated_customer_appliances', found: false, reason: 'ambiguous_appliance_type' });
      return NextResponse.json({ error: 'More than one matching appliance is registered. Please identify the model to continue.', code: 'APPLIANCE_SELECTION_REQUIRED' }, { status: 409 });
    }
    appliance = matchingAppliances?.[0] ?? null;
    if (appliance) console.info('[service-request] appliance resolution', { stage: 'APPLIANCE_RESOLUTION', applianceIdSupplied, source: 'authenticated_customer_appliances', found: true });
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
    issue, category: appliance.appliance_type, priority: priority(body.severity), status: 'new',
    ai_summary: value(body.diagnosisSummary) || null, troubleshooting_performed: value(body.troubleshootingPerformed) || null, technician_required: true,
  }).select('id, request_number, status').single();
  if (error) {
    console.error('[service-request] insert failed', { stage: 'service_request_insert', code: error.code, message: error.message, details: error.details });
    return NextResponse.json({ error: 'Unable to create service request. The service-request database schema may need its pending migration applied.' }, { status: 409 });
  }
  return NextResponse.json({ serviceRequest: created, serviceRequestId: created.id, duplicate: false }, { status: 201 });
}
