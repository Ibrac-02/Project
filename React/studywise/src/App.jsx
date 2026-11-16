import NavigationProvider from './context/NavigationProvider'
import { useNavigation } from './context/useNavigation'
import Dashboard from './pages/Dashboard/Dashboard'
import Paper from './pages/Papers/Paper'

function AppRoutes() {
  const { page } = useNavigation()

  if (page === 'past-papers') {
    return <Paper />
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
