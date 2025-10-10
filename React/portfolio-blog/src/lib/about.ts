import supabase from '@/config/supabaseClient'

export type About = {
  id: string
  content: string | null
  display_name: string | null
  email: string | null
  phone: string | null
  github: string | null
  updated_at: string | null
}

const SINGLETON_ID = 'site'

export async function getAbout(): Promise<About | null> {
  const { data, error } = await supabase
    .from('about')
    .select('id, content, display_name, email, phone, github, updated_at')
    .eq('id', SINGLETON_ID)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return (data as About) || null
}

export async function upsertAbout(input: {
  content?: string
  display_name?: string | null
  email?: string | null
  phone?: string | null
  github?: string | null
}): Promise<About> {
  const { data: auth } = await supabase.auth.getUser()
  const user_id = auth.user?.id
  if (!user_id) throw new Error('You must be signed in to update About.')

  const payload = {
    id: SINGLETON_ID,
    content: input.content ?? null,
    display_name: (input.display_name ?? null) || null,
    email: (input.email ?? null) || null,
    phone: (input.phone ?? null) || null,
    github: (input.github ?? null) || null,
    updated_by: user_id,
  }

  const { data, error } = await supabase
    .from('about')
    .upsert(payload, { onConflict: 'id' })
    .select('id, content, display_name, email, phone, github, updated_at')
    .single()
  if (error) throw new Error(error.message)
  return data as About
}
