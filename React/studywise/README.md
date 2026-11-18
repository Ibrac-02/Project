# StudyWise

A study hub for Grade 11 learners. Students browse **past papers**, **notes**, and a
**daily motivation** phrase — all without logging in. Administrators sign in to upload and
manage that content.

Built as a single-page app with **React + Vite**, **React Router**, and **Supabase**
(Postgres + Auth + Storage).

---

## Features

### Student (public, no login)

- **Home dashboard** — welcome banner, resource cards, subject grid, latest updates, and a daily motivation card.
- **Past papers** — filter published papers by subject and year; open the question paper or memo PDF.
- **Notes** — filter published notes by subject; read/download each note PDF.
- **Daily motivation** — one phrase per day, fetched from Supabase (see below).

### Admin (authenticated)

- **Admin dashboard** — stats and links to every management area.
- **Past papers** — upload, edit, replace file, delete.
- **Notes** — upload (published by default), edit, publish/unpublish, replace file, delete.
- **Motivation** — add, edit, activate/deactivate, and delete phrases.

All admin write access is enforced by Postgres **Row Level Security**, not just the UI.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | React 19 |
| Build tool | Vite 8 |
| Routing | React Router 7 |
| Backend | Supabase (`@supabase/supabase-js`) — Postgres, Auth, Storage |
| Lint | ESLint 10 (flat config) |
| Styling | Plain CSS modules co-located with components |

---

## Prerequisites

- Node.js 20+ and npm
- A Supabase project (free tier is fine)

---

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Create .env.local in the project root (see below)

