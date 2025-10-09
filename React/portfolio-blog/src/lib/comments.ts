import supabase from '@/config/supabaseClient'

export type Comment = {
  id: string
  post_id: string
  user_id: string | null
  user_name: string | null
  guest_name: string | null
  guest_email: string | null
  content: string
  created_at: string
  user_email?: string | null
}

export async function listComments(postId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select('id, post_id, user_id, user_name, guest_name, guest_email, content, created_at, user_email')
    .eq('post_id', postId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as Comment[]
}

export async function createComment(
  postId: string,
  content: string,
  opts?: { guest_name?: string | null; guest_email?: string | null }
): Promise<Comment> {
  const { data: auth } = await supabase.auth.getUser()
  const uid = auth.user?.id ?? null
  const email = auth.user?.email ?? null
  const meta = auth.user?.user_metadata as { name?: string; full_name?: string; display_name?: string } | undefined
  // Prefer persisted profile name or auth metadata; do NOT derive from email
  let derivedName: string | null = meta?.name || meta?.full_name || meta?.display_name || null
  if (uid && !derivedName) {
    const { data: profile } = await supabase
      .from('users')
      .select('name')
      .eq('id', uid)
      .single<{ name: string | null }>()
    derivedName = profile?.name ?? null
  }

  type InsertPayload = {
    post_id: string
    content: string
    user_id: string | null
    user_email: string | null
    user_name?: string | null
    guest_name?: string | null
    guest_email?: string | null
  }

  const payload: InsertPayload = {
    post_id: postId,
    content,
    user_id: uid,
    user_email: email,
    user_name: derivedName ?? null,
  }

  if (!uid) {
    payload.guest_name = opts?.guest_name ?? null
    payload.guest_email = opts?.guest_email ?? null
  }

  const { data, error } = await supabase
    .from('comments')
    .insert(payload)
    .select('id, post_id, user_id, user_name, guest_name, guest_email, content, created_at, user_email')
    .single()
  if (error) throw new Error(error.message)
  return data as Comment
}

export async function deleteComment(id: string): Promise<void> {
  const { error } = await supabase.from('comments').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
