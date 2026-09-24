'use client';

import { useEffect, useState } from 'react';
import { CalendarDays, ClipboardList, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

type Appointment = { id: string; scheduled_start: string; scheduled_end: string; status: string; calendar_event_id: string | null; notification: { status: string } | null };
type ServiceRequest = { id: string; request_number: string; issue: string; status: string; created_at: string; appliances: { brand: string; model: string; appliance_type: string } | null; appointments: Appointment[] };

export default function MyServiceRequestsPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { void (async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setLoading(false); return; }
    const response = await fetch('/api/my-service-requests', { headers: { Authorization: `Bearer ${session.access_token}` } });
    const data = await response.json() as { requests?: ServiceRequest[] };
    setRequests(data.requests ?? []); setLoading(false);
  })(); }, []);
  const isPast = (appointment: Appointment) => new Date(appointment.scheduled_end) < new Date();
  const format = (value: string) => new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
  return <div className="space-y-6">
    <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">HomeCare AI</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">My service requests</h1><p className="mt-1 text-sm text-slate-500">Your live request and appointment status.</p></div>
    {loading ? <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-600" /></div> : requests.length === 0 ? <Card><CardContent className="p-10 text-center text-sm text-slate-500">No service requests yet. Start with AI Support when you need help.</CardContent></Card> : <div className="grid gap-4">{requests.map((request) => <Card key={request.id}><CardHeader><div className="flex items-start justify-between gap-3"><div><CardTitle className="text-base">{request.issue}</CardTitle><p className="mt-1 text-xs text-slate-500">{request.request_number} · {request.appliances ? `${request.appliances.brand} ${request.appliances.model}` : 'Appliance'}</p></div><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{request.status.replaceAll('_', ' ')}</span></div></CardHeader><CardContent className="space-y-3 text-sm text-slate-600"><span className="inline-flex items-center gap-2"><ClipboardList className="h-4 w-4 text-slate-400" />Created {format(request.created_at)}</span>{request.appointments.length ? request.appointments.map((appointment) => <div key={appointment.id} className="border-t border-slate-100 pt-3"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{isPast(appointment) ? 'Past appointment' : 'Upcoming appointment'}</p><p className="mt-1 inline-flex items-center gap-2 font-medium text-slate-800"><CalendarDays className="h-4 w-4 text-emerald-600" />{format(appointment.scheduled_start)} · {appointment.status}</p><p className="mt-1 text-xs text-slate-500">Email confirmation: {appointment.notification?.status === 'sent' ? 'Sent' : 'Not available'}</p></div>) : <p className="border-t border-slate-100 pt-3 text-amber-700">Appointment not scheduled</p>}</CardContent></Card>)}</div>}
  </div>;
}
