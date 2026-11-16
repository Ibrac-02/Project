import { GraduationCapIcon, HeartIcon } from '../icons/Icons'
import { useNavigation } from '../../context/useNavigation'
import './Footer.css'

export default function Footer() {
  const { navigate } = useNavigation()

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <GraduationCapIcon className="site-footer__cap" width={22} height={22} aria-hidden="true" />
          <span className="site-footer__name">StudyWise</span>
        </div>

        <ul className="site-footer__links">
          <li className="site-footer__link-item">
            <button
              type="button"
              className="site-footer__link"
              onClick={() => navigate('admin')}
            >
              Admin
            </button>
          </li>
        </ul>

        <p className="site-footer__tagline">
          <HeartIcon width={16} height={16} aria-hidden="true" />
          Free for all learners
        </p>
      </div>
    </footer>
  )
}
