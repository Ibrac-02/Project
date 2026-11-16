import { supabase } from '../../lib/supabase'

export const PAPERS_BUCKET = 'past-papers'

export async function fetchAllPapers() {
  const { data, error } = await supabase
    .from('past_papers')
    .select('id, subject_id, year, title, term, paper_number, paper_url, memo_url, is_published, created_at, updated_at')
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    subjectId: row.subject_id,
    year: Number(row.year),
    title: row.title,
    term: row.term || '',
    paperNumber: row.paper_number || '',
    paperUrl: row.paper_url || null,
    memoUrl: row.memo_url || null,
    isPublished: Boolean(row.is_published),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }))
}

export function buildPaperTitle({ subjectName, year, term, paperNumber }) {
  return [subjectName, year, term, paperNumber].filter(Boolean).join(' ')
}

export function makeStoragePath({ subjectId, year, docType, fileName }) {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
  return `papers/${subjectId}/${year}/${docType}-${crypto.randomUUID()}-${safeName}`
}

export async function uploadPdfToStorage(file, storagePath) {
  const { error } = await supabase.storage
    .from(PAPERS_BUCKET)
    .upload(storagePath, file, {
      contentType: 'application/pdf',
      upsert: false,
    })

  if (error) {
    throw error
  }

  const { data } = supabase.storage.from(PAPERS_BUCKET).getPublicUrl(storagePath)
  return data.publicUrl
}

export async function findPaperRecord({ subjectId, year, term, paperNumber }) {
  let query = supabase
    .from('past_papers')
    .select('id, paper_url, memo_url, is_published')
    .eq('subject_id', subjectId)
    .eq('year', year)

  query = term ? query.eq('term', term) : query.is('term', null)
  query = paperNumber ? query.eq('paper_number', paperNumber) : query.is('paper_number', null)

  const { data, error } = await query.limit(1).maybeSingle()

  if (error) {
    throw error
  }

  return data
}

// Saves a question paper or memo URL into the existing past_papers row.
// Never overwrites the other document type's URL.
export async function savePaperDocument({
  subjectId,
  year,
  term,
  paperNumber,
  title,
  docType, // 'paper' | 'memo'
  url,
  isPublished,
}) {
  const urlField = docType === 'paper' ? 'paper_url' : 'memo_url'
  const existing = await findPaperRecord({ subjectId, year, term, paperNumber })

  if (existing) {
    const { error } = await supabase
      .from('past_papers')
      .update({
        [urlField]: url,
        title,
        term: term || null,
        paper_number: paperNumber || null,
      })
      .eq('id', existing.id)

    if (error) {
      throw error
    }

    return { id: existing.id, created: false }
  }

  const { data, error } = await supabase
    .from('past_papers')
    .insert({
      subject_id: subjectId,
      year,
      title,
      term: term || null,
      paper_number: paperNumber || null,
      [urlField]: url,
      is_published: isPublished,
    })
    .select('id')
    .single()

  if (error) {
    throw error
  }

  return { id: data.id, created: true }
}

export async function setPaperPublished(id, isPublished) {
  const { error } = await supabase
    .from('past_papers')
    .update({ is_published: isPublished })
    .eq('id', id)

  if (error) {
    throw error
  }
}

export async function updatePaperDetails(id, { title, term, paperNumber }) {
  const { error } = await supabase
    .from('past_papers')
    .update({
      title,
      term: term || null,
      paper_number: paperNumber || null,
    })
    .eq('id', id)

  if (error) {
    throw error
  }
}

// Extracts the object path inside the bucket from a public storage URL.
export function storagePathFromUrl(publicUrl) {
  if (!publicUrl) return null
  try {
    const url = new URL(publicUrl)
    const marker = `/object/public/${PAPERS_BUCKET}/`
    const index = url.pathname.indexOf(marker)
    if (index === -1) return null
    return decodeURIComponent(url.pathname.slice(index + marker.length))
  } catch {
    return null
  }
}

export async function deletePaper(id, paperUrl, memoUrl) {
  const paths = [paperUrl, memoUrl]
    .map(storagePathFromUrl)
    .filter(Boolean)

  if (paths.length > 0) {
    const { error: storageError } = await supabase.storage
      .from(PAPERS_BUCKET)
      .remove(paths)

    if (storageError) {
      throw storageError
    }
  }

  const { error } = await supabase.from('past_papers').delete().eq('id', id)

  if (error) {
    throw error
  }
}
