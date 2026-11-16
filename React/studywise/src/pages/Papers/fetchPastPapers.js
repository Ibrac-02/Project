import { supabase } from '../../lib/supabase'

export async function fetchPastPapers() {
  const { data, error } = await supabase
    .from('past_papers')
    .select('id, subject_id, year, title, paper_url, memo_url')
    .order('year', { ascending: false })

  if (error) {
    throw error
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    subjectId: row.subject_id,
    year: Number(row.year),
    title: row.title,
    paperUrl: row.paper_url || null,
    memoUrl: row.memo_url || null,
    hasPaper: Boolean(row.paper_url),
    hasMemo: Boolean(row.memo_url),
  }))
}
