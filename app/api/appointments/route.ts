import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/server';
import { calendarProvider } from '@/services/calendar';
import { notificationService } from '@/services/notification';

export async function POST(request: Request) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });
  const supabase = getServerSupabase(); const { data: auth } = await supabase.auth.getUser(token);
  if (!auth.user?.email) return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });
  const body = await request.json().catch(() => ({})) as { serviceRequestId?: unknown; start?: unknown; end?: unknown };
  const id = typeof body.serviceRequestId === 'string' ? body.serviceRequestId : ''; const start = new Date(String(body.start)); const end = new Date(String(body.end));
  if (!id || Number.isNaN(+start) || Number.isNaN(+end) || end <= start) return NextResponse.json({ error: 'A valid service request and slot are required.' }, { status: 400 });
  const { data: serviceRequest } = await supabase.from('service_requests').select('id, customer_id, appliance_id, issue, customers!inner(email), appliances(brand, model)').eq('id', id).ilike('customers.email', auth.user.email).maybeSingle();
  if (!serviceRequest) return NextResponse.json({ error: 'Service request not found.' }, { status: 404 });
  const { data: existing, error: existingError } = await supabase.from('appointments').select('id').eq('service_request_id', id).maybeSingle();
  if (existingError) {
    console.error('[appointment] availability check failed', { code: existingError.code, message: existingError.message, details: existingError.details });
    return NextResponse.json({ error: 'Appointment scheduling is not configured. Apply the pending appointments migration.' }, { status: 503 });
  }
  if (existing) return NextResponse.json({ error: 'This service request already has an appointment.', appointmentId: existing.id }, { status: 409 });
  const event = await calendarProvider.createEvent({ title: 'HomeCare Service Appointment', start: start.toISOString(), end: end.toISOString(), description: `Service request ${id}: ${serviceRequest.issue}` });
  const { data: appointment, error } = await supabase.from('appointments').insert({ service_request_id: id, customer_id: serviceRequest.customer_id, appliance_id: serviceRequest.appliance_id, scheduled_start: start.toISOString(), scheduled_end: end.toISOString(), calendar_event_id: event.id }).select().single();
  if (error) {
    console.error('[appointment] insert failed', { code: error.code, message: error.message, details: error.details, serviceRequestId: id });
    return NextResponse.json({ error: 'Unable to create appointment. The appointments database schema may need its pending migration applied.' }, { status: 409 });
  }
  const { error: updateError } = await supabase.from('service_requests').update({ status: 'SCHEDULED', appointment_reference: appointment.id }).eq('id', id);
  if (updateError) {
    console.error('[appointment] service request update failed', { code: updateError.code, message: updateError.message, details: updateError.details, serviceRequestId: id });
    await supabase.from('appointments').delete().eq('id', appointment.id);
    return NextResponse.json({ error: 'Appointment could not be finalized.' }, { status: 409 });
  }
  await notificationService.queueEmailConfirmation(auth.user.email, id);
  return NextResponse.json({ appointment, calendarProvider: event.provider }, { status: 201 });
}
