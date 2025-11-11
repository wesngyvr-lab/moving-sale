# 🧰 Furniture / Garage Sale — Moving Sale

A lightweight, friend-first “garage sale” web app. You (the seller) create a **garage**, add items with pics, and share a link. Friends visit, enter a **name + contact**, tap **I’m interested**, and you see interest in realtime.

## TL;DR
- Seller creates a **garage** from the web app (no complex auth).
- Items: title, price (nullable for FREE), photo, description, status.
- Friends: enter **name + email/phone**, then mark **Interest**.
- **Multiple** friends can be interested in the same item; we show who & counts.
- Realtime UI updates (interest counts, status changes).
- Admin (seller) can: add items, copy share link, close/delete garage, mark items reserved/sold.  
- Future: password-locked garages, email notifications, photo upload from phone, payments (Venmo etc).

---

## Features

### Seller (Garage Owner)
- Create garage with **title + slug** and owner email.
- Add item (title, price, description, photo URL).
- See interest counts and list of interested people per item.
- Mark status: `available | reserved | sold`.
- Copy sharable link `/g/[slug]`.
- Dashboard KPIs: `#items`, `#interests`, `#unique participants`.
- Close or delete garage.

### Friend (Buyer)
- Open `/g/[slug]`.
- Enter **name + email/phone** (no password).
- Tap **I’m interested** on any item; optionally leave a short message.
- See others who are interested and the order (first interest is visible).

### Realtime
- UI auto-updates on:
  - new interest
  - item status change
  - new item added
- Live **interest counters** per item.

---

## Tech Stack
- **Next.js 14 (App Router) + TypeScript**
- **Supabase** (Postgres, Realtime, Row Level Security)
- Tailwind (light touch, friendly vibe)
- (TODO) Email notifications (Resend / SendGrid)
- (TODO) Supabase Storage for photo uploads

---

## 📦 Data Model

### 1. `garages`
Each garage = one sale, owned by a host (e.g. “Wes’s Moving Sale”).

| Column | Type | Description |
|--------|------|--------------|
| `id` | `uuid` (PK) | Unique ID |
| `slug` | `text` | Unique short name (e.g. `wes-moving-sale`) |
| `title` | `text` | Human title |
| `owner_email` | `text` | Admin contact |
| `created_at` | `timestamptz` | Auto timestamp |

---

### 2. `items`
Each listing belongs to one garage.

| Column | Type | Description |
|--------|------|-------------|
| `id` | `uuid` (PK) | Unique item ID |
| `garage_id` | `uuid` (FK → garages.id)` | Parent garage |
| `title` | `text` | Item name |
| `price_cents` | `int` | `NULL` = free |
| `photo_url` | `text` | Image |
| `description` | `text` | Optional |
| `status` | `text` | `available`, `reserved`, `sold` |
| `created_at` | `timestamptz` | Auto timestamp |

---

### 3. `participants`
Friends who identify themselves for a given garage.

| Column | Type | Description |
|--------|------|-------------|
| `id` | `uuid` (PK) | Unique ID |
| `garage_id` | `uuid` (FK → garages.id)` | Which sale this friend belongs to |
| `name` | `text` | Display name |
| `email` | `text` | Optional contact |
| `phone` | `text` | Optional contact |
| `created_at` | `timestamptz` | Auto timestamp |

---

### 4. `interests`
Tracks which participants are interested in which items.  
(Each participant–item pair is unique.)

| Column | Type | Description |
|--------|------|-------------|
| `id` | `uuid` (PK) | Unique interest record |
| `item_id` | `uuid` (FK → items.id)` | The item of interest |
| `participant_id` | `uuid` (FK → participants.id)` | The interested person |
| `message` | `text` | Optional note (e.g. “Can I pick up on Saturday?”) |
| `created_at` | `timestamptz` | Auto timestamp |

**Constraints**
- ✅ Unique on (`item_id`, `participant_id`) — one interest per person per item  
- ✅ Trigger-enforced rule: participant’s `garage_id` must match item’s `garage_id`

---

## ⚙️ Indexes

```sql
create index if not exists idx_items_garage          on public.items(garage_id);
create index if not exists idx_participants_garage   on public.participants(garage_id);
create index if not exists idx_interests_item        on public.interests(item_id);
create index if not exists idx_interests_participant on public.interests(participant_id);
```

---

## 🔒 Row-Level Security (RLS)

