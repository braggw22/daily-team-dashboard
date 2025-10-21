-- DO-117 upgrade: Deliverables + Building/TR fields and filters

-- a) deliverables reference (A011/A012 primary)
create table if not exists public.deliverables (
  id uuid primary key default uuid_generate_v4(),
  code text not null,        -- e.g., A011, A012
  name text not null,        -- e.g., Survey, Installation
  unique (code, name)
);
alter table public.deliverables enable row level security;
create policy "deliverables readable" on public.deliverables for select using (true);

-- seed minimal rows (idempotent)
insert into public.deliverables (code, name)
select * from (values ('A011','Survey'),('A012','Installation')) v(code,name)
where not exists (select 1 from public.deliverables d where d.code=v.code and d.name=v.name);

-- b) extend tasks
do $$ begin
  if not exists (select 1 from information_schema.columns where table_name='tasks' and column_name='deliverable_id') then
    alter table public.tasks add column deliverable_id uuid references public.deliverables(id) on delete set null;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='tasks' and column_name='building') then
    alter table public.tasks add column building text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name='tasks' and column_name='tr_id') then
    alter table public.tasks add column tr_id text;
  end if;
end $$;

create index if not exists idx_tasks_deliverable on public.tasks(deliverable_id);
create index if not exists idx_tasks_building on public.tasks(building);
create index if not exists idx_tasks_tr on public.tasks(tr_id);

-- c) update view to include deliverable object
create or replace view public.tasks_view as
select
  t.*,
  jsonb_build_object('id', p.id, 'full_name', p.full_name, 'email', au.email) as owner,
  (select jsonb_build_object('id', d.id, 'code', d.code, 'name', d.name) from public.deliverables d where d.id = t.deliverable_id) as deliverable
from public.tasks t
left join public.profiles p on p.id = t.owner_id
left join auth.users au on au.id = p.id;
