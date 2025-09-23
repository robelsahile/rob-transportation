begin;

-- BOOKINGS table (idempotent create, then additive alters)
create table if not exists public.bookings (
  id                text primary key,
  created_at        timestamptz not null default now(),
  pickup_location   text not null,
  dropoff_location  text not null,
  date_time         timestamptz not null,
  vehicle_type      text not null,
  name              text not null,
  phone             text not null,
  email             text not null,
  flight_number     text,
  pricing           jsonb,
  payment_id        text,
  payment_status    text
);

-- Add payment columns used by webhook or later use (safe if run multiple times)
alter table public.bookings add column if not exists payment_id text;
alter table public.bookings add column if not exists payment_status text;

-- Add vehicle selection ID column (format: yyyyMMdd-xxx-nnnn)
alter table public.bookings add column if not exists vehicle_selection_id text;

-- Helpful index
create index if not exists bookings_created_at_idx on public.bookings (created_at desc);

-- Global, ever-incrementing booking counter
create sequence if not exists booking_counter_seq;

-- RPC that /api/booking-counter calls
create or replace function public.next_booking_counter()
returns integer
language sql
security definer
as $$
  select nextval('booking_counter_seq')::integer;
$$;

-- Enable RLS on bookings table
alter table public.bookings enable row level security;

-- RLS Policies for bookings table
-- Allow service role to perform all operations (for API access)
create policy "Service role can manage bookings" on public.bookings
  for all using (auth.role() = 'service_role');

commit;