| Table | Policy | Description |
|-------|---------|-------------|
| `garages` | `read garages` | Public can read |
| `items` | `read items` | Public can read |
| `participants` | `insert participants` | Public can insert to identify themselves |
| `participants` | `read participants` | Public **cannot** read (privacy) |
| `interests` | `insert interests` | Public can express interest |
| `interests` | `read interests` | Public **cannot** read (privacy) |

---

## 🧪 SQL Initial Data Seed

```sql
-- =========================================================
-- Garage Sale schema (idempotent fix for participant_id)
-- =========================================================

-- Ensure UUID helper is available (Supabase usually has this)
create extension if not exists "pgcrypto";

-- === TABLES ================================================================

-- 1) GARAGES
create table if not exists public.garages (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  owner_email text not null,
  created_at timestamptz not null default now()
);

-- 2) ITEMS
create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  garage_id uuid not null references public.garages(id) on delete cascade,
  title text not null,
  price_cents int,                -- NULL => FREE
  photo_url text,
  description text,
  status text not null default 'available', -- available | reserved | sold
  created_at timestamptz not null default now()
);

-- 3) PARTICIPANTS
create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  garage_id uuid not null references public.garages(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  created_at timestamptz not null default now()
);

-- 4) INTERESTS (may already exist without participant_id on older runs)
create table if not exists public.interests (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id) on delete cascade,
  -- participant_id will be (re)added below if missing
  message text,
  created_at timestamptz not null default now()
);

-- Ensure interests.participant_id column exists
alter table public.interests
  add column if not exists participant_id uuid;

-- Ensure FK interests.participant_id -> participants.id exists
do $$
begin
  if not exists (
    select 1
    from information_schema.table_constraints tc
    join information_schema.key_column_usage kcu
      on kcu.constraint_name = tc.constraint_name
     and kcu.table_schema   = tc.table_schema
    where tc.table_schema = 'public'
      and tc.table_name   = 'interests'
      and tc.constraint_type = 'FOREIGN KEY'
      and kcu.column_name = 'participant_id'
  ) then
    alter table public.interests
      add constraint interests_participant_fk
      foreign key (participant_id)
      references public.participants(id)
      on delete cascade;
  end if;
end$$;

-- === UNIQUENESS (use index so it's IF NOT EXISTS friendly) =================
-- One interest per participant per item
create unique index if not exists ux_interests_item_participant
  on public.interests(item_id, participant_id);

-- === CROSS-GARAGE GUARD ====================================================
-- Participant’s garage must equal item’s garage
create or replace function public.ensure_interest_same_garage()
returns trigger language plpgsql as $$
declare
  item_g uuid;
  part_g uuid;
begin
  select garage_id into item_g from public.items where id = NEW.item_id;
  select garage_id into part_g from public.participants where id = NEW.participant_id;

  if item_g is null or part_g is null or item_g <> part_g then
    raise exception 'Participant and Item must belong to the same garage';
  end if;

  return NEW;
end;
$$;

drop trigger if exists trg_interests_same_garage on public.interests;
create trigger trg_interests_same_garage
before insert or update on public.interests
for each row execute function public.ensure_interest_same_garage();

-- === INDEXES ===============================================================
create index if not exists idx_items_garage            on public.items(garage_id);
create index if not exists idx_participants_garage     on public.participants(garage_id);
create index if not exists idx_interests_item          on public.interests(item_id);
create index if not exists idx_interests_participant   on public.interests(participant_id);

-- === RLS ===================================================================
alter table public.garages      enable row level security;
alter table public.items        enable row level security;
alter table public.participants enable row level security;
alter table public.interests    enable row level security;

-- public can read garages and items
drop policy if exists "read garages" on public.garages;
create policy "read garages" on public.garages for select using (true);

drop policy if exists "read items" on public.items;
create policy "read items" on public.items for select using (true);

-- public can insert participants (so friends can identify themselves)
drop policy if exists "insert participants" on public.participants;
create policy "insert participants" on public.participants
for insert with check (true);

-- public cannot read participants (privacy)
drop policy if exists "read participants" on public.participants;
create policy "read participants" on public.participants
for select using (false);

-- public can insert interests (clicking "I'm interested")
drop policy if exists "insert interests" on public.interests;
create policy "insert interests" on public.interests
for insert with check (true);

-- public cannot read interests (privacy)
drop policy if exists "read interests" on public.interests;
create policy "read interests" on public.interests
for select using (false);

```

---

## 💡 Key Behaviors
- Visitors can view all items in a garage.
- Visitors identify themselves once per garage (`participants`).
- They can mark items they’re interested in (`interests`).
- Interests are **unique per participant–item** and **validated** to ensure they’re from the same garage.
- Privacy: only the host can view participants/interests in the admin dashboard.
