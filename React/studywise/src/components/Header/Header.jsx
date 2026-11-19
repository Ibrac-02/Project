import {
  GraduationCapIcon,
  SearchIcon,
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
          <span className="site-header__tagline">Grade 11</span>
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
