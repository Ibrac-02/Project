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
