import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { EyeIcon, EyeOffIcon, GraduationCapIcon } from '../../components/icons/Icons'
import './Admin.css'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorMessage('')

    if (!email.trim() || !password) {
      setErrorMessage('Enter your email and password.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    setLoading(false)

    if (error) {
      setErrorMessage(
        error.message === 'Invalid login credentials'
          ? 'Incorrect email or password.'
          : error.message,
      )
    } else {
      navigate('/admin')
    }
  }

  return (
    <div className="admin-page">
      <main className="admin-login">
        <div className="admin-login__card">
          <span className="admin-login__logo" aria-hidden="true">
            <GraduationCapIcon width={36} height={36} />
          </span>
          <h1 className="admin-login__title">StudyWise Admin</h1>
          <p className="admin-login__subtitle">
            Sign in with an authorized administrator account.
          </p>

          <form className="admin-form" onSubmit={handleSubmit} noValidate>
            <div className="admin-form__field">
              <label className="admin-form__label" htmlFor="admin-email">
                Email address
              </label>
              <input
                id="admin-email"
                type="email"
                className="admin-form__input"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className="admin-form__field">
              <label className="admin-form__label" htmlFor="admin-password">
                Password
              </label>
              <div className="admin-form__password-wrapper">
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  className="admin-form__input"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="admin-form__password-toggle"
                >
                  {showPassword ? (
                    <EyeOffIcon width={20} height={20} />
                  ) : (
                    <EyeIcon width={20} height={20} />
                  )}
                </button>
              </div>
            </div>

            {errorMessage ? (
              <p className="admin-alert admin-alert--error" role="alert">
                {errorMessage}
              </p>
            ) : null}

            <button
              type="submit"
              className="admin-btn admin-btn--primary"
              disabled={loading}
            >
              {loading ? 'Signing in…' : 'Log in'}
            </button>
          </form>

          <button
            type="button"
            className="admin-back"
            onClick={() => navigate('/')}
            style={{ marginTop: '1rem' }}
          >
            ← Back to Home
          </button>
        </div>
      </main>
    </div>
  )
}
