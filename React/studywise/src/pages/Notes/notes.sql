-- StudyWise notes migration.
-- Run this ONCE in the Supabase SQL editor.
-- Depends on the admin allowlist from admin_papers.sql (public.admin_users + public.is_admin()).

-- 1. Notes table. Published notes are visible to everyone (anon).
--    Drafts and all writes are admin-only via RLS.
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  subject_id text not null,
  title text not null,
  description text,
  file_url text,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Notes are published by default. Safe to re-run: fixes tables created earlier
-- with a `false` default so new rows publish unless the app explicitly sends false.
alter table public.notes alter column published set default true;

alter table public.notes enable row level security;

drop policy if exists "Public can read published notes" on public.notes;
drop policy if exists "Admins can read all notes" on public.notes;
drop policy if exists "Admins can insert notes" on public.notes;
drop policy if exists "Admins can update notes" on public.notes;
drop policy if exists "Admins can delete notes" on public.notes;

-- Students (anon + authenticated non-admins) only see published notes.
create policy "Public can read published notes"
  on public.notes
  for select
  to anon, authenticated
  using (published = true);

-- Admins see every note (published or draft) so they can manage them.
create policy "Admins can read all notes"
  on public.notes
  for select
  to authenticated
  using (public.is_admin());

create policy "Admins can insert notes"
  on public.notes
  for insert
  to authenticated
  with check (public.is_admin());

create policy "Admins can update notes"
  on public.notes
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete notes"
  on public.notes
  for delete
  to authenticated
  using (public.is_admin());

-- Keep updated_at fresh on edit.
create or replace function public.set_notes_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_notes_updated_at on public.notes;
create trigger trg_notes_updated_at
  before update on public.notes
  for each row
  execute function public.set_notes_updated_at();

-- 2. Storage bucket for note PDFs.
--    Public bucket so students can open/download notes without logging in.
--    Only admins can upload/replace/delete objects inside it.
insert into storage.buckets (id, name, public)
values ('studywise-notes', 'studywise-notes', true)
on conflict (id) do update set public = true;

drop policy if exists "Public can read note files" on storage.objects;
drop policy if exists "Admins can upload note files" on storage.objects;
drop policy if exists "Admins can update note files" on storage.objects;
drop policy if exists "Admins can delete note files" on storage.objects;

create policy "Public can read note files"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'studywise-notes');

create policy "Admins can upload note files"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'studywise-notes' and public.is_admin());

create policy "Admins can update note files"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'studywise-notes' and public.is_admin())
  with check (bucket_id = 'studywise-notes' and public.is_admin());

create policy "Admins can delete note files"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'studywise-notes' and public.is_admin());
