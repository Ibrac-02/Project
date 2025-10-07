import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import './supabaseTheme.css'

export default function Layout() {
  const { user, logout, isAdmin } = useAuth()

  return (
    <div className="sb-root">
      <header className="sb-header">
        <Link to="/" className="sb-brand">Ibrac-02</Link>
        <nav className="sb-nav">
          <NavLink to="/" className="sb-link">Home</NavLink>
          <NavLink to="/projects" className="sb-link">Portfolio</NavLink>
          <NavLink to="/blog" className="sb-link">Blog</NavLink>
        </nav>
        <div className="sb-auth">
          {user ? (
            <>
              <NavLink to="/profile" className="sb-btn">Profile</NavLink>
              <span className="sb-user">{user.name || user.email}{isAdmin ? ' · Admin' : ''}</span>
              <button className="sb-btn" onClick={logout}>Logout</button>
            </>
          ) : (
            <NavLink to="/login" className="sb-btn">Login</NavLink>
          )}
        </div>
      </header>
      <main className="sb-main">
        <Outlet />
      </main>
      <footer className="sb-footer">{new Date().getFullYear()} © Ibrac-02 | All rights reserved. | Built with React + Supabase</footer>
    </div>
  )
}
