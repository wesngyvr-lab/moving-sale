# Furniture Sale Checklist — Build Brief for Code Agent

## Goal
A tiny web app to list furniture items, let friends **claim/reserve** them, and give me an **admin dashboard** to see/manage claims. Must be deployable on Vercel and use Supabase for data + realtime.

## Tech Stack (constraints)
- Framework: Next.js (App Router, TypeScript)
- Hosting: Vercel (serverless/edge ok)
- Data: Supabase (Postgres + RLS + Realtime)
- Email notifications: Resend (preferred) or SendGrid
- Styling: Tailwind (optional, minimal OK)

## Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `RESEND_API_KEY` (or `SENDGRID_API_KEY`)
- `ADMIN_PASS` (simple password for `/admin`)

## Database (run in Supabase SQL editor)

```sql
-- Items for sale
create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  price_cents int not null,
  photo_url text,
  description text,
  status text not null default 'available', -- available | reserved | sold
  created_at timestamptz not null default now()
);

-- Reservations/claims
create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id) on delete cascade,
  name text not null,
  email text not null,
  message text,
  status text not null default 'reserved', -- reserved | released | completed
  created_at timestamptz not null default now()
);

-- Only one active reservation per item:
create unique index if not exists one_active_reservation_per_item
on public.reservations(item_id)
where status = 'reserved';

-- RLS + policies
alter table public.items enable row level security;
alter table public.reservations enable row level security;

-- Public can read items
drop policy if exists "read items" on public.items;
create policy "read items" on public.items
for select using (true);

-- Public can create reservations (no reading others' PII)
drop policy if exists "create reservation" on public.reservations;
create policy "create reservation" on public.reservations
for insert with check (true);

-- No public select on reservations for now
drop policy if exists "read reservations" on public.reservations;
create policy "read reservations" on public.reservations
for select using (false);
