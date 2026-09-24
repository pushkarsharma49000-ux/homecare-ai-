create table if not exists public.appointment_notifications (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments(id) on delete cascade,
  type text not null check (type in ('appointment_confirmation')),
  recipient text not null,
  provider text not null,
  status text not null check (status in ('sent', 'failed')),
  provider_reference text,
  error_code text,
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  unique (appointment_id, type, status)
);
create index if not exists appointment_notifications_appointment_idx on public.appointment_notifications(appointment_id, created_at desc);
alter table public.appointment_notifications enable row level security;
create policy appointment_notifications_customer_select on public.appointment_notifications for select to authenticated
using (exists (select 1 from public.appointments a join public.customers c on c.id = a.customer_id where a.id = appointment_notifications.appointment_id and lower(c.email) = lower(auth.jwt() ->> 'email')));
