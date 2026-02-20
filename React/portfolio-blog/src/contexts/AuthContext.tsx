 import { createContext, useContext, useEffect, useMemo, useState } from 'react'
 import type { AuthChangeEvent, Session } from '@supabase/supabase-js'
 import supabase from '@/config/supabaseClient'

export type AuthUser = {
  id: string
  email: string | null
  name: string | null
  avatarUrl?: string | null
  aboutMe?: string | null
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
        const meta = (sUser.user_metadata ?? {}) as { avatar_url?: string | null; about_me?: string | null }
        setUser({
          id: sUser.id,
          email: sUser.email ?? null,
          name: profile?.name ?? fallbackName,
          avatarUrl: meta.avatar_url ?? null,
          aboutMe: meta.about_me ?? null,
        })
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
          const meta = (sUser.user_metadata ?? {}) as { avatar_url?: string | null; about_me?: string | null }
          setUser({
            id: sUser.id,
            email: sUser.email ?? null,
            name: profile?.name ?? fallbackName,
            avatarUrl: meta.avatar_url ?? null,
            aboutMe: meta.about_me ?? null,
          })
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
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        // Return user-friendly error messages
        if (error.message.includes('Invalid login credentials')) {
          return { error: 'Incorrect email or password. Please check your credentials and try again.' }
        } else if (error.message.includes('Email not confirmed')) {
          return { error: 'Please check your email and confirm your account before logging in.' }
        } else if (error.message.includes('rate limit')) {
          return { error: 'Too many login attempts. Please wait a moment before trying again.' }
        } else if (error.message.includes('network') || error.message.includes('connection')) {
          return { error: 'Connection issue. Please check your internet and try again.' }
        } else {
          return { error: error.message }
        }
      }
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
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Login failed'
      if (msg.includes('network') || msg.includes('connection')) {
        return { error: 'Connection issue. Please check your internet and try again.' }
      }
      return { error: 'Login failed. Please try again.' }
    }
  }

  const signup = async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) {
        // Return user-friendly error messages
        if (error.message.includes('User already registered')) {
          return { error: 'An account with this email already exists. Try logging in instead.' }
        } else if (error.message.includes('password') && error.message.includes('weak')) {
          return { error: 'Password is too weak. Please choose a stronger password with at least 8 characters.' }
        } else if (error.message.includes('email') && error.message.includes('invalid')) {
          return { error: 'Please enter a valid email address.' }
        } else if (error.message.includes('rate limit')) {
          return { error: 'Too many signup attempts. Please wait a moment before trying again.' }
        } else if (error.message.includes('network') || error.message.includes('connection')) {
          return { error: 'Connection issue. Please check your internet and try again.' }
        } else {
          return { error: error.message }
        }
      }
      // On sign up, record user with role
      const role = adminEmail && email.toLowerCase() === adminEmail.toLowerCase() ? 'admin' : 'guest'
      const uid = data.user?.id
      if (uid) {
        await supabase.from('users').upsert({ id: uid, email, name, role }).select('id').single()
        // Create matching profile row for FK references
        await supabase.from('profiles').upsert({ id: uid, email, name }).select('id').single()
      }
      return {}
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Signup failed'
      if (msg.includes('network') || msg.includes('connection')) {
        return { error: 'Connection issue. Please check your internet and try again.' }
      }
      return { error: 'Signup failed. Please try again.' }
    }
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
