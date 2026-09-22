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
  const { data: existing } = await supabase.from('appointments').select('id').eq('service_request_id', id).maybeSingle();
  if (existing) return NextResponse.json({ error: 'This service request already has an appointment.', appointmentId: existing.id }, { status: 409 });
  const event = await calendarProvider.createEvent({ title: 'HomeCare Service Appointment', start: start.toISOString(), end: end.toISOString(), description: `Service request ${id}: ${serviceRequest.issue}` });
  const { data: appointment, error } = await supabase.from('appointments').insert({ service_request_id: id, customer_id: serviceRequest.customer_id, appliance_id: serviceRequest.appliance_id, scheduled_start: start.toISOString(), scheduled_end: end.toISOString(), calendar_event_id: event.id }).select().single();
  if (error) return NextResponse.json({ error: 'Unable to create appointment.' }, { status: 409 });
  await supabase.from('service_requests').update({ status: 'SCHEDULED', appointment_reference: appointment.id }).eq('id', id);
  await notificationService.queueEmailConfirmation(auth.user.email, id);
  return NextResponse.json({ appointment, calendarProvider: event.provider }, { status: 201 });
}
