import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Navigate } from 'react-router-dom'

export default function Login() {
  const { user, login, signup } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to="/" replace />

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const fn = mode === 'login' ? login : signup
    const res = await fn(email.trim(), password)
    if (res.error) setError(res.error)
    setLoading(false)
  }

  return (
    <section className="sb-card" style={{ maxWidth: 440, margin: '0 auto' }}>
      <h1 style={{ marginTop: 0 }}>{mode === 'login' ? 'Login' : 'Create account'}</h1>
      <p style={{ color: 'var(--sb-text-dim)' }}>
        {mode === 'login' ? 'Sign in to post on the blog.' : 'Sign up to start posting.'}
      </p>

      {error && <div className="sb-card" style={{ borderColor: '#b91c1c', color: '#fecaca' }}>{error}</div>}

      <form onSubmit={onSubmit} style={{ display:'grid', gap: 12 }}>
        <div>
          <label className="sb-label" htmlFor="email">Email</label>
          <input id="email" type="email" className="sb-input" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
        </div>
        <div>
          <label className="sb-label" htmlFor="password">Password</label>
          <input id="password" type="password" className="sb-input" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
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
