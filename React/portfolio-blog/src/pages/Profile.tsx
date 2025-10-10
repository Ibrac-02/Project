import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import supabase from '@/config/supabaseClient'
import { uploadResizedImage } from '@/lib/images'

export default function Profile() {
  const { user, loading } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [visible, setVisible] = useState(true)
  const [about, setAbout] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!user) return
    setEmail(user.email ?? '')
    setName(user.name ?? '')
    setAbout(user.aboutMe ?? '')
    setAvatarUrl(user.avatarUrl ?? null)
  }, [user])

  if (!loading && !user) return <Navigate to="/login" replace />
  if (!visible) return null

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setError(null)
    setSuccess(null)
    setSaving(true)
    try {
      const newName = name.trim() || null
      // Update app users table
      const { error: uErr } = await supabase
        .from('users')
        .update({ name: newName })
        .eq('id', user.id)
      if (uErr) throw new Error(uErr.message)
      const { error: pErr } = await supabase
        .from('profiles')
        .update({ name: newName })
        .eq('id', user.id)
      if (pErr) throw new Error(pErr.message)

      // If password is provided, update Supabase auth password
      if (password.trim().length > 0) {
        const { error: authErr } = await supabase.auth.updateUser({ password: password.trim() })
        if (authErr) throw new Error(authErr.message)
      }

      // Always update auth metadata with avatar_url and about_me
      const { error: metaErr } = await supabase.auth.updateUser({ data: { avatar_url: avatarUrl, about_me: about.trim() || null } })
      if (metaErr) throw new Error(metaErr.message)

      setSuccess(password.trim() ? 'Profile and password updated successfully.' : 'Profile updated successfully.')
      // Hide card within 3 seconds
      setTimeout(() => setVisible(false), 3000)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to update profile'
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  const onUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const { publicUrl } = await uploadResizedImage(file, user.id, 'project-images', { maxWidth: 512, maxHeight: 512, quality: 0.9 })
      setAvatarUrl(publicUrl)
      setSuccess('Avatar uploaded. Click "Save changes" to persist to your profile.')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to upload avatar'
      setError(msg)
    } finally {
      setUploading(false)
    }
  }

  return (
    <section className="sb-card" style={{ maxWidth: 560, margin: '0 auto', display: 'grid', gap: 12 }}>
      <div>
        <h1 style={{ margin: 0 }}>Profile</h1>
        <p style={{ color: 'var(--sb-text-dim)', marginTop: 4 }}>Update your display information, avatar, about me, and password.</p>
      </div>

      {error && <div className="sb-card" style={{ borderColor: '#b91c1c', color: '#fecaca' }}>{error}</div>}
      {success && <div className="sb-card" style={{ borderColor: '#065f46', color: '#d1fae5' }}>{success}</div>}

      <form onSubmit={onSave} className="sb-card" style={{ display: 'grid', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="mini-avatar" style={{ width: 48, height: 48, fontSize: 16 }}>
            {avatarUrl ? <img src={avatarUrl} alt="avatar" /> : (name?.trim() ? name.trim().split(/\s+/).map(p=>p[0]).slice(0,2).join('').toUpperCase() : (email?.[0]?.toUpperCase() || '?'))}
          </div>
          <div>
            <label className="sb-btn" style={{ display: 'inline-block', cursor: 'pointer' }}>
              <input type="file" accept="image/*" onChange={onUploadAvatar} style={{ display: 'none' }} />
              {uploading ? 'Uploading…' : 'Upload avatar'}
            </label>
          </div>
        </div>
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
        <div>
          <label className="sb-label" htmlFor="about">About me</label>
          <textarea id="about" className="sb-input" style={{ minHeight: 80 }} value={about} onChange={e => setAbout(e.target.value)} placeholder="Tell something about yourself" />
        </div>
        <div>
          <label className="sb-label" htmlFor="password">New password</label>
          <div className="sb-password-wrap">
            <input
              id="password"
              className="sb-input sb-password-input"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Leave blank to keep current password"
            />
            <button
              type="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              title={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword(s => !s)}
              className="sb-password-toggle"
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M10.58 10.58A2 2 0 0012 14a2 2 0 001.42-3.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M9.88 5.09A10.94 10.94 0 0112 5c7 0 10 7 10 7a15.77 15.77 0 01-3.54 4.46M6.53 6.53A15.77 15.77 0 002 12s3 7 10 7a10.94 10.94 0 003.09-.38" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="none"/>
                </svg>
              )}
            </button>
          </div>
          <div style={{ color: 'var(--sb-text-dim)', fontSize: 12, marginTop: 4 }}>
            For security, choose a strong password. This will update your Supabase auth password.
          </div>
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
