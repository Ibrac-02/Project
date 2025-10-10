import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Navigate } from 'react-router-dom'
import supabase from '@/config/supabaseClient'

export default function About() {
  const { user, loading, isAdmin } = useAuth()
  const [about, setAbout] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    setAbout(user.aboutMe ?? '')
  }, [user])

  if (!loading && !user) return <Navigate to="/login" replace />

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !isAdmin) return
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const { error: metaErr } = await supabase.auth.updateUser({ data: { about_me: about.trim() || null } })
      if (metaErr) throw new Error(metaErr.message)
      setSuccess('About me updated successfully.')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to update about me'
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="sb-card" style={{ maxWidth: 720, margin: '0 auto', display: 'grid', gap: 12 }}>
      <div>
        <h1 style={{ margin: 0 }}>About Me</h1>
        <p className="muted" style={{ marginTop: 4 }}>Personal details and biography.</p>
      </div>

      {error && <div className="sb-card" style={{ borderColor: '#b91c1c', color: '#fecaca' }}>{error}</div>}
      {success && <div className="sb-card" style={{ borderColor: '#065f46', color: '#d1fae5' }}>{success}</div>}

      <div className="surface" style={{ display: 'grid', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="mini-avatar" style={{ width: 56, height: 56, fontSize: 18 }}>
            {user?.avatarUrl ? <img src={user.avatarUrl} alt="avatar" /> : (user?.name?.trim() ? user.name.trim().split(/\s+/).map(p=>p[0]).slice(0,2).join('').toUpperCase() : (user?.email?.[0]?.toUpperCase() || '?'))}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>{user?.name ?? user?.email ?? 'User'}</div>
            <div className="muted" style={{ fontSize: 12 }}>{user?.email}</div>
          </div>
        </div>

        <div>
          <div className="muted" style={{ marginBottom: 6 }}>Biography</div>
          <div className="sb-card" style={{ whiteSpace: 'pre-wrap' }}>{about || 'No bio yet.'}</div>
        </div>

        {isAdmin && (
          <form onSubmit={onSave} className="sb-card" style={{ display: 'grid', gap: 10 }}>
            <div>
              <label className="sb-label" htmlFor="about-edit">Edit About Me</label>
              <textarea id="about-edit" className="sb-input" style={{ minHeight: 140 }} value={about} onChange={e => setAbout(e.target.value)} placeholder="Write your personal details and biography here..." />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button disabled={saving} className="sb-btn sb-btn-primary" type="submit">
                {saving ? 'Saving…' : 'Save About'}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}
