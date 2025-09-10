create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  pickup_location text not null,
  dropoff_location text not null,
  date_time timestamptz not null,
  vehicle_type text not null,
  name text not null,
  phone text not null,
  email text not null,
  flight_number text,
  pricing jsonb
);

-- Optional helpful index
create index on public.bookings (created_at desc);

-- Enable RLS (we’ll use service role from serverless API)
alter table public.bookings enable row level security;
