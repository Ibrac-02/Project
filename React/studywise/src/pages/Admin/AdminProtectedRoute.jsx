import { Navigate } from 'react-router-dom'
import { useAdminAuth } from './useAdminAuth'

export default function AdminProtectedRoute({ children }) {
  const { session, isAdmin, loading } = useAdminAuth()

  if (loading) {
    return (
      <div className="admin-page">
        <main className="admin-page__main">
          <p className="admin-empty">Checking administrator access…</p>
        </main>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/admin/login" replace />
  }

  if (!isAdmin) {
    return (
      <div className="admin-page">
        <main className="admin-denied">
          <h1 className="admin-denied__title">Access Denied</h1>
          <p className="admin-denied__text">
            Your account ({session.user.email}) is not authorized as an administrator.
          </p>
          <div style={{ marginTop: '1.5rem', textAlign: 'left', maxWidth: '30rem' }}>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Please check the following in Supabase:
            </p>
            <ol style={{ fontSize: '0.8125rem', color: 'var(--sw-text-muted)', paddingLeft: '1.25rem', margin: 0 }}>
              <li style={{ marginBottom: '0.375rem' }}>You ran the <code>admin_papers.sql</code> migration in the SQL editor</li>
              <li style={{ marginBottom: '0.375rem' }}>Your user UUID is in the <code>public.admin_users</code> table</li>
              <li style={{ marginBottom: '0.375rem' }}>The <code>is_admin()</code> function exists and returns <code>true</code> for your account</li>
            </ol>
          </div>
        </main>
      </div>
    )
  }

  return <>{children}</>
}
