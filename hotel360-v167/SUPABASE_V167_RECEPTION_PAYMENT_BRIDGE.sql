-- Hotel360 v167 — Reservations <-> Reception <-> Payments bridge
-- Run after SUPABASE_V166_RESERVATIONS_CORE.sql.

alter table if exists public.h360_reservations_v166
  add column if not exists booking_type text,
  add column if not exists payer_type text,
  add column if not exists payer_name text,
  add column if not exists checkin_id text,
  add column if not exists reception_status text;

alter table if exists public.h360_payments_v166
  add column if not exists source_channel text,
  add column if not exists checkin_id text,
  add column if not exists actor_name text;

create table if not exists public.h360_reception_stays_v167 (
  id text primary key,
  reservation_id text,
  local_hotel_id text not null,
  confirmation_no text,
  status text not null default 'in',
  total numeric not null default 0,
  paid_amount numeric not null default 0,
  payment_status text,
  payer_type text,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create unique index if not exists h360_reception_stays_v167_reservation_uidx
  on public.h360_reception_stays_v167(reservation_id)
  where reservation_id is not null;
create index if not exists h360_reception_stays_v167_hotel_idx
  on public.h360_reception_stays_v167(local_hotel_id,status);
create index if not exists h360_reception_stays_v167_confirmation_idx
  on public.h360_reception_stays_v167(confirmation_no);

alter table public.h360_reception_stays_v167 enable row level security;

-- Property-scoped access: reuse the v166 hotel authorization helper.
drop policy if exists h360_reception_stays_v167_auth_select on public.h360_reception_stays_v167;
drop policy if exists h360_reception_stays_v167_auth_insert on public.h360_reception_stays_v167;
drop policy if exists h360_reception_stays_v167_auth_update on public.h360_reception_stays_v167;
drop policy if exists h360_reception_stays_v167_hotel_staff on public.h360_reception_stays_v167;

create policy h360_reception_stays_v167_hotel_staff
on public.h360_reception_stays_v167 for all
to authenticated
using (public.h360_v166_can_hotel(local_hotel_id))
with check (public.h360_v166_can_hotel(local_hotel_id));
