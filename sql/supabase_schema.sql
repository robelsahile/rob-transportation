-- ==========================================================
-- (A) TABLES
-- ==========================================================

-- BOOKINGS: text id for custom format + coupon columns
create table if not exists public.bookings (
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
  pricing jsonb,
  applied_coupon_code text,
  discount_cents integer default 0
);

-- If migrating from uuid -> text (idempotent)
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name   = 'bookings'
      and column_name  = 'id'
      and data_type    = 'uuid'
  ) then
    execute 'alter table public.bookings alter column id drop default';
    execute 'alter table public.bookings alter column id type text using id::text';
  end if;
exception when others then
  -- ignore if already migrated
end $$;

alter table public.bookings enable row level security;
create index if not exists bookings_created_at_desc_idx on public.bookings (created_at desc);

-- COUNTER: single-row global counter
create table if not exists public.booking_counter (
  id serial primary key,
  current_value integer not null
);

insert into public.booking_counter (current_value)
select 0
where not exists (select 1 from public.booking_counter);

-- COUPONS
-- Show where we are
select current_database() as db, current_schema as schema from information_schema.schemata where schema_name='public' limit 1;

-- Ensure the coupons table exists (idempotent)
create table if not exists public.coupons (
  id bigserial primary key,
  code text not null unique,
  kind text not null check (kind in ('percent','fixed')),
  value_cents integer not null default 0,
  percent_off numeric(5,2),
  max_redemptions integer,
  redemptions_used integer not null default 0,
  expires_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists coupons_code_lower_idx on public.coupons (lower(code));

-- ==========================================================
-- (B) RPC FUNCTIONS
-- ==========================================================

-- Atomic counter increment
create or replace function public.next_booking_counter()
returns integer
language plpgsql
as $$
declare v integer;
begin
  update public.booking_counter
  set current_value = current_value + 1
  where id = 1
  returning current_value into v;

  if v is null then
    insert into public.booking_counter (current_value) values (1)
    returning current_value into v;
  end if;

  return v;
end;
$$;

-- Increment coupon redemption count by code (case-insensitive)
create or replace function public.increment_coupon_redemption(p_code text)
returns void
language plpgsql
as $$
begin
  update public.coupons
  set redemptions_used = redemptions_used + 1
  where lower(code) = lower(p_code)
    and active = true;
end;
$$;

-- ==========================================================
-- (C) SEED COUPONS (safe upserts)
-- ==========================================================

-- Seed / upsert the four codes
insert into public.coupons (code, kind, percent_off, value_cents, max_redemptions, active)
values
  ('WELCOME10', 'percent', 10.00, 0, 1000, true),
  ('TAKE15',    'percent', 15.00, 0, null, true),
  ('SAVE5',     'fixed',   null,  500, null, true),
  ('MEGA99',    'percent', 99.00, 0, 100,  true)
on conflict (code) do update
set
  kind            = excluded.kind,
  percent_off     = excluded.percent_off,
  value_cents     = excluded.value_cents,
  max_redemptions = excluded.max_redemptions,
  active          = excluded.active;

-- Verify they’re present and active
select code, kind, percent_off, value_cents, max_redemptions, redemptions_used, active
from public.coupons
order by code;
