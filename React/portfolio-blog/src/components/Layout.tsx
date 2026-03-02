import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import UserAvatar from './UserAvatar'
import './supabaseTheme.css'

export default function Layout() {
  const { user } = useAuth()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const appName: string = import.meta.env.VITE_APP_NAME || 'Portfolio-Blog'

  // Get current page name for display
  const getCurrentPageName = () => {
    const path = location.pathname
    if (path === '/') return 'Home'
    if (path === '/projects') return 'Portfolio'
    if (path === '/blog') return 'Blog'
    if (path === '/about') return 'About'
    return 'Home'
  }

  useEffect(() => {
    if (appName) document.title = appName
  }, [appName])

  return (
    <div className="sb-root">
      <header className="sb-header">
        <Link to="/" className="sb-brand wave">☆Ibrac-02☆ ~ Portfolio-Blog ~</Link>
        
        {/* Navigation - Current page always visible, others in dropdown */}
        <nav className="sb-nav">
          <button 
            className="sb-link nav-trigger" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {getCurrentPageName()}
          </button>
          
          {/* Dropdown menu for other links */}
          <div className={`nav-dropdown ${mobileMenuOpen ? 'open' : ''}`}>
            <NavLink to="/" className="sb-link" onClick={() => setMobileMenuOpen(false)}>Home</NavLink>
            <NavLink to="/projects" className="sb-link" onClick={() => setMobileMenuOpen(false)}>Portfolio</NavLink>
            <NavLink to="/blog" className="sb-link" onClick={() => setMobileMenuOpen(false)}>Blog</NavLink>
            <NavLink to="/about" className="sb-link" onClick={() => setMobileMenuOpen(false)}>About</NavLink>
          </div>
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
      <footer className="sb-footer">{new Date().getFullYear()} © ☆Ibrac-02☆ ~ Portfolio-Blog ~ </footer>
    </div>
  )
}

