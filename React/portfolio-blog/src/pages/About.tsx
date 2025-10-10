import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import supabase from '@/config/supabaseClient'

export default function About() {
  const { user, isAdmin } = useAuth()
  const adminEmail = (import.meta.env.VITE_ADMIN_EMAIL as string | undefined) ?? undefined
  const bucket = (import.meta.env.VITE_SITE_BUCKET as string | undefined) || 'site-content'
  const objectKey = 'about.json'
  const [about, setAbout] = useState('')
  const [adminName, setAdminName] = useState<string>('Admin')
  const [adminEmailState, setAdminEmailState] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)

  const loadAbout = useCallback(async () => {
    try {
      setError(null)
      // Derive a display name: prefer context user name if admin is viewing; otherwise fallback to email local part
      const fallbackName = adminEmail ? (adminEmail.split('@')[0] || 'Admin') : 'Admin'
      setAdminName(user && isAdmin ? (user.name ?? fallbackName) : fallbackName)
      setAdminEmailState(adminEmail || '')
      // Try to download about.json from storage
      const { data, error } = await supabase.storage.from(bucket).download(objectKey)
      if (error) {
        // If file not found, show empty and optionally enable edit mode for admin
        setAbout('')
        setEditMode(!!(isAdmin))
        return
      }
      const text = await data.text()
      try {
        const json = JSON.parse(text) as { about?: string }
        const content = json.about ?? ''
        setAbout(content)
        setEditMode(!!(isAdmin && content.length === 0))
      } catch {
        // Fallback if non-JSON content
        setAbout(text)
        setEditMode(!!(isAdmin && text.length === 0))
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load About content')
    }
  }, [adminEmail, bucket, isAdmin, user])

  useEffect(() => { void loadAbout() }, [loadAbout])

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !isAdmin) return
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const payload = JSON.stringify({ about }, null, 2)
      const blob = new Blob([payload], { type: 'application/json' })
      const { error } = await supabase.storage.from(bucket).upload(objectKey, blob, { upsert: true, contentType: 'application/json' })
      if (error) throw new Error(error.message)
      setSuccess('About me updated.')
      setEditMode(false)
      // Reload to confirm persistence
      await loadAbout()
    } catch (e: unknown) {
      setError(e instanceof Error ? `Failed to save About me: ${e.message}` : 'Failed to save About me')
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
            {(user && isAdmin && user.avatarUrl) ? <img src={user.avatarUrl} alt="avatar" /> : (adminName?.trim() ? adminName.trim().split(/\s+/).map(p=>p[0]).slice(0,2).join('').toUpperCase() : (adminEmailState?.[0]?.toUpperCase() || '?'))}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>{adminName}</div>
            <div className="muted" style={{ fontSize: 12 }}>{adminEmailState}</div>
          </div>
        </div>

        <div>
          <div className="muted" style={{ marginBottom: 6 }}>Biography</div>
          {about ? (
            <div className="sb-card" style={{ whiteSpace: 'pre-wrap' }}>{about}</div>
          ) : (
            <div className="sb-card muted">No bio yet.</div>
          )}
        </div>

        {isAdmin && !editMode && (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="sb-btn sb-btn-primary" onClick={() => setEditMode(true)}>Update</button>
          </div>
        )}

        {isAdmin && editMode && (
          <form onSubmit={onSave} className="sb-card" style={{ display: 'grid', gap: 10 }}>
            <div>
              <label className="sb-label" htmlFor="about-edit">Edit About Me</label>
              <textarea id="about-edit" className="sb-input" style={{ minHeight: 140 }} value={about} onChange={e => setAbout(e.target.value)} placeholder="Write your personal details and biography here..." />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button type="button" className="sb-btn" onClick={() => setEditMode(false)}>Cancel</button>
              <button disabled={saving} className="sb-btn sb-btn-primary" type="submit">
                {saving ? 'Saving…' : (about ? 'Update' : 'Save')}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}
