import supabase from '@/config/supabaseClient'

export type UploadResult = {
  path: string
  publicUrl: string
}

/**
 * Generates a unique, user-namespaced storage path for an image.
 * Example: `${userId}/2025/10/09/1696850000000_abcd1234.png`
 */
export function generateImagePath(userId: string, originalName: string): string {
  const ext = (originalName.split('.').pop() || 'png').toLowerCase()
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const rand = Math.random().toString(36).slice(2)
  return `${userId}/${yyyy}/${mm}/${dd}/${Date.now()}_${rand}.${ext}`
}

/**
 * Basic client-side validation for images. Returns a human-friendly error message or null if valid.
 */
export function validateImage(file: File, opts?: { maxSizeMB?: number; allowedTypes?: string[] }): string | null {
  const maxSizeMB = opts?.maxSizeMB ?? 5
  const allowed = opts?.allowedTypes ?? ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
  if (!allowed.includes(file.type)) return `Unsupported image type: ${file.type}`
  const sizeMB = file.size / (1024 * 1024)
  if (sizeMB > maxSizeMB) return `Image is too large (${sizeMB.toFixed(1)} MB). Max allowed is ${maxSizeMB} MB.`
  return null
}

/**
 * Uploads an image file to Supabase Storage and returns the public URL.
 * Bucket must exist and be public or have a signed URL policy.
 */
export async function uploadImage(
  file: File,
  userId: string,
  bucket: string = 'project-images',
  options?: { cacheControl?: string; upsert?: boolean }
): Promise<UploadResult> {
  if (!userId) throw new Error('Missing user id for image upload')
  const err = validateImage(file)
  if (err) throw new Error(err)

  const path = generateImagePath(userId, file.name)
  const { error: upErr } = await supabase.storage
    .from(bucket)
    .upload(path, file, { cacheControl: options?.cacheControl ?? '3600', upsert: options?.upsert ?? true })
  if (upErr) throw new Error(upErr.message)

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return { path, publicUrl: data.publicUrl }
}

/**
 * Gets a public URL for a given storage path (works only for public buckets).
 */
export function getPublicUrl(path: string, bucket: string = 'project-images'): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

/**
 * Generates a signed URL if the bucket is private.
 */
export async function getSignedUrl(path: string, bucket: string = 'project-images', expiresInSeconds = 3600): Promise<string> {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresInSeconds)
  if (error) throw new Error(error.message)
  return data.signedUrl
}

/**
 * Deletes an image by storage path. Only works if RLS policies allow the user to delete.
 */
export async function deleteImage(path: string, bucket: string = 'project-images'): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([path])
  if (error) throw new Error(error.message)
}
