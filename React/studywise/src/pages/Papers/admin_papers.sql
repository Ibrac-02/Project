-- StudyWise admin papers migration.
-- Run this ONCE in the Supabase SQL editor AFTER past_papers.sql.
-- Adds publish control, term/paper number metadata, admin authorization,
-- and a public-read / admin-write storage bucket for the PDFs.

-- 1. Extra columns on the existing table (existing columns are untouched).
alter table public.past_papers
  add column if not exists is_published boolean not null default false,
  add column if not exists term text,
  add column if not exists paper_number text,
  add column if not exists updated_at timestamptz not null default now();

-- 2. Admin allowlist. Add admin emails here (lowercase not required).
create table if not exists public.admin_emails (
  email text primary key,
  created_at timestamptz not null default now()
);

alter table public.admin_emails enable row level security;
-- No policies on admin_emails: only the security-definer function below can read it.

-- 3. is_admin(): true when the logged-in user's JWT email is in admin_emails.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_emails
    where lower(email) = lower(auth.jwt() ->> 'email')
  );
$$;

-- 4. Row Level Security on past_papers.
--    Students (anon) see published rows only.
--    Admins (authenticated + is_admin) see and manage everything.

drop policy if exists "Public can read past papers" on public.past_papers;
drop policy if exists "Published papers are public" on public.past_papers;
drop policy if exists "Admins can read all papers" on public.past_papers;
drop policy if exists "Admins can insert papers" on public.past_papers;
drop policy if exists "Admins can update papers" on public.past_papers;
drop policy if exists "Admins can delete papers" on public.past_papers;

create policy "Published papers are public"
  on public.past_papers
  for select
  to anon
  using (is_published = true);

create policy "Admins can read all papers"
  on public.past_papers
  for select
  to authenticated
  using (public.is_admin());

create policy "Admins can insert papers"
  on public.past_papers
  for insert
  to authenticated
  with check (public.is_admin());

create policy "Admins can update papers"
  on public.past_papers
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete papers"
  on public.past_papers
  for delete
  to authenticated
  using (public.is_admin());

-- Keep updated_at fresh on every update.
create or replace function public.touch_past_papers_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists past_papers_touch_updated_at on public.past_papers;
create trigger past_papers_touch_updated_at
  before update on public.past_papers
  for each row
  execute function public.touch_past_papers_updated_at();

-- 5. Storage bucket for the PDF files.
--    Public bucket so students can open files without logging in.
--    Only admins can write/delete objects inside it.
insert into storage.buckets (id, name, public)
values ('past-papers', 'past-papers', true)
on conflict (id) do update set public = true;

drop policy if exists "Public can read past paper files" on storage.objects;
drop policy if exists "Admins can upload past paper files" on storage.objects;
drop policy if exists "Admins can update past paper files" on storage.objects;
drop policy if exists "Admins can delete past paper files" on storage.objects;

create policy "Public can read past paper files"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'past-papers');

create policy "Admins can upload past paper files"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'past-papers' and public.is_admin());

create policy "Admins can update past paper files"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'past-papers' and public.is_admin())
  with check (bucket_id = 'past-papers' and public.is_admin());

create policy "Admins can delete past paper files"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'past-papers' and public.is_admin());
