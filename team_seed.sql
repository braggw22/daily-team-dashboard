-- Team seed for Bowhead admins and sample tasks.
-- IMPORTANT: Run AFTER each user has logged in once via /auth (so auth.users exists).

-- 1) Set friendly names for the four admins (after first login)
update public.profiles p
set full_name = x.full_name
from (
  select u.id,
         case lower(u.email)
           when 'brian.burrer@bowhead.com' then 'Brian Burrer'
           when 'chase.cole@bowhead.com'   then 'Chase Cole'
           when 'weston.bragg@bowhead.com' then 'Weston Bragg'
           when 'gavin.lasater@bowhead.com' then 'Gavin Lasater'
         end as full_name
  from auth.users u
  where lower(u.email) in (
    'brian.burrer@bowhead.com',
    'chase.cole@bowhead.com',
    'weston.bragg@bowhead.com',
    'gavin.lasater@bowhead.com'
  )
) as x
where p.id = x.id;

-- 2) Seed example tasks to those owners
with owners as (
  select
    (select id from public.profiles p join auth.users u on u.id=p.id where lower(u.email)='weston.bragg@bowhead.com') as weston,
    (select id from public.profiles p join auth.users u on u.id=p.id where lower(u.email)='chase.cole@bowhead.com') as chase,
    (select id from public.profiles p join auth.users u on u.id=p.id where lower(u.email)='brian.burrer@bowhead.com') as brian,
    (select id from public.profiles p join auth.users u on u.id=p.id where lower(u.email)='gavin.lasater@bowhead.com') as gavin
)
insert into public.tasks (title, description, start_date, due_date, status, progress, owner_id)
select 'PRTH — Holocom narrative checks', 'Review latest submittal; prep RFIs', current_date, current_date + 1, 'In Progress', 20, o.weston from owners o
union all
select 'BLDG 1300 — drawing package review', 'Lead the review and QA', current_date - 2, current_date + 3, 'In Progress', 45, o.chase from owners o
union all
select 'PLM Dashboard v1', 'Baseline daily tag-up + task tracker', current_date - 1, current_date + 5, 'Not Started', 0, o.gavin from owners o
union all
select 'Weekly risk sweep', 'Consolidate impediments from tag-ups', current_date, current_date + 6, 'Not Started', 0, o.brian from owners o;
