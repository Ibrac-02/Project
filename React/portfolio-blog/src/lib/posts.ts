import supabase from '@/config/supabaseClient'

export type Post = {
  id: string
  title: string
  content: string
  author_id: string | null
  created_at: string
  author_email?: string | null
  author_profile?: { id: string; name: string | null; email: string | null } | null
}

export async function listPosts(): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('id, title, content, author_id, author_email, created_at, author_profile:profiles!posts_author_id_fkey(id, name, email)')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  type ProfileRow = { id: string; name: string | null; email: string | null }
  type Row = Omit<Post, 'author_profile'> & { author_profile?: ProfileRow | ProfileRow[] | null }
  const rows = (data ?? []) as Row[]
  return rows.map((r) => ({
    ...r,
    author_profile: Array.isArray(r.author_profile) ? r.author_profile[0] : (r.author_profile ?? null),
  })) as Post[]
}

export async function createPost(title: string, content: string): Promise<Post> {
  const { data: auth } = await supabase.auth.getUser()
  const uid = auth.user?.id ?? null
  const email = auth.user?.email ?? null
  const { data, error } = await supabase
    .from('posts')
    .insert({
      title,
      content,
      author_id: uid,
      author_email: email,
    })
    .select('id, title, content, author_id, author_email, created_at, author_profile:profiles!posts_author_id_fkey(id, name, email)')
    .single()
  if (error) throw new Error(error.message)
  type ProfileRow = { id: string; name: string | null; email: string | null }
  type Row = Omit<Post, 'author_profile'> & { author_profile?: ProfileRow | ProfileRow[] | null }
  const row = data as Row
  return {
    ...row,
    author_profile: Array.isArray(row.author_profile) ? row.author_profile[0] : (row.author_profile ?? null),
  } as Post
}

export async function deletePost(id: string): Promise<void> {
  const { error } = await supabase.from('posts').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
