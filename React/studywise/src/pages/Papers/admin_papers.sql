-- StudyWise admin papers migration.
-- Run this ONCE in the Supabase SQL editor AFTER past_papers.sql.
-- Matches the existing past_papers schema:
--   id, subject_id, year, title, paper_url, memo_url, created_at, term, paper_number
-- This migration adds admin authorization + storage policies only.
-- It does NOT add or modify any past_papers columns.

-- 1. Admin allowlist. One row per authorized administrator.
--    id must match auth.users.id of the admin account.
create table if not exists public.admin_users (
  id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
-- No policies on admin_users: only the security-definer function below can read it.

-- 2. is_admin(): true when the logged-in user's UUID is in admin_users.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where id = auth.uid()
  );
$$;

-- 3. Row Level Security on past_papers.
--    Students (anon) can read all rows.
--    Admins (authenticated + is_admin) can insert/update/delete.

drop policy if exists "Public can read past papers" on public.past_papers;
drop policy if exists "Admins can read all papers" on public.past_papers;
drop policy if exists "Admins can insert papers" on public.past_papers;
drop policy if exists "Admins can update papers" on public.past_papers;
drop policy if exists "Admins can delete papers" on public.past_papers;

create policy "Public can read past papers"
  on public.past_papers
  for select
  to anon, authenticated
  using (true);

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

-- 4. Storage bucket for the PDF files.
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

-- 5. Register the first administrator.
--    Replace the UUID below with the admin user's ID from
--    Authentication -> Users in the Supabase dashboard.
-- insert into public.admin_users (id)
-- values ('00000000-0000-0000-0000-000000000000');
--
--    Or register by email (run after creating the auth user):
-- insert into public.admin_users (id)
-- select id from auth.users where email = 'admin@example.com';
