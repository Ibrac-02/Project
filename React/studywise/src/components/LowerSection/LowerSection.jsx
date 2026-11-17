import { useNavigate } from 'react-router-dom'
import {
  LATEST_UPDATES,
  MOTIVATION_MESSAGES,
  
} from '../../data/dashboardData'
import { HeartIcon, MegaphoneIcon } from '../icons/Icons'
import './LowerSection.css'

export default function LowerSection() {
  const navigate = useNavigate()

  return (
    <section className="lower-section" aria-label="Updates and quick links">
      <div className="lower-panel">
        <h2 className="lower-panel__title">
          <MegaphoneIcon width={20} height={20} />
          Latest Updates
        </h2>
        <ul className="lower-panel__list">
          {LATEST_UPDATES.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className="update-item"
                onClick={() => {
                  if (item.text.toLowerCase().includes('paper')) {
                    navigate('/past-papers')
                  }
                }}
              >
                <span className="update-item__text">{item.text}</span>
                <span className="update-item__meta">{item.meta}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="lower-panel lower-panel--motivation" aria-label="Motivation">
        <div className="motivation-card">
          <div className="motivation-card__mountains" aria-hidden="true" />
          <div className="motivation-card__content">
            {MOTIVATION_MESSAGES.map((quote) => (
              <p key={quote} className="motivation-card__quote">
                {quote}
              </p>
            ))}
            <button type="button" className="motivation-card__btn">
              <HeartIcon width={18} height={18} />
              Stay Motivated
            </button>
          </div>
        </div>
      </div>

    
    </section>
  )
}
