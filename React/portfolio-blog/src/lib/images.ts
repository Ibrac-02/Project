import supabase from '@/config/supabaseClient'

export type UploadResult = {
  path: string
  publicUrl: string
}

/**
 * Crops an image file/blob using provided pixel region and optional rotation (degrees).
 * croppedArea: { x, y, width, height } in pixels relative to the image's natural size.
 */
export async function cropImage(
  fileOrBlob: File | Blob,
  croppedArea: { x: number; y: number; width: number; height: number },
  opts?: { rotate?: number; outputType?: 'image/jpeg' | 'image/webp' | 'image/png'; quality?: number }
): Promise<Blob> {
  const outputType = opts?.outputType ?? 'image/jpeg'
  const quality = opts?.quality ?? 0.9
  const rotate = (opts?.rotate ?? 0) * Math.PI / 180

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image()
    i.onload = () => resolve(i)
    i.onerror = (e) => reject(e)
    i.src = URL.createObjectURL(fileOrBlob)
  })

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not get 2D context for canvas')

  const { x, y, width, height } = croppedArea

  // For rotation, draw the full image onto an offscreen canvas first
  const off = document.createElement('canvas')
  const offCtx = off.getContext('2d')
  if (!offCtx) throw new Error('Could not get 2D context for offscreen canvas')

  // Expand offscreen canvas to fit rotated image bounds
  const diag = Math.sqrt(img.width * img.width + img.height * img.height)
  off.width = Math.ceil(diag)
  off.height = Math.ceil(diag)
  offCtx.translate(off.width / 2, off.height / 2)
  offCtx.rotate(rotate)
  offCtx.drawImage(img, -img.width / 2, -img.height / 2)

  // Now crop from rotated offscreen canvas
  canvas.width = Math.max(1, Math.floor(width))
  canvas.height = Math.max(1, Math.floor(height))
  // Compute the top-left of the crop in the rotated space
  // We need to map original crop (x,y) to rotated canvas coordinates.
  // Approximate by recentering the original image rect to offscreen center, then offset by crop.
  const centerX = (off.width - img.width) / 2
  const centerY = (off.height - img.height) / 2
  const sx = Math.max(0, Math.floor(centerX + x))
  const sy = Math.max(0, Math.floor(centerY + y))
  const sWidth = Math.min(off.width - sx, Math.floor(width))
  const sHeight = Math.min(off.height - sy, Math.floor(height))

  ctx.drawImage(off, sx, sy, sWidth, sHeight, 0, 0, sWidth, sHeight)

  const blob: Blob = await new Promise((resolve) => canvas.toBlob((b) => resolve(b as Blob), outputType, quality))
  URL.revokeObjectURL(img.src)
  return blob
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
 * Resizes an image on the client using Canvas. Preserves aspect ratio.
 */
export async function resizeImage(
  file: File,
  opts: { maxWidth?: number; maxHeight?: number; quality?: number; outputType?: 'image/jpeg' | 'image/webp' | 'image/png' }
): Promise<Blob> {
  const maxWidth = opts.maxWidth ?? 1600
  const maxHeight = opts.maxHeight ?? 1200
  const quality = opts.quality ?? 0.85
  const outputType = opts.outputType ?? 'image/jpeg'

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image()
    i.onload = () => resolve(i)
    i.onerror = (e) => reject(e)
    i.src = URL.createObjectURL(file)
  })

  let { width, height } = img
  const ratio = Math.min(maxWidth / width, maxHeight / height, 1)
  width = Math.round(width * ratio)
  height = Math.round(height * ratio)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not get 2D context for canvas')
  ctx.drawImage(img, 0, 0, width, height)

  const blob: Blob = await new Promise((resolve) => canvas.toBlob((b) => resolve(b as Blob), outputType, quality))
  URL.revokeObjectURL(img.src)
  return blob
}

/**
 * Convenience: resize then upload. Uses same naming as original file, but content from resized blob.
 */
export async function uploadResizedImage(
  file: File,
  userId: string,
  bucket: string = 'project-images',
  opts?: { maxWidth?: number; maxHeight?: number; quality?: number; outputType?: 'image/jpeg' | 'image/webp' | 'image/png'; cacheControl?: string; upsert?: boolean }
): Promise<UploadResult> {
  const validationError = validateImage(file)
  if (validationError) throw new Error(validationError)
  const resizedBlob = await resizeImage(file, {
    maxWidth: opts?.maxWidth ?? 1600,
    maxHeight: opts?.maxHeight ?? 1200,
    quality: opts?.quality ?? 0.85,
    outputType: opts?.outputType ?? 'image/jpeg',
  })

  // Create a File-like object to preserve name/extension for path generation
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
  const name = file.name.replace(/\.[^.]+$/, `.${ext}`)
  const path = generateImagePath(userId, name)

  const { error: upErr } = await supabase.storage
    .from(bucket)
    .upload(path, resizedBlob, { cacheControl: opts?.cacheControl ?? '3600', upsert: opts?.upsert ?? true, contentType: resizedBlob.type })
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

/**
 * Uploads a Blob to storage using a generated path based on the original file name.
 */
export async function uploadBlob(
  blob: Blob,
  userId: string,
  originalName: string,
  bucket: string = 'project-images',
  options?: { cacheControl?: string; upsert?: boolean }
): Promise<UploadResult> {
  if (!userId) throw new Error('Missing user id for image upload')
  const path = generateImagePath(userId, originalName)
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, blob, { cacheControl: options?.cacheControl ?? '3600', upsert: options?.upsert ?? true, contentType: blob.type })
  if (error) throw new Error(error.message)
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return { path, publicUrl: data.publicUrl }
}
