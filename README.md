# Daily Team Dashboard (Supabase + Next.js)

A clean, scalable dashboard to track **team tasks**, **critical due dates**, and collect **Daily Tag‑Up** submissions (yesterday / today / risks).

## Stack
- Next.js 14 App Router
- Supabase (Postgres, Auth, RLS)
- No CSS framework required (simple CSS included)

## Quick Start

### 1) Supabase setup
1. Create a new Supabase project.
2. In the SQL editor, paste and run: `supabase/schema.sql`.
3. (Optional) Run `supabase/seed.sql` for sample tasks.
4. Get your **Project URL** and **anon key** from Project Settings → API.

### 2) App env
Copy `.env.example` to `.env.local` and set:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
ADMIN_EMAILS=you@example.com,gavin@example.com
```

### 3) Install & run
```
npm install
npm run dev
```
Open http://localhost:3000

### 4) Auth
- Go to `/auth`, enter your email, and use the Magic Link to sign in.
- A `profiles` row is created on first login via trigger.

## Features
- **Dashboard**: All tasks, sorted by due date; critical (≤3 days) highlighted.
- **Task CRUD**: Create tasks, assign owner, set progress & status.
- **Daily Tag‑Up**: Each user can submit for a date (one row/user/day). Upsert logic prevents duplicates.
- **RLS Policies**: 
  - All authenticated users can read tasks & updates.
  - Only task owner/creator can update a task.
  - Only a user can write their daily update.
- **Admin hint**: `ADMIN_EMAILS` env is used client-side to show an "admin" badge. (You can extend with real DB roles later.)

## Extend
- Add Kanban columns per `status`.
- Add Calendar view (ICS export or simple grid).
- Add Projects / Deliverables tables (A011, A012, BLDG, TRs).
- Add file attachments (Supabase Storage).

## Notes
- Views `tasks_view` and `daily_updates_view` join profiles & auth.users for friendly names.
- Minimal styles are inline for portability. Swap to Tailwind later if you want Bowhead‑blue vibes.

## Deploy
- Vercel → new project → import this repo.
- Set the same env vars in Vercel.
- Ensure Supabase Auth URL (redirect) includes your Vercel domain.

---

**Made for Weston “Daddy” Bragg’s DO‑117 workflow.**


### 4.5) Team seed (admins + sample tasks)
After your four admins have logged in once at `/auth`, run `supabase/team_seed.sql` in the SQL editor to set display names and seed example tasks to them.


## New: Kanban + Calendar
- **/kanban**: Drag-and-drop between Not Started / In Progress / Review / Done. Uses HTML5 DnD and direct Supabase updates.
- **/calendar**: Monthly calendar that shows tasks on their **due_date**. Click through to task detail.


## DO-117 Upgrade (Deliverables + Building/TR)
Run `supabase/upgrade_do117.sql` in Supabase to add:
- `deliverables` table (A011/A012)
- `tasks` columns: `deliverable_id`, `building`, `tr_id`
- Updated `tasks_view` to include a `deliverable` object
Then use the enhanced **New Task** and **Task Detail** forms to tag tasks by deliverable, building, and TR. The **Tasks** page now has filters for deliverable, building, and owner.
