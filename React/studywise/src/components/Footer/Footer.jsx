import { GraduationCapIcon, HeartIcon } from '../icons/Icons'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <GraduationCapIcon className="site-footer__cap" width={22} height={22} aria-hidden="true" />
          <span className="site-footer__name">StudyWise</span>
        </div>

        <p className="site-footer__tagline">
          <HeartIcon width={16} height={16} aria-hidden="true" />
          Free for all learners
        </p>
      </div>
    </footer>
  )
}
