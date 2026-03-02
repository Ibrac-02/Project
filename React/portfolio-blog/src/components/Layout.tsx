import { Link, NavLink, Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import UserAvatar from './UserAvatar'
import './supabaseTheme.css'

export default function Layout() {
  const { user } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const appName: string = import.meta.env.VITE_APP_NAME || 'Portfolio-Blog'

  useEffect(() => {
    if (appName) document.title = appName
  }, [appName])

  return (
    <div className="sb-root">
      <header className="sb-header">
        <Link to="/" className="sb-brand wave">☆Ibrac-02☆ ~ Portfolio-Blog ~</Link>
        
        {/* Mobile hamburger menu button */}
        <button 
          className="sb-mobile-menu-btn" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`}></span>
        </button>

        {/* Navigation - desktop visible, mobile in dropdown */}
        <nav className={`sb-nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <NavLink to="/" className="sb-link" onClick={() => setMobileMenuOpen(false)}>Home</NavLink>
          <NavLink to="/projects" className="sb-link" onClick={() => setMobileMenuOpen(false)}>Portfolio</NavLink>
          <NavLink to="/blog" className="sb-link" onClick={() => setMobileMenuOpen(false)}>Blog</NavLink>
          <NavLink to="/about" className="sb-link" onClick={() => setMobileMenuOpen(false)}>About</NavLink>
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

