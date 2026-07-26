-- ============================================================
-- HOBZ PORTFOLIO — SUPABASE SCHEMA
-- Run this once in Supabase → SQL Editor → New query → Run.
-- ============================================================

-- ---------- 1. TABLE -----------------------------------------
create table if not exists public.case_studies (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,

  -- fixed frame
  company     text not null default '',
  logo        text,
  title       text not null default '',
  tension     text default '',
  meta        jsonb not null default '[]'::jsonb,
  problem     jsonb not null default '{"label":"The problem","body":""}'::jsonb,

  -- everything the builder adds
  sections    jsonb not null default '[]'::jsonb,

  status      text not null default 'draft' check (status in ('draft','published')),
  order_index int  not null default 0,

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists case_studies_status_idx on public.case_studies (status, order_index);

-- keep updated_at honest
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists case_studies_touch on public.case_studies;
create trigger case_studies_touch
  before update on public.case_studies
  for each row execute function public.touch_updated_at();

-- ---------- 2. ROW LEVEL SECURITY ----------------------------
-- The anon key is PUBLIC. These policies are the only thing
-- stopping a stranger from editing the site.
alter table public.case_studies enable row level security;

-- Visitors: may read published case studies. Nothing else.
drop policy if exists "public reads published" on public.case_studies;
create policy "public reads published"
  on public.case_studies for select
  to anon
  using (status = 'published');

-- Signed-in (you): full access, drafts included.
drop policy if exists "owner reads all" on public.case_studies;
create policy "owner reads all"
  on public.case_studies for select
  to authenticated using (true);

drop policy if exists "owner inserts" on public.case_studies;
create policy "owner inserts"
  on public.case_studies for insert
  to authenticated with check (true);

drop policy if exists "owner updates" on public.case_studies;
create policy "owner updates"
  on public.case_studies for update
  to authenticated using (true) with check (true);

drop policy if exists "owner deletes" on public.case_studies;
create policy "owner deletes"
  on public.case_studies for delete
  to authenticated using (true);

-- ---------- 3. MEDIA STORAGE ---------------------------------
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- Anyone may view media; only you may upload or remove it.
drop policy if exists "public views media" on storage.objects;
create policy "public views media"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'media');

drop policy if exists "owner uploads media" on storage.objects;
create policy "owner uploads media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'media');

drop policy if exists "owner deletes media" on storage.objects;
create policy "owner deletes media"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'media');

-- ---------- 4. SEED ------------------------------------------
insert into public.case_studies (slug, company, title, tension, meta, problem, status)
values (
  'nawy-sahel-map',
  'Nawy',
  'How do you choose a beach house that hasn''t been built?',
  'Egypt''s North Coast filled with off-plan compounds almost overnight. Lists and filters could not answer the question buyers were actually asking.',
  '[{"label":"Role","value":"Senior Product Designer"},
    {"label":"Shipped","value":"April 2024"},
    {"label":"Platform","value":"Mobile app + web"},
    {"label":"Company","value":"Nawy"}]'::jsonb,
  '{"label":"The problem","body":"Write the problem you found and framed."}'::jsonb,
  'draft'
)
on conflict (slug) do nothing;

-- ============================================================
-- ADDED: the tables the code actually queries.
--
-- lib/case-studies.ts reads and writes public.projects and a `media`
-- table, but neither was defined here. Any table created by hand in the
-- Supabase dashboard has RLS DISABLED by default, and the anon key is
-- public and shipped to every browser. A missing policy file is not a
-- missing feature, it is an open door: without the rows below, a stranger
-- with the key from your JavaScript can read, edit and delete every
-- project on the site.
-- ============================================================

create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null default '',
  logo        text default '',
  description text default '',
  role        text default '',
  period      text default '',
  order_index int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.projects enable row level security;

drop policy if exists "public reads projects" on public.projects;
create policy "public reads projects"
  on public.projects for select to anon using (true);

drop policy if exists "owner writes projects" on public.projects;
create policy "owner writes projects"
  on public.projects for all to authenticated using (true) with check (true);

-- Same treatment for the media table, if the code is using one.
create table if not exists public.media (
  id         uuid primary key default gen_random_uuid(),
  path       text unique not null,
  url        text not null default '',
  created_at timestamptz not null default now()
);

alter table public.media enable row level security;

drop policy if exists "public reads media rows" on public.media;
create policy "public reads media rows"
  on public.media for select to anon using (true);

drop policy if exists "owner writes media rows" on public.media;
create policy "owner writes media rows"
  on public.media for all to authenticated using (true) with check (true);
