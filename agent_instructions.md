# agent.md — Build Instructions for Codex

## Goal
Implement a simple, realtime “garage sale” app:
- Seller creates a **garage**, adds **items**.
- Friends identify with **name + emoji + email/phone** (no password) and submit **interests** on items.
- UI updates in realtime (interest counts, status).
- Admin area for seller with basic KPIs + item status controls.

## Non-Goals (for V1)
- No global auth system.
- No payments yet.
- No email sending yet (leave TODO with function boundaries).
- No file uploads yet (use `photo_url` string; TODO: Supabase Storage).

## Tech & Conventions
- Next.js 14 App Router + TypeScript
- Supabase client (browser) and a thin server helper
- Tailwind for simple styling
- Use server components for data-fetching pages; client components for modals/forms.
- All public reads happen via anon key + RLS; admin reads happen via **server** and require admin cookie.

## Project Structure (create/ensure)
```
/app
  /page.tsx                # garages list
  /new/page.tsx            # create garage flow
  /g/[slug]/page.tsx       # garage detail (items grid)
  /admin/page.tsx          # admin dashboard (password gated)
  /api
    /garages/route.ts      # POST create garage
    /items/route.ts        # POST create item
    /items/update/route.ts # POST update item status (admin only)
    /participants/route.ts # POST create/lookup participant
    /interest/route.ts     # POST create interest entry
/lib
  /supabaseClient.ts       # browser client
  /supabaseServer.ts       # server helper (anon key)
/components
  /ItemCard.tsx
  /InterestDialog.tsx
  /EmojiPicker.tsx
  /ParticipantBadge.tsx
  /GarageCreator.tsx       # small form for /new
  /AdminBar.tsx
```

## Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `ADMIN_PASS` (plaintext password compared server-side; on success, set `admin=1` HttpOnly cookie)

## Data Model (must match Supabase)
- `garages(id, slug unique, title, owner_email, created_at)`
- `items(id, garage_id→garages.id, title, price_cents null, photo_url, description, status default 'available', created_at)`
- `participants(id, garage_id→garages.id, name, emoji, email null, phone null, created_at)`
- `interests(id, item_id→items.id, participant_id→participants.id, message null, created_at)`
- Indexes: `idx_items_garage`, `idx_interests_item`, `idx_participants_garage`
- RLS:
  - `garages`: `select using (true)`
  - `items`: `select using (true)`
  - `participants`: `insert with check (true)`; optional `select:false`
  - `interests`: `insert with check (true)`; optional `select:false`

## Tasks (ordered)

### 1) Clients & Utilities
- `lib/supabaseClient.ts`:
  ```ts
  import { createClient } from '@supabase/supabase-js';
  export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  ```
- `lib/supabaseServer.ts`:
  ```ts
  import { createClient } from '@supabase/supabase-js';
  export const supabaseServer = () =>
    createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  ```

### 2) Home `/`
- Server component. Fetch `garages(slug,title)` and render list linking to `/g/[slug]`.
- Add header button “Create Garage” → `/new`.

### 3) Create Garage `/new`
- Render `<GarageCreator />`: fields `title`, auto-slug, `owner_email`.
- POST to `/api/garages`:
  - Validate, insert into `garages`.
  - Redirect to `/g/[slug]`.

### 4) Garage page `/g/[slug]`
- Server component:
  - Fetch garage by slug.
  - Fetch items for garage ordered by `created_at desc`.
- Render a responsive grid of `<ItemCard />`:
  - show image, title, description, `FREE` if `price_cents is null` else `$`.
  - include `<InterestDialog itemId={...} />`.
  - show a **live** badge “X interested” (subscribe to Realtime on `interests` for that garage and aggregate counts client-side).
- Include `<AdminBar>` if admin cookie present: “Add item”, “Mark reserved/sold”, “Close garage”, “Delete garage”.

### 5) Add Item (admin)
- `<AdminBar>` “Add item” opens modal to POST to `/api/items`:
  - insert: `(garage_id, title, price_cents|null, photo_url, description)`.
  - on success: item appears via realtime (or manual re-fetch).

### 6) Participants & Interest (friend flow)
- First action in `<InterestDialog>`:
  - If no `participant_id` in `localStorage` for this `garage_id`, POST to `/api/participants` with `{garage_id, name, emoji, email/phone}` and store returned `participant_id` in localStorage (key: `p:${garage_id}`).
- Then POST to `/api/interest` with `{ item_id, participant_id, message? }`.
- On success, close modal and toast “Thanks! We’ll let the seller know.”  
- **Realtime:** subscribe to interests on this garage to update item badges.

### 7) Admin Dashboard `/admin`
- If no `admin=1` cookie: render password form → compare to `ADMIN_PASS` (server action). On success, set HttpOnly cookie and redirect.
- With admin cookie:
  - Show KPIs:
    - total items in selected garage
    - total interests
    - unique participants (count distinct `participant_id`)
  - Table view with item title, status, interest count; actions to update status via `/api/items/update`.

### 8) Realtime
- Client component on `/g/[slug]`:
  - subscribe to `items:garage_id = ...` (status changes, new items).
  - subscribe to `interests` filtered by items in this garage; recompute counters in state.

### 9) Styling Rules
- Tailwind utilities. Rounded-2xl, 12–16px paddings, subtle shadow.
- Use system font; base 18px; headings semi-bold.
- Palette: bg `#0B0E14` (dark) or `#111827`; accents `#7C3AED`, `#06B6D4`, success `#10B981`.
- Encourage emoji in UI (`emoji` field on participant, badges in cards).

### 10) TODO hooks (leave as comments)
- Email notification on new interest:
  - Create `lib/notify.ts` placeholder with `sendNewInterestEmail(ownerEmail, item, participant)`.
  - In `/api/interest`, call the stub (no-op for now).
- Photo upload:
  - Add `// TODO: integrate Supabase Storage for camera upload; for now use photo_url field`.

## Testing & Acceptance
- `/new` creates a new garage and redirects to `/g/[slug]`.
- Adding items works; they appear without refresh.
- Submitting interest creates `participants` (if needed) and `interests`; per-item count updates live.
- `/admin` gated by password; KPIs compute correctly.
- All pages render with no blocking TypeScript or build errors.

