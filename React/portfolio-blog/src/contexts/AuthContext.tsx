 import { createContext, useContext, useEffect, useMemo, useState } from 'react'
 import type { AuthChangeEvent, Session } from '@supabase/supabase-js'
 import supabase from '@/config/supabaseClient'

export type AuthUser = {
  id: string
  email: string | null
  name: string | null
}

type AuthContextType = {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ error?: string }>
  signup: (email: string, password: string, name: string) => Promise<{ error?: string }>
  logout: () => Promise<void>
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const adminEmail = (import.meta.env.VITE_ADMIN_EMAIL as string | undefined) ?? undefined

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession()
      const sUser = data.session?.user
      if (sUser) {
        // Try to load profile name from users table
        const { data: profile } = await supabase
          .from('users')
          .select('name')
          .eq('id', sUser.id)
          .single<{ name: string | null }>()
        const fallbackName = (sUser.email ?? '').split('@')[0] || null
        setUser({ id: sUser.id, email: sUser.email ?? null, name: profile?.name ?? fallbackName })
      } else {
        setUser(null)
      }
      setLoading(false)
    }
    init()

    const { data: sub } = supabase.auth.onAuthStateChange((
      _event: AuthChangeEvent,
      session: Session | null,
    ) => {
      const sUser = session?.user
      if (sUser) {
        // Fire and forget profile load; don't block navigation
        ;(async () => {
          const { data: profile } = await supabase
            .from('users')
            .select('name')
            .eq('id', sUser.id)
            .single<{ name: string | null }>()
          const fallbackName = (sUser.email ?? '').split('@')[0] || null
          setUser({ id: sUser.id, email: sUser.email ?? null, name: profile?.name ?? fallbackName })
        })()
      } else {
        setUser(null)
      }
    })

    return () => {
      sub.subscription.unsubscribe()
    }
  }, [])

  const isAdmin = useMemo(() => {
    if (!user?.email || !adminEmail) return false
    return user.email.toLowerCase() === adminEmail.toLowerCase()
  }, [user?.email, adminEmail])

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    // Ensure user exists in users table and set role
    const role = adminEmail && email.toLowerCase() === adminEmail.toLowerCase() ? 'admin' : 'guest'
    const uid = data.user?.id
    if (uid) {
      // Do not overwrite existing name on login; only ensure row exists and role/email are set
      await supabase.from('users').upsert({ id: uid, email, role }).select('id').single()
      // Ensure a matching profile row exists for FK targets (avoid clobbering name on login)
      await supabase.from('profiles').upsert({ id: uid, email }).select('id').single()
    }
    return {}
  }

  const signup = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return { error: error.message }
    // On sign up, record user with role
    const role = adminEmail && email.toLowerCase() === adminEmail.toLowerCase() ? 'admin' : 'guest'
    const uid = data.user?.id
    if (uid) {
      await supabase.from('users').upsert({ id: uid, email, name, role }).select('id').single()
      // Create matching profile row for FK references
      await supabase.from('profiles').upsert({ id: uid, email, name }).select('id').single()
    }
    return {}
  }

  const logout = async () => {
    await supabase.auth.signOut()
  }

  const value: AuthContextType = { user, loading, login, signup, logout, isAdmin }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
