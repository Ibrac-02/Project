import { Link, NavLink, Outlet } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import UserAvatar from './UserAvatar'
import './supabaseTheme.css'

export default function Layout() {
  const { user } = useAuth()
  const appName: string = import.meta.env.VITE_APP_NAME || 'Portfolio-Blog'

  useEffect(() => {
    if (appName) document.title = appName
  }, [appName])

  return (
    <div className="sb-root">
      <header className="sb-header">
        <Link to="/" className="sb-brand wave">☆𝑰𝒃𝒓̃𝒂𝒄-02☆ ~ Portfolio-Blog ~</Link>
        <nav className="sb-nav">
          <NavLink to="/" className="sb-link">Home</NavLink>
          <NavLink to="/projects" className="sb-link">Portfolio</NavLink>
          <NavLink to="/blog" className="sb-link">Blog</NavLink>
          <NavLink to="/about" className="sb-link">About</NavLink>
        </nav>
        <div className="sb-auth">
          {user ? (
            <>
            <UserAvatar />
            </>
          ) : (
            <NavLink to="/login" className="sb-btn">Login</NavLink>
          )}
        </div>
      </header>
      <main className="sb-main">
        <Outlet />
      </main>
      <footer className="sb-footer">{new Date().getFullYear()} © ☆𝑰𝒃𝒓̃𝒂𝒄-02☆ ~ Portfolio-Blog ~ </footer>
    </div>
  )
}

