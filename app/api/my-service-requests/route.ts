import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });
  const supabase = getServerSupabase(); const { data: auth } = await supabase.auth.getUser(token);
  if (!auth.user?.email) return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });
  const { data: customer } = await supabase.from('customers').select('id').ilike('email', auth.user.email).maybeSingle();
  if (!customer) return NextResponse.json({ requests: [] });
  const { data, error } = await supabase.from('service_requests').select('id, request_number, issue, status, created_at, appliances(brand, model, appliance_type)').eq('customer_id', customer.id).order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: 'Unable to load service requests.' }, { status: 502 });
  const requestIds = (data ?? []).map((item) => item.id);
  const { data: appointments, error: appointmentError } = requestIds.length
    ? await supabase.from('appointments').select('id, service_request_id, scheduled_start, scheduled_end, status, calendar_event_id, created_at').eq('customer_id', customer.id).in('service_request_id', requestIds).order('scheduled_start', { ascending: false })
    : { data: [], error: null };
  if (appointmentError) return NextResponse.json({ error: 'Unable to load appointment history.' }, { status: 502 });
  const appointmentIds = (appointments ?? []).map((item) => item.id);
  const { data: notifications } = appointmentIds.length
    ? await supabase.from('appointment_notifications').select('appointment_id, status, sent_at, created_at').in('appointment_id', appointmentIds).order('created_at', { ascending: false })
    : { data: [] };
  const notificationByAppointment = new Map((notifications ?? []).map((item) => [item.appointment_id, item]));
  const appointmentsByRequest = new Map<string, Array<Record<string, unknown>>>();
  (appointments ?? []).forEach((appointment) => {
    const list = appointmentsByRequest.get(appointment.service_request_id) ?? [];
    list.push({ ...appointment, notification: notificationByAppointment.get(appointment.id) ?? null });
    appointmentsByRequest.set(appointment.service_request_id, list);
  });
  console.info('[my-requests] customer resolved', { customerResolved: true });
  console.info('[my-requests] service request count', { count: requestIds.length });
  console.info('[my-requests] appointment count', { count: appointmentIds.length });
  return NextResponse.json({ requests: (data ?? []).map((request) => ({ ...request, appointments: appointmentsByRequest.get(request.id) ?? [] })) });
}
