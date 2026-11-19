import { useLocation, useNavigate } from 'react-router-dom'
import {
  DocumentIcon,
  HeartIcon,
  HomeIcon,
  MoreIcon,
  NotesIcon,
} from '../icons/Icons'
import './MobileBottomNav.css'

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: HomeIcon, path: '/' },
  { id: 'past-papers', label: 'Past Papers', icon: DocumentIcon, path: '/past-papers' },
  { id: 'notes', label: 'Notes', icon: NotesIcon, path: '/notes' },
  { id: 'motivation', label: 'Motivation', icon: HeartIcon, path: null },
  { id: 'more', label: 'More', icon: MoreIcon, path: null },
]

export default function MobileBottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  function handleNav(itemId, path) {
    if (path) {
      navigate(path)
    }
  }

  return (
    <nav className="mobile-bottom-nav" aria-label="Primary">
      <ul className="mobile-bottom-nav__list">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <li key={item.id}>
              <button
                type="button"
                className={`mobile-bottom-nav__item${isActive ? ' mobile-bottom-nav__item--active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => handleNav(item.id, item.path)}
              >
                <Icon width={22} height={22} />
                <span className="mobile-bottom-nav__label">{item.label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
