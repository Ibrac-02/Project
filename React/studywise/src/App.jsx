import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard/Dashboard'
import Paper from './pages/Papers/Paper'
import Notes from './pages/Notes/Notes'
import AdminLogin from './pages/Admin/AdminLogin'
import AdminDashboard from './pages/Admin/AdminDashboard'
import UploadPaper from './pages/Admin/UploadPaper'
import ManagePapers from './pages/Admin/ManagePapers'
import UploadNote from './pages/Admin/UploadNote'
import ManageNotes from './pages/Admin/ManageNotes'
import AdminProtectedRoute from './pages/Admin/AdminProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Student routes */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/past-papers" element={<Paper />} />
        <Route path="/notes" element={<Notes />} />

        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/papers/upload"
          element={
            <AdminProtectedRoute>
              <UploadPaper />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/papers"
          element={
            <AdminProtectedRoute>
              <ManagePapers />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/notes/upload"
          element={
            <AdminProtectedRoute>
              <UploadNote />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/notes"
          element={
            <AdminProtectedRoute>
              <ManageNotes />
            </AdminProtectedRoute>
          }
        />

        {/* Redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
