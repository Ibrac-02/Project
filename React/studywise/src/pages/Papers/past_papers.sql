-- Run this in the Supabase SQL editor before the Past Papers page can load rows.
-- Uses the publishable key on the website for public read only.

create table if not exists public.past_papers (
  id uuid primary key default gen_random_uuid(),
  subject_id text not null,
  year integer not null,
  title text not null,
  paper_url text,
  memo_url text,
  created_at timestamptz not null default now()
);

alter table public.past_papers enable row level security;

drop policy if exists "Public can read past papers" on public.past_papers;

create policy "Public can read past papers"
  on public.past_papers
  for select
  to anon, authenticated
  using (true);
