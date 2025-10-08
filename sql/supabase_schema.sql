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

-- Add passengers and notes columns
alter table public.bookings add column if not exists passengers integer;
alter table public.bookings add column if not exists notes text;

-- Ensure no duplicate created_at index remains (advisor flagged duplicate)
drop index if exists public.bookings_created_at_desc_idx;
create index if not exists bookings_created_at_idx on public.bookings (created_at desc);

-- Global, ever-incrementing booking counter
create sequence if not exists booking_counter_seq;

-- RPC that /api/booking-counter calls
create or replace function public.next_booking_counter()
returns integer
language sql
security definer
set search_path = public
as $$
  select nextval('public.booking_counter_seq')::integer;
$$;

-- Enable RLS on bookings table
alter table public.bookings enable row level security;

-- RLS Policies for bookings table
-- Allow service role to perform all operations (for API access)
-- Drop existing policy first, then recreate (safe to run multiple times)
drop policy if exists "Service role can manage bookings" on public.bookings;
create policy "Service role can manage bookings" on public.bookings
  for all using ((select auth.role()) = 'service_role');

commit;

-- If a legacy table `public.booking_counter` exists, disable RLS to clear advisor info
-- We use the `public.booking_counter_seq` sequence for counters instead of a table.
-- Harden legacy table if it exists (enable RLS + service-role-only policy)
alter table if exists public.booking_counter enable row level security;
drop policy if exists "Service role manage booking_counter" on public.booking_counter;
create policy "Service role manage booking_counter" on public.booking_counter
  for all using ((select auth.role()) = 'service_role');
