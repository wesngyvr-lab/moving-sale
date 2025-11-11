# 🧰 Furniture / Garage Sale — Moving Sale

A lightweight, friend-first “garage sale” web app. You (the seller) create a **garage**, add items with pics, and share a link. Friends visit, pick a **name + emoji**, tap **I’m interested**, and you see interest in realtime.

## TL;DR
- Seller creates a **garage** from the web app (no complex auth).
- Items: title, price (nullable for FREE), photo, description, status.
- Friends: enter **name + emoji + email/phone**, then mark **Interest**.
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
- Enter **name + emoji + email/phone** (no password).
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
- Tailwind (light touch, Gen-Z emoji vibe)
- (TODO) Email notifications (Resend / SendGrid)
- (TODO) Supabase Storage for photo uploads

---

## Data Model

**garages**
- `id` (uuid, pk)
- `slug` (text, unique)
- `title` (text)
- `owner_email` (text)
- `created_at` (timestamptz)

**items**
- `id` (uuid, pk)
- `garage_id` (uuid → garages.id, cascade delete)
- `title` (text)
- `price_cents` (int, nullable ⇒ FREE when null)
- `photo_url` (text)
- `description` (text)
- `status` (text, default `available`) — `available | reserved | sold`
- `created_at` (timestamptz)

**participants**  ← friend identity local to a garage
- `id` (uuid, pk)
- `garage_id` (uuid → garages.id)
- `name` (text)
- `emoji` (text, e.g., "🧋")
- `email` (text, nullable)
- `phone` (text, nullable)
- `created_at` (timestamptz)

**interests**
- `id` (uuid, pk)
- `item_id` (uuid → items.id)
- `participant_id` (uuid → participants.id)
- `message` (text, nullable)
- `created_at` (timestamptz)

**Indexes**
- `idx_items_garage (items.garage_id)`
- `idx_interests_item (interests.item_id)`
- `idx_participants_garage (participants.garage_id)`

**RLS (summary)**
- `garages`: `select: true` (public read)
- `items`: `select: true` (public read)
- `participants`: `insert: true`; no public select (privacy)
- `interests`: `insert: true`; no public select (privacy)
> Admin view fetches interests/participants server-side, gated by cookie check.

---

## Environment

Create `.env.local` (do not commit):
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
ADMIN_PASS=choose-a-strong-password
```

Add the same keys in **Vercel → Settings → Environment Variables** (Preview + Production).

---

## Local Dev

```bash
npm install
npm run dev
# open http://localhost:3000  (or 3001 if 3000 is in use)
```

---

## How to Use (V1)

1. **Create a garage** at `/new`  
   - Enter `title`, slug auto-suggested from title (editable), `owner_email`.
2. You land on `/g/[slug]` with an **empty item list**.
3. Click **Add item** (in admin bar) → fill title, price, description, photo URL.
4. Share link `/g/[slug]` with friends.
5. Friends pick **name + emoji + email/phone** (first time per garage), then click **I’m interested** on items.  
6. You watch **live interest counts** and can **mark status** to `reserved/sold`.
7. Admin dashboard at `/admin` (enter `ADMIN_PASS`) to see KPIs and manage status.

---

## Visual Style (for contributors)
- **Vibe:** light, friendly, emoji-forward; minimal components; large tap targets.
- **Typography:** system font stack; headings semi-bold; 18px base.
- **Palette:**
  - BG: `#0B0E14` (near-black) or `#111827` (gray-900)
  - Cards: `#111827`/white in light theme
  - Accent: `#7C3AED` (purple), `#06B6D4` (teal)
  - Success: `#10B981`, Warning: `#F59E0B`
- **Components:** soft corners (rounded-2xl), subtle shadows, 12–16px padding.
- **Emoji:** encourage for participant identity and item fun (🥳🩋📚).

---

## Roadmap
- [ ] Email notifications to owner on new interest
- [ ] Password-lock garages for friends
- [ ] Supabase Storage upload from phone (camera)
- [ ] CSV export (items + interest list)
- [ ] Soft-delete items; archive garage
- [ ] Optional payments (Venmo link “Settle”)

