# Project Documentation

## Overview
This is a personal portfolio and blog built with React + Vite. It features public portfolio projects, basic blog scaffolding, authentication (login/signup), a profile page with password change, and image management with client-side resizing and optional cropping before upload to Supabase Storage.

## Tech Stack
- React + TypeScript + Vite
- React Router
- Supabase (Auth, Postgres, Storage)
- CSS (utility classes in `src/index.css` and component styles like `sb-card`, `sb-input`, etc.)
- Optional image crop UI via `react-easy-crop`

## Project Structure
- App entry: `src/main.tsx`, `src/App.tsx`
- Auth context: `src/contexts/AuthContext.tsx`
- Supabase client: `src/config/supabaseClient.ts`
- Pages:
  - `src/pages/Home.tsx`
  - `src/pages/Projects.tsx`
  - `src/pages/Blog.tsx`, `src/pages/Post.tsx`, `src/pages/Contact.tsx`
  - `src/pages/Login.tsx` (Login/Signup)
  - `src/pages/Profile.tsx` (profile + password update)
- Data access libs:
  - `src/lib/projects.ts` (CRUD for portfolio projects)
  - `src/lib/posts.ts`, `src/lib/comments.ts`, `src/lib/site.ts` (blog/site helpers)
  - `src/lib/images.ts` (image upload, resize, crop, delete)
- Components:
  - `src/components/Layout.tsx`
  - `src/components/ImageCropper.tsx` (crop/rotate UI with `react-easy-crop`)
- Styles:
  - `src/index.css`
  - `src/components/supabaseTheme.css` (auth UI theme tokens)

## Features

- **Authentication**
  - Implemented in `src/pages/Login.tsx` via `useAuth()`.
  - Login/Signup modes share one form.
  - Password visibility toggle uses emoji (👁️ / 🙈) to show/hide input.

- **Profile Management**
  - `src/pages/Profile.tsx` allows updating display name and (optionally) Supabase auth password.
  - After a successful update, the profile card auto-hides within 3 seconds.
  - Email is read-only in this UI (change via Supabase account settings separately).

- **Projects (Portfolio)**
  - Admin users can create projects in `src/pages/Projects.tsx`.
  - Supports image upload with client-side resize before upload.
  - Optional crop/rotate modal opens on file selection; the cropped result is uploaded.
  - Project cards display images with fixed height (object-fit: cover) for a clean layout.

- **Image Management**
  - `src/lib/images.ts`:
    - `validateImage(file)` basic type/size checks
    - `resizeImage(file, {maxWidth, maxHeight, quality})` client-side canvas resize
    - `uploadResizedImage(file, userId, bucket)` uploads resized file to Supabase Storage
    - `cropImage(fileOrBlob, croppedAreaPixels, {rotate})` canvas crop/rotate
    - `uploadBlob(blob, userId, originalName, bucket)` generic blob upload
    - `getPublicUrl(path)`, `getSignedUrl(path)`, `deleteImage(path)`
  - Crop UI: `src/components/ImageCropper.tsx` (react-easy-crop) with zoom and rotation controls.

- **Data Layer**
  - Projects: `src/lib/projects.ts` handles list/create/delete against the `projects` table.
  - On create, a `profiles` upsert ensures FK integrity (`projects.user_id -> profiles.id`).
  - Blog scaffolding lives in `src/lib/posts.ts`, `src/lib/comments.ts`, and `src/pages/Post.tsx`.

## Supabase Storage Setup
- Bucket name used by default: `project-images`.
- Make sure the bucket exists and is public (or use signed URLs if private).
- See `src/lib/images.ts` for bucket usage; defaults can be changed via function params.
- If recreating buckets/policies, follow SQL similar to:

```sql
-- Create public bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'project-images', 'project-images', true, 5 * 1024 * 1024,
  array['image/png','image/jpeg','image/webp','image/gif']
)
on conflict (id) do update set public = excluded.public;

-- Policies: public read, authenticated write/delete
create policy "Public read for project-images" on storage.objects
for select using (bucket_id = 'project-images');

create policy "Authenticated insert for project-images" on storage.objects
for insert to authenticated with check (bucket_id = 'project-images');

create policy "Authenticated update for project-images" on storage.objects
for update to authenticated using (bucket_id = 'project-images') with check (bucket_id = 'project-images');

create policy "Authenticated delete for project-images" on storage.objects
for delete to authenticated using (bucket_id = 'project-images');
```

## Environment Variables
- Configure Supabase in `src/config/supabaseClient.ts` via:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- `.env` example:
```
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
```

## Development
- Install deps: `npm install`
- Run dev: `npm run dev`
- Build: `npm run build`
- Preview: `npm run preview`

## Design and UX
- Reusable classes like `sb-card`, `sb-input`, `sb-btn` provide consistent look.
- Password visibility toggles across Login/Signup (and optionally Profile) use emoji for quick UX.
- Project cards enforce visual uniformity with constrained image height.

## Security Considerations
- Auth password updates use `supabase.auth.updateUser({ password })`.
- Storage policies should limit write/delete to authenticated users and allow public reads (or use signed URLs for private buckets).
- Client-side validation checks MIME type/size; also enforce limits at bucket level.

## Extensibility
- Add more fields to projects (tags, roles, contributions).
- Full CRUD for blog posts and comments.
- Avatar upload on `Profile.tsx` reusing cropper + `uploadResizedImage()`.
- Internationalization and improved accessibility.

## Key Files
- `src/pages/Projects.tsx` – upload, crop, display of project images.
- `src/lib/images.ts` – centralized image manipulation and storage.
- `src/pages/Login.tsx` – combined login/signup with emoji toggles.
- `src/pages/Profile.tsx` – profile edit, password update, 3s auto-dismiss.
- `src/lib/projects.ts` – project CRUD and FK-safe create.
