import NavigationProvider from './context/NavigationProvider'
import { useNavigation } from './context/useNavigation'
import Dashboard from './pages/Dashboard/Dashboard'
import Paper from './pages/Papers/Paper'
import AdminLayout from './pages/Admin/AdminLayout'
import AdminDashboard from './pages/Admin/AdminDashboard'
import UploadPaper from './pages/Admin/UploadPaper'
import ManagePapers from './pages/Admin/ManagePapers'

function AppRoutes() {
  const { page } = useNavigation()

  if (page === 'past-papers') {
    return <Paper />
  }

  if (page === 'admin' || page === 'admin-upload' || page === 'admin-manage') {
    return (
      <AdminLayout>
        {page === 'admin-upload' ? <UploadPaper /> : null}
        {page === 'admin-manage' ? <ManagePapers /> : null}
        {page === 'admin' ? <AdminDashboard /> : null}
      </AdminLayout>
    )
  }

  return <Dashboard />
}

function App() {
  return (
    <NavigationProvider>
      <AppRoutes />
    </NavigationProvider>
  )
}

export default App
