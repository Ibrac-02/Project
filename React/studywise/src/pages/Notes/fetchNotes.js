import { supabase } from '../../lib/supabase'

// Students only see published notes.
export async function fetchPublishedNotes() {
  const { data, error } = await supabase
    .from('notes')
    .select('id, subject_id, title, description, file_url, created_at')
    .eq('published', true)
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
    createdAt: row.created_at,
  }))
}
