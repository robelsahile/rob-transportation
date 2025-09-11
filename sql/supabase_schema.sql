-- Replace uuid with text for custom booking IDs
create table public.bookings (
  id text primary key,
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

-- Track global counter
create table public.booking_counter (
  id serial primary key,
  current_value int not null
);

insert into public.booking_counter (current_value) values (0);
