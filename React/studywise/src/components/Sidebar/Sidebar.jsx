import { useLocation, useNavigate } from 'react-router-dom'
import {
  DocumentIcon,
  HeartIcon,
  HomeIcon,
  LightbulbIcon,
  NotesIcon,
  TargetIcon,
} from '../icons/Icons'
import './Sidebar.css'

const SIDEBAR_ITEMS = [
  { id: 'home', label: 'Home', icon: HomeIcon, path: '/' },
  { id: 'past-papers', label: 'Past Papers', icon: DocumentIcon, path: '/past-papers' },
  { id: 'notes', label: 'Notes', icon: NotesIcon, path: '/notes' },
  { id: 'scope', label: 'Scope', icon: TargetIcon, path: null },
  { id: 'motivation', label: 'Motivation', icon: HeartIcon, path: null },
  { id: 'study-tips', label: 'Study Tips', icon: LightbulbIcon, path: null },
]

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()

  function handleNav(path) {
    if (path) {
      navigate(path)
    }
  }

  return (
    <aside className="sidebar" aria-label="Main navigation">
      <nav className="sidebar__nav">
        <ul className="sidebar__list">
          {SIDEBAR_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <li key={item.id}>
                <button
                  type="button"
                  className={`sidebar__item${isActive ? ' sidebar__item--active' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => handleNav(item.path)}
                >
                  <Icon width={20} height={20} />
                  <span className="sidebar__label">{item.label}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
      <div className="sidebar__quote">
        <DocumentIcon width={18} height={18} className="sidebar__quote-icon" />
        <p className="sidebar__quote-text">Study well today for a better tomorrow!</p>
      </div>
    </aside>
  )
}
