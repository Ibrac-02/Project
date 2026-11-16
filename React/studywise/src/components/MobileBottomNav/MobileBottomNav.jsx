import { useNavigation } from '../../context/useNavigation'
import {
  DocumentIcon,
  HomeIcon,
  MoreIcon,
  NotesIcon,
  TargetIcon,
} from '../icons/Icons'
import './MobileBottomNav.css'

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: HomeIcon },
  { id: 'past-papers', label: 'Past Papers', icon: DocumentIcon },
  { id: 'notes', label: 'Notes', icon: NotesIcon },
  { id: 'scope', label: 'Scope', icon: TargetIcon },
  { id: 'more', label: 'More', icon: MoreIcon },
]

export default function MobileBottomNav() {
  const { page, navigate } = useNavigation()

  function handleNav(itemId) {
    if (itemId === 'home' || itemId === 'past-papers') {
      navigate(itemId)
    }
  }

  return (
    <nav className="mobile-bottom-nav" aria-label="Primary">
      <ul className="mobile-bottom-nav__list">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = page === item.id
          return (
            <li key={item.id}>
              <button
                type="button"
                className={`mobile-bottom-nav__item${isActive ? ' mobile-bottom-nav__item--active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => handleNav(item.id)}
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
