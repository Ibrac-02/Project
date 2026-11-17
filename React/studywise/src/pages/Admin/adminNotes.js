import { supabase } from '../../lib/supabase'

export const NOTES_BUCKET = 'studywise-notes'

export function makeNoteStoragePath({ subjectId, fileName }) {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
  return `notes/${subjectId}/${crypto.randomUUID()}-${safeName}`
}

export async function uploadNotePdf(file, storagePath) {
  const { error } = await supabase.storage
    .from(NOTES_BUCKET)
    .upload(storagePath, file, {
      contentType: 'application/pdf',
      upsert: false,
    })

  if (error) {
    throw error
  }

  const { data } = supabase.storage.from(NOTES_BUCKET).getPublicUrl(storagePath)
  return data.publicUrl
}

// Admin: fetch every note (published + drafts) ordered newest first.
export async function fetchAllNotes() {
  const { data, error } = await supabase
    .from('notes')
    .select('id, subject_id, title, description, file_url, published, created_at, updated_at')
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    subjectId: row.subject_id,
    title: row.title,
    description: row.description || '',
    fileUrl: row.file_url || null,
    hasFile: Boolean(row.file_url),
    published: Boolean(row.published),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }))
}

export async function createNote({ subjectId, title, description, fileUrl, published }) {
  const { data, error } = await supabase
    .from('notes')
    .insert({
      subject_id: subjectId,
      title,
      description: description || null,
      file_url: fileUrl || null,
      published: Boolean(published),
    })
    .select('id')
    .single()

  if (error) {
    throw error
  }

  return { id: data.id, created: true }
}

export async function updateNoteDetails(id, { title, description, subjectId, published }) {
  const { error } = await supabase
    .from('notes')
    .update({
      title,
      description: description || null,
      subject_id: subjectId,
      published: Boolean(published),
    })
    .eq('id', id)

  if (error) {
    throw error
  }
}

export async function updateNoteFileUrl(id, url) {
  const { error } = await supabase
    .from('notes')
    .update({ file_url: url })
    .eq('id', id)

  if (error) {
    throw error
  }
}

// Extracts the object path inside the notes bucket from a public storage URL.
export function noteStoragePathFromUrl(publicUrl) {
  if (!publicUrl) return null
  try {
    const url = new URL(publicUrl)
    const marker = `/object/public/${NOTES_BUCKET}/`
    const index = url.pathname.indexOf(marker)
    if (index === -1) return null
    return decodeURIComponent(url.pathname.slice(index + marker.length))
  } catch {
    return null
  }
}

export async function deleteNoteFile(publicUrl) {
  const path = noteStoragePathFromUrl(publicUrl)
  if (!path) return
  const { error } = await supabase.storage.from(NOTES_BUCKET).remove([path])
  if (error) {
    throw error
  }
}

export async function deleteNote(id, fileUrl) {
  const path = noteStoragePathFromUrl(fileUrl)
  if (path) {
    const { error: storageError } = await supabase.storage
      .from(NOTES_BUCKET)
      .remove([path])

    if (storageError) {
      throw storageError
    }
  }

  const { error } = await supabase.from('notes').delete().eq('id', id)

  if (error) {
    throw error
  }
}
