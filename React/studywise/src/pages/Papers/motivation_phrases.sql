-- StudyWise motivation phrases — aligns with the existing table.
-- Table already exists with columns: id, phrase, is_active, created_at, updated_at
-- This script only ensures RLS policies and the daily-pick function exist.
-- Run in the Supabase SQL editor AFTER admin_papers.sql (uses public.is_admin()).

-- 1. Ensure the table exists (matches your actual columns).
create table if not exists public.motivation_phrases (
  id uuid primary key default gen_random_uuid(),
  phrase text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.motivation_phrases enable row level security;

-- 2. Row Level Security
--    Public (students) can read active phrases only
--    Admins (authenticated + is_admin) can insert/update/delete

drop policy if exists "Public can read active motivation" on public.motivation_phrases;
drop policy if exists "Admins can manage motivation" on public.motivation_phrases;

create policy "Public can read active motivation"
  on public.motivation_phrases
  for select
  to anon, authenticated
  using (is_active = true);

create policy "Admins can manage motivation"
  on public.motivation_phrases
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 3. Keep updated_at fresh on every update.
create or replace function public.touch_motivation_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists motivation_phrases_touch_updated_at on public.motivation_phrases;
create trigger motivation_phrases_touch_updated_at
  before update on public.motivation_phrases
  for each row
  execute function public.touch_motivation_updated_at();

-- 4. Function to get the daily motivation phrase.
--    Deterministic per day: same phrase for every student, rotates daily.
create or replace function public.get_daily_motivation()
returns table (id uuid, phrase text)
language sql
stable
security definer
set search_path = public
as $$
  select p.id, p.phrase
  from public.motivation_phrases p
  where p.is_active = true
  order by abs(hashtext(p.id::text || current_date::text))
  limit 1;
$$;

-- 5. Seed a few starter phrases (skips if the table already has rows).
insert into public.motivation_phrases (phrase)
select phrase
from (values
  ('You are closer than you think.'),
  ('Keep going, you got this!'),
  ('Small steps every day lead to big results!'),
  ('Believe in yourself and keep pushing forward.'),
  ('Every expert was once a beginner.')
) as seed(phrase)
where not exists (select 1 from public.motivation_phrases limit 1);
