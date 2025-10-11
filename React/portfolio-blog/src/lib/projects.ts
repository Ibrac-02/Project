import supabase from '@/config/supabaseClient'

export type Project = {
  id: string
  title: string
  description: string | null
  stack: string | null
  image_url: string | null
  demo_url: string | null
  github_url: string | null
  created_at: string
}

export async function listProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('id, title, description, stack, image_url, demo_url, github_url, created_at')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as Project[]
}

export async function createProject(input: {
  title: string
  description?: string
  stack?: string
  image_url?: string
  demo_url?: string
  github_url?: string
}): Promise<Project> {
  const { data: auth } = await supabase.auth.getUser()
  const user_id = auth.user?.id ?? null
  if (!user_id) {
    throw new Error('You must be signed in to create a project.')
  }
  // Ensure profile row exists to satisfy FK (projects.user_id -> profiles.id)
  await supabase.from('profiles').upsert({ id: user_id, email: auth.user?.email ?? null }).select('id').single()
  const { data, error } = await supabase
    .from('projects')
    .insert({
      user_id,
      title: input.title,
      description: input.description ?? null,
      stack: input.stack ?? null,
      image_url: input.image_url ?? null,
      demo_url: input.demo_url ?? null,
      github_url: input.github_url ?? null,
    })
    .select('id, title, description, stack, image_url, demo_url, github_url, created_at')
    .single()
  if (error) throw new Error(error.message)
  return data as Project
}

export async function deleteProject(id: string): Promise<void> {
  const { data, error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)
    .select('id')
    .maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) throw new Error('Delete failed: project not found or not permitted by policy')
}

export async function updateProject(id: string, input: {
  title?: string
  description?: string | null
  stack?: string | null
  image_url?: string | null
  demo_url?: string | null
  github_url?: string | null
}): Promise<Project> {
  const payload: Record<string, unknown> = {}
  if (typeof input.title !== 'undefined') payload.title = input.title
  if (typeof input.description !== 'undefined') payload.description = input.description
  if (typeof input.stack !== 'undefined') payload.stack = input.stack
  if (typeof input.image_url !== 'undefined') payload.image_url = input.image_url
  if (typeof input.demo_url !== 'undefined') payload.demo_url = input.demo_url
  if (typeof input.github_url !== 'undefined') payload.github_url = input.github_url

  const { data, error } = await supabase
    .from('projects')
    .update(payload)
    .eq('id', id)
    .select('id, title, description, stack, image_url, demo_url, github_url, created_at')
    .single()
  if (error) throw new Error(error.message)
  return data as Project
}
