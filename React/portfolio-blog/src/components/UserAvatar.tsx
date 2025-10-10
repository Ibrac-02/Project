import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'

function stringToColor(seed: string) {
  // Simple deterministic pastel color from string
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  const h = Math.abs(hash) % 360
  return `hsl(${h} 70% 35%)`
}

function getInitials(name?: string | null, email?: string | null) {
  const base = (name && name.trim()) || (email ? email.split('@')[0] : '')
  if (!base) return '?'
  const parts = base.split(/\s+|_|\./).filter(Boolean)
  const first = parts[0]?.[0] || ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase() || base[0].toUpperCase()
}

export default function UserAvatar() {
  const { user, logout } = useAuth()

  const initials = useMemo(() => getInitials(user?.name, user?.email), [user?.name, user?.email])
  const bg = useMemo(() => stringToColor(user?.id || user?.email || 'user'), [user?.id, user?.email])

  if (!user) return null

  return (
    <div className="avatar">
      <button
        className="avatar-circle"
        style={{ background: bg, overflow: 'hidden' }}
        aria-label="User menu"
        title={user.name || user.email || 'User'}
      >
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt={user.name || 'avatar'} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        ) : (
          initials
        )}
      </button>
      <div className="avatar-menu" role="menu">
        <Link to="/profile" role="menuitem" className="avatar-menu-item">Profile</Link>
        <div className="avatar-sep" />
        <button onClick={logout} role="menuitem" className="avatar-menu-item danger">Logout</button>
      </div>
    </div>
  )
}
