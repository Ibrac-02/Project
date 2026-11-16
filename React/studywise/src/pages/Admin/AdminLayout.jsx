import { useNavigation } from '../../context/useNavigation'
import { useAdminAuth, adminSignOut } from './useAdminAuth'
import AdminLogin from './AdminLogin'
import './Admin.css'

export default function AdminLayout({ children }) {
  const { navigate } = useNavigation()
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
    return <AdminLogin />
  }

  if (!isAdmin) {
    return (
      <div className="admin-page">
        <main className="admin-denied">
          <h1 className="admin-denied__title">Access denied</h1>
          <p className="admin-denied__text">
            The account {session.user.email} is not authorized to manage StudyWise
            papers. Ask the site owner to add this email to the admin_emails table.
          </p>
          <button
            type="button"
            className="admin-btn"
            onClick={async () => {
              await adminSignOut()
              navigate('home')
            }}
          >
            Sign out
          </button>
        </main>
      </div>
    )
  }

  return <>{children}</>
}
