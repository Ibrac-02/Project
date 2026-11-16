import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export function useAdminAuth() {
  const [state, setState] = useState({
    session: null,
    isAdmin: false,
    loading: true,
  })

  useEffect(() => {
    let cancelled = false

    async function checkAdmin(session) {
      if (!session) {
        if (!cancelled) {
          setState({ session: null, isAdmin: false, loading: false })
        }
        return
      }

      try {
        const { data, error } = await supabase.rpc('is_admin')
        if (cancelled) return
        setState({
          session,
          isAdmin: !error && data === true,
          loading: false,
        })
      } catch {
        if (!cancelled) {
          setState({ session, isAdmin: false, loading: false })
        }
      }
    }

    supabase.auth.getSession().then(({ data }) => {
      checkAdmin(data.session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      checkAdmin(session)
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  return state
}

export async function adminSignOut() {
  await supabase.auth.signOut()
}
