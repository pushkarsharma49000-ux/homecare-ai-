-- Customer-facing scheduling extension. Existing service_requests remain the source of truth.
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  service_request_id uuid not null unique references public.service_requests(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete restrict,
  appliance_id uuid references public.appliances(id) on delete set null,
  scheduled_start timestamptz not null,
  scheduled_end timestamptz not null,
  status text not null default 'SCHEDULED' check (status in ('SCHEDULED', 'CANCELLED', 'COMPLETED')),
  technician_id text,
  calendar_event_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (scheduled_end > scheduled_start)
);

create index if not exists appointments_customer_start_idx on public.appointments(customer_id, scheduled_start);
alter table public.appointments enable row level security;

-- Customers are matched to the signed-in account email. The API also verifies ownership.
create policy appointments_customer_select on public.appointments for select to authenticated
using (exists (select 1 from public.customers c where c.id = appointments.customer_id and lower(c.email) = lower(auth.jwt() ->> 'email')));

alter table public.service_requests add column if not exists technician_required boolean;
alter table public.service_requests add column if not exists troubleshooting_performed text;
alter table public.service_requests add column if not exists appointment_reference uuid references public.appointments(id) on delete set null;

create unique index if not exists service_requests_active_dedup_idx
on public.service_requests(customer_id, appliance_id, md5(lower(issue)))
where status not in ('COMPLETED', 'CANCELLED', 'closed', 'resolved');
