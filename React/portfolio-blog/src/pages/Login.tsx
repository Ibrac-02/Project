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
    if (res.error) {
      const msg = res.error
      // User-friendly error messages for authentication
      if (msg.includes('Invalid login credentials')) {
        setError('Incorrect email or password. Please check your credentials and try again.')
      } else if (msg.includes('User already registered')) {
        setError('An account with this email already exists. Try logging in instead.')
      } else if (msg.includes('Email not confirmed')) {
        setError('Please check your email and confirm your account before logging in.')
      } else if (msg.includes('password') && msg.includes('weak')) {
        setError('Password is too weak. Please choose a stronger password with at least 8 characters.')
      } else if (msg.includes('email') && msg.includes('invalid')) {
        setError('Please enter a valid email address.')
      } else if (msg.includes('network') || msg.includes('connection')) {
        setError('Connection issue. Please check your internet and try again.')
      } else if (msg.includes('rate limit') || msg.includes('too many')) {
        setError('Too many login attempts. Please wait a moment before trying again.')
      } else {
        setError('Authentication failed. Please try again or contact support if the issue persists.')
      }
    }
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
              {showPassword ? '🙈' : '👁️'}
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
