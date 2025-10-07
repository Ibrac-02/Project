import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Navigate } from 'react-router-dom'

export default function Login() {
  const { user, login, signup } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  if (user) return <Navigate to="/" replace />

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    let res: { error?: string } = {}
    if (mode === 'login') {
      res = await login(email.trim(), password)
    } else {
      res = await signup(email.trim(), password, name.trim())
    }
    if (res.error) setError(res.error)
    setLoading(false)
  }

  return (
    <section className="sb-card" style={{ maxWidth: 440, margin: '0 auto' }}>
      <p style={{ color: 'var(--sb-text-dim)' }}>
        {mode === 'login' ? 'Sign in to post on the blog.' : 'Sign up to start posting.'}
      </p>

      {error && <div className="sb-card" style={{ borderColor: '#b91c1c', color: '#fecaca' }}>{error}</div>}
      <form onSubmit={onSubmit} className="sb-card" style={{ display: 'grid', gap: 8 }}>
        {mode === 'signup' && (
          <div>
            <label className="sb-label" htmlFor="name">Name</label>
            <input id="name" className="sb-input" value={name} onChange={e => setName(e.target.value)} placeholder="your username" required />
          </div>
        )}
        <div>
          <label className="sb-label" htmlFor="email">Email</label>
          <input id="email" type="email" className="sb-input" value={email} onChange={e => setEmail(e.target.value)} placeholder="username@example.com" required />
        </div>
        <div>
          <label className="sb-label" htmlFor="password">Password</label>
          <div className="sb-password-wrap">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className="sb-input sb-password-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              title={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword(s => !s)}
              className="sb-password-toggle"
            >
              {showPassword ? (
                // Eye-off SVG
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M10.58 10.58A2 2 0 0012 14a2 2 0 001.42-3.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M9.88 5.09A10.94 10.94 0 0112 5c7 0 10 7 10 7a15.77 15.77 0 01-3.54 4.46M6.53 6.53A15.77 15.77 0 002 12s3 7 10 7a10.94 10.94 0 003.09-.38" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              ) : (
                // Eye SVG
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="none"/>
                </svg>
              )}
            </button>
          </div>
        </div>
        <button disabled={loading} className="sb-btn sb-btn-primary" type="submit">
          {loading ? 'Please wait…' : (mode === 'login' ? 'Login' : 'Sign up')}
        </button>
      </form>

      <div style={{ marginTop: 12, color:'var(--sb-text-dim)' }}>
        {mode === 'login' ? (
          <>Don't have an account? <button className="sb-btn" onClick={() => setMode('signup')}>Sign up</button></>
        ) : (
          <>Already have an account? <button className="sb-btn" onClick={() => setMode('login')}>Login</button></>
        )}
      </div>
    </section>
  )
}
