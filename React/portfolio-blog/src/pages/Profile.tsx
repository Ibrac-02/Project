import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import supabase from '@/config/supabaseClient'

export default function Profile() {
  const { user, loading } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    setEmail(user.email ?? '')
    setName(user.name ?? '')
  }, [user])

  if (!loading && !user) return <Navigate to="/login" replace />

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setError(null)
    setSuccess(null)
    setSaving(true)
    try {
      const { error } = await supabase
        .from('users')
        .update({ name: name.trim() || null })
        .eq('id', user.id)
      if (error) throw new Error(error.message)
      setSuccess('Profile updated successfully.')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to update profile'
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="sb-card" style={{ maxWidth: 560, margin: '0 auto', display: 'grid', gap: 12 }}>
      <div>
        <h1 style={{ margin: 0 }}>Profile</h1>
        <p style={{ color: 'var(--sb-text-dim)', marginTop: 4 }}>Update your display information.</p>
      </div>

      {error && <div className="sb-card" style={{ borderColor: '#b91c1c', color: '#fecaca' }}>{error}</div>}
      {success && <div className="sb-card" style={{ borderColor: '#065f46', color: '#d1fae5' }}>{success}</div>}

      <form onSubmit={onSave} className="sb-card" style={{ display: 'grid', gap: 10 }}>
        <div>
          <label className="sb-label" htmlFor="email">Email</label>
          <input id="email" className="sb-input" value={email} readOnly />
          <div style={{ color: 'var(--sb-text-dim)', fontSize: 12, marginTop: 4 }}>
            Email changes must be done via account settings in Supabase; this field is read-only here.
          </div>
        </div>
        <div>
          <label className="sb-label" htmlFor="name">Display name</label>
          <input id="name" className="sb-input" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button disabled={saving} className="sb-btn sb-btn-primary" type="submit">
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </section>
  )
}
