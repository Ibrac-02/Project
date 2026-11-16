import { TAGLINE } from '../../data/dashboardData'
import {
  ChevronDownIcon,
  GraduationCapIcon,
  MenuIcon,
  SearchIcon,
  SunIcon,
} from '../icons/Icons'
import './Header.css'

const SEARCH_PLACEHOLDER = 'Search subjects, topics, past papers, notes...'

export default function Header() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <div className="site-header__brand">
          <span className="site-header__logo" aria-hidden="true">
            <GraduationCapIcon width={32} height={32} />
          </span>
          <div className="site-header__titles">
            <span className="site-header__name">StudyWise</span>
            <span className="site-header__tagline">{TAGLINE}</span>
          </div>
        </div>

        <div className="site-header__search site-header__search--desktop">
          <label className="visually-hidden" htmlFor="header-search">
            Search resources
          </label>
          <SearchIcon className="site-header__search-icon" width={20} height={20} />
          <input
            id="header-search"
            type="search"
            placeholder={SEARCH_PLACEHOLDER}
            className="site-header__search-input"
            autoComplete="off"
          />
        </div>

        <div className="site-header__actions">
          <button type="button" className="site-header__icon-btn site-header__theme-btn" aria-label="Toggle theme">
            <SunIcon width={22} height={22} />
          </button>
          <button type="button" className="site-header__grade-pill" aria-haspopup="listbox">
            Grade 11
            <ChevronDownIcon width={16} height={16} />
          </button>
          <button
            type="button"
            className="site-header__icon-btn site-header__menu-btn"
            aria-label="Open menu"
          >
            <MenuIcon width={22} height={22} />
          </button>
        </div>
      </div>

      <div className="site-header__search site-header__search--mobile">
        <label className="visually-hidden" htmlFor="mobile-search">
          Search resources
        </label>
        <SearchIcon className="site-header__search-icon" width={20} height={20} />
        <input
          id="mobile-search"
          type="search"
          placeholder={SEARCH_PLACEHOLDER}
          className="site-header__search-input"
          autoComplete="off"
        />
      </div>
    </header>
  )
}
