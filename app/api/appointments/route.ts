import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/server';
import { calendarProvider } from '@/services/calendar';
import { notificationService } from '@/services/notification';
import { isAvailable, isConfiguredSlot } from '@/services/appointment/availability';

export async function POST(request: Request) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });
  const supabase = getServerSupabase(); const { data: auth } = await supabase.auth.getUser(token);
  if (!auth.user?.email) return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });
  const userEmail = auth.user.email;
  const body = await request.json().catch(() => ({})) as { serviceRequestId?: unknown; start?: unknown; end?: unknown };
  const id = typeof body.serviceRequestId === 'string' ? body.serviceRequestId : ''; const start = new Date(String(body.start)); const end = new Date(String(body.end));
  if (!id || Number.isNaN(+start) || Number.isNaN(+end) || end <= start) return NextResponse.json({ error: 'A valid service request and slot are required.' }, { status: 400 });
  if (!isConfiguredSlot(start, end)) return NextResponse.json({ error: 'The selected time is not an offered appointment slot.' }, { status: 400 });
  const { data: serviceRequest } = await supabase.from('service_requests').select('id, customer_id, appliance_id, issue, customers!inner(email, name), appliances(brand, model, appliance_type)').eq('id', id).ilike('customers.email', auth.user.email).maybeSingle();
  if (!serviceRequest) return NextResponse.json({ error: 'Service request not found.' }, { status: 404 });
  const { data: existing, error: existingError } = await supabase.from('appointments').select('id').eq('service_request_id', id).maybeSingle();
  if (existingError) {
    console.error('[appointment] availability check failed', { code: existingError.code, message: existingError.message, details: existingError.details });
    return NextResponse.json({ error: 'Appointment scheduling is not configured. Apply the pending appointments migration.' }, { status: 503 });
  }
  if (existing) return NextResponse.json({ error: 'This service request already has an appointment.', appointmentId: existing.id }, { status: 409 });
  try { if (!await isAvailable(supabase, start, end)) return NextResponse.json({ error: 'The selected slot is no longer available.' }, { status: 409 }); }
  catch (error) { console.error('[appointment] slot validation failed', { stage: 'APPOINTMENT_AVAILABILITY', message: error instanceof Error ? error.message : 'Unknown error' }); return NextResponse.json({ error: 'Unable to validate the selected slot.' }, { status: 502 }); }
  const dbBookingStartedAt = Date.now();
  const { data: appointment, error } = await supabase.from('appointments').insert({ service_request_id: id, customer_id: serviceRequest.customer_id, appliance_id: serviceRequest.appliance_id, scheduled_start: start.toISOString(), scheduled_end: end.toISOString() }).select().single();
  console.info('[appointment-perf] DB_BOOKING_MS', { durationMs: Date.now() - dbBookingStartedAt });
  if (error) {
    console.error('[appointment] insert failed', { code: error.code, message: error.message, details: error.details, serviceRequestId: id });
    return NextResponse.json({ error: 'Unable to create appointment. The appointments database schema may need its pending migration applied.' }, { status: 409 });
  }
  const { error: updateError } = await supabase.from('service_requests').update({ status: 'technician_scheduled', appointment_reference: appointment.id }).eq('id', id);
  if (updateError) {
    console.error('[appointment] service request update failed', { code: updateError.code, message: updateError.message, details: updateError.details, serviceRequestId: id });
    await supabase.from('appointments').delete().eq('id', appointment.id);
    return NextResponse.json({ error: 'Appointment could not be finalized.' }, { status: 409 });
  }
  const syncCalendar = async () => {
    const startedAt = Date.now();
    try {
      const appliance = Array.isArray(serviceRequest.appliances) ? serviceRequest.appliances[0] : serviceRequest.appliances;
      const event = await calendarProvider.createEvent({ title: 'HomeCare AI - Appliance Service Appointment', start: start.toISOString(), end: end.toISOString(), timezone: process.env.APPOINTMENT_TIMEZONE || 'Asia/Kolkata', description: `Service request: ${id}\nAppointment: ${appointment.id}\nAppliance: ${appliance?.brand ?? ''} ${appliance?.model ?? ''}\nIssue: ${serviceRequest.issue}` });
      await supabase.from('appointments').update({ calendar_event_id: event.id }).eq('id', appointment.id);
      return { configured: true, eventId: event.id };
    } catch (error) { console.error('[appointment] calendar sync failed', { stage: 'CALENDAR_CREATION', appointmentId: appointment.id, message: error instanceof Error ? error.message : 'Unknown error' }); return { configured: false, eventId: null as string | null }; }
    finally { console.info('[appointment-perf] CALENDAR_MS', { durationMs: Date.now() - startedAt }); }
  };
  const sendConfirmation = async () => {
    const startedAt = Date.now();
    try {
      const { data: sentNotification, error: notificationLookupError } = await supabase.from('appointment_notifications').select('id').eq('appointment_id', appointment.id).eq('type', 'appointment_confirmation').eq('status', 'sent').maybeSingle();
      if (notificationLookupError) throw notificationLookupError;
      if (sentNotification) return true;
      const customer = Array.isArray(serviceRequest.customers) ? serviceRequest.customers[0] : serviceRequest.customers;
      const appliance = Array.isArray(serviceRequest.appliances) ? serviceRequest.appliances[0] : serviceRequest.appliances;
      const notification = await notificationService.queueEmailConfirmation({ recipient: userEmail, customerName: customer?.name ?? userEmail, appliance: `${appliance?.appliance_type ?? 'Appliance'} ${appliance?.brand ?? ''} ${appliance?.model ?? ''}`.trim(), issue: serviceRequest.issue, serviceRequestId: id, appointmentId: appointment.id, start: appointment.scheduled_start, status: appointment.status, timezone: process.env.APPOINTMENT_TIMEZONE || 'Asia/Kolkata', calendarSynced: false });
      const { error: notificationInsertError } = await supabase.from('appointment_notifications').insert({ appointment_id: appointment.id, type: 'appointment_confirmation', recipient: userEmail, provider: 'resend', status: 'sent', provider_reference: notification.id, sent_at: new Date().toISOString() });
      if (notificationInsertError) throw notificationInsertError;
      return true;
    } catch (error) {
      console.error('[appointment] email notification failed', { stage: 'EMAIL_NOTIFICATION', appointmentId: appointment.id, message: error instanceof Error ? error.message : 'Unknown error' });
      await supabase.from('appointment_notifications').insert({ appointment_id: appointment.id, type: 'appointment_confirmation', recipient: userEmail, provider: 'resend', status: 'failed', error_code: error instanceof Error ? error.name : 'UNKNOWN' });
      return false;
    } finally { console.info('[appointment-perf] EMAIL_MS', { durationMs: Date.now() - startedAt }); }
  };
  const [calendar, emailSent] = await Promise.all([syncCalendar(), sendConfirmation()]);
  return NextResponse.json({ success: true, appointment, appointmentId: appointment.id, calendarSynced: calendar.configured, emailSent }, { status: 201 });
}
