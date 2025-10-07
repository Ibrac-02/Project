import supabase from '@/config/supabaseClient'

export type SiteOwner = {
  id: string
  name: string | null
  email: string
}

// Get the site owner (admin). Priority: role='admin'.
export async function getSiteOwner(): Promise<SiteOwner | null> {
  // Try by role first
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, role, created_at')
    .eq('role', 'admin')
    .order('created_at', { ascending: true })
    .limit(1)

  if (error) throw new Error(error.message)
  const row = data?.[0]
  if (!row) return null
  return {
    id: row.id as string,
    name: (row as unknown as SiteOwner).name ?? null,
    email: (row as unknown as SiteOwner).email as string,
  }
}