# 3. Start the dev server
npm run dev
```

### Environment variables

Create `.env.local` in the project root:

```bash
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<your-anon/publishable-key>
```

Both values come from **Supabase → Project Settings → API**. The app reads them in
`src/lib/supabase.js` and throws on startup if either is missing.

> Never commit `.env.local`. It is already covered by the `*.local` rule in `.gitignore`.
> Use the **publishable (anon)** key only — never the service-role key in a browser app.

### Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the Vite dev server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

---

## Supabase setup

Run the SQL migrations **once each**, in this order, in the Supabase SQL editor:

1. `src/pages/Papers/past_papers.sql` — `past_papers` table + public read policy
2. `src/pages/Papers/admin_papers.sql` — admin allowlist, `is_admin()`, papers RLS, `past-papers` storage bucket
3. `src/pages/Notes/notes.sql` — `notes` table, RLS, `studywise-notes` storage bucket
4. `src/pages/Papers/motivation_phrases.sql` — `motivation_phrases` table, RLS, seed data

Migrations 2–4 depend on `public.is_admin()` and `public.admin_users`, which are created in
step 2.

### Tables

| Table | Columns |
|---|---|
| `public.past_papers` | `id`, `subject_id`, `year`, `title`, `term`, `paper_number`, `paper_url`, `memo_url`, `created_at` |
| `public.notes` | `id`, `subject_id`, `title`, `description`, `file_url`, `published`, `created_at`, `updated_at` |
| `public.motivation_phrases` | `id`, `phrase`, `is_active`, `created_at`, `updated_at` |
| `public.admin_users` | `id` (references `auth.users.id`), `created_at` |

> `term` and `paper_number` are read by the Past Papers page. If your `past_papers` table was
> created from an earlier version without them, add them:
>
> ```sql
> alter table public.past_papers add column if not exists term text;
> alter table public.past_papers add column if not exists paper_number text;
> ```

### Storage buckets

| Bucket | Visibility | Used for |
|---|---|---|
| `past-papers` | Public | Past paper and memo PDFs |
| `studywise-notes` | Public | Note PDFs |

Public buckets let students open files without logging in; write/delete is restricted to
admins by storage policies.

### Admin access model

- Admin status is an allowlist row in `public.admin_users` whose `id` matches the user's
  `auth.users.id`.
- `public.is_admin()` is a `security definer` function returning `true` when the signed-in
  user is in that table.
- The frontend calls `supabase.rpc('is_admin')` to gate admin routes; RLS uses the same
  function to gate data.

**Register the first admin:**

```sql
-- By email (after the auth user exists)
insert into public.admin_users (id)
select id from auth.users where email = 'admin@example.com';
```

If a signed-in user reaches `/admin` but sees **Access Denied**, verify: the migration ran,
their UUID is in `public.admin_users`, and `is_admin()` returns `true`.

---

## Routes

| Path | Page | Access |
|---|---|---|
| `/` | Dashboard | Public |
| `/past-papers` | Past Papers | Public |
| `/notes` | Notes | Public |
| `/admin/login` | Admin login | Public |
| `/admin` | Admin dashboard | Admin |
| `/admin/papers/upload` | Upload paper | Admin |
| `/admin/papers` | Manage papers | Admin |
| `/admin/notes/upload` | Upload note | Admin |
| `/admin/notes` | Manage notes | Admin |
| `/admin/motivation` | Manage motivation | Admin |
| `*` | Redirect to `/` | — |

Admin routes are wrapped in `AdminProtectedRoute`, which redirects unauthenticated users to
`/admin/login` and blocks non-admins.

---

## Daily motivation logic

The phrase is fetched from `motivation_phrases` (active rows only) and picked
deterministically from the current UTC day:

```js
const dayIndex = Math.floor(Date.now() / 86400000)
const phrase = activePhrases[dayIndex % activePhrases.length]
```

Because every client computes the same index for the same UTC day, **all students see the
same phrase**, and it rotates once per day.

---

## Project structure

```
src/
├── components/           # Reusable UI (Header, Footer, cards, nav, icons)
│   ├── icons/            # Shared SVG icon set + icon-id maps
│   └── ...               # One folder per component with a co-located .css
├── data/
│   └── dashboardData.js  # Static UI data: subjects, resource cards, updates
├── lib/
│   └── supabase.js       # Supabase client (reads VITE_ env vars)
├── pages/
│   ├── Dashboard/        # Student home
│   ├── Papers/           # Past papers page, fetchPastPapers.js, subjectMeta.js, *.sql
│   ├── Notes/            # Notes page, fetchNotes.js, notes.sql
│   └── Admin/            # Login, protected route, dashboard, manage + upload pages,
│                         #   adminPapers.js / adminNotes.js / adminMotivation.js data layers
├── App.jsx               # Router + route table
└── main.jsx              # React entry point
```

### Data layer

All Supabase access lives in small modules — components never call `supabase` directly:

| Module | Responsibility |
|---|---|
| `src/lib/supabase.js` | Creates the shared client |
| `src/pages/Papers/fetchPastPapers.js` | Public: fetch published papers |
| `src/pages/Notes/fetchNotes.js` | Public: fetch published notes |
| `src/pages/Admin/adminPapers.js` | Admin: papers CRUD + storage |
| `src/pages/Admin/adminNotes.js` | Admin: notes CRUD + storage, daily motivation fetch |
| `src/pages/Admin/adminMotivation.js` | Motivation CRUD + daily pick |

---

## Admin usage

1. Go to `/admin/login` and sign in with an account listed in `public.admin_users`.
2. From the admin dashboard, open a management area:
   - **Upload / Manage Papers** — assign subject, year, title; attach paper and memo PDFs.
   - **Upload / Manage Notes** — assign subject, title, description; attach a PDF. New notes
     are **published by default**; uncheck "Publish this note now" to save a draft, and
     publish/unpublish any note later from Manage Notes.
   - **Manage Motivation** — add, edit, activate/deactivate, or delete phrases.

---

## Known caveats

- The Supabase client throws if `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` are
  missing — set them before running.
- Reset-password, notes/scope subject navigation, and the "Search" / "Stay Motivated"
  buttons are UI-only placeholders.
- The production bundle is a single chunk (>500 kB); consider code-splitting if it grows.
