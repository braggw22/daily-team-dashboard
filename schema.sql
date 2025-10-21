-- Run in Supabase SQL editor

-- 1) Enable UUIDs
create extension if not exists "uuid-ossp";

-- 2) Auth: create a profiles table linked to auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamp with time zone default now()
);
alter table public.profiles enable row level security;

create policy "profiles are readable to authenticated" on public.profiles
for select using (auth.role() = 'authenticated');

create policy "user can update own profile" on public.profiles
for update using (auth.uid() = id);

-- 3) Tasks
create table if not exists public.tasks (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  start_date date,
  due_date date,
  status text not null default 'Not Started',
  progress int check (progress between 0 and 100) default 0,
  owner_id uuid references public.profiles(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default now()
);
alter table public.tasks enable row level security;

-- Allow: authenticated users can read all tasks.
create policy "tasks readable" on public.tasks for select using (auth.role() = 'authenticated');

-- Insert: creator can insert and set themselves as created_by by default (via triggers or client logic)
create policy "insert tasks" on public.tasks for insert with check (auth.role() = 'authenticated');

-- Update: owner or creator can update
create policy "update own or owner tasks" on public.tasks
for update using (auth.uid() = created_by or auth.uid() = owner_id);

-- 4) Daily Updates (unique per user per date)
create table if not exists public.daily_updates (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  date date not null,
  yesterday text,
  today text,
  risks text,
  created_at timestamp with time zone default now(),
  unique (user_id, date)
);
alter table public.daily_updates enable row level security;

-- Read: everyone authenticated can read (for the daily board)
create policy "daily updates readable" on public.daily_updates for select using (auth.role() = 'authenticated');

-- Insert/Upsert: only the user themselves can write their row
create policy "user writes own daily update" on public.daily_updates
for insert with check (auth.uid() = user_id);

create policy "user updates own daily update" on public.daily_updates
for update using (auth.uid() = user_id);

-- 5) Convenience views
create or replace view public.tasks_view as
select
  t.*,
  jsonb_build_object('id', p.id, 'full_name', p.full_name, 'email', au.email) as owner
from public.tasks t
left join public.profiles p on p.id = t.owner_id
left join auth.users au on au.id = p.id;

create or replace view public.daily_updates_view as
select
  d.*,
  jsonb_build_object('id', p.id, 'full_name', p.full_name, 'email', au.email) as user
from public.daily_updates d
left join public.profiles p on p.id = d.user_id
left join auth.users au on au.id = p.id;

-- 6) Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name) values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
