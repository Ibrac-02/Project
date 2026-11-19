import { useNavigate } from 'react-router-dom'
import { BoltIcon, DocumentIcon, LightbulbIcon, NotesIcon, TargetIcon } from '../icons/Icons'
import { RESOURCE_CARDS } from '../../data/dashboardData'
import './QuickAccess.css'

function resourceIconId(cardId) {
  switch (cardId) {
    case 'past-papers':
      return DocumentIcon
    case 'notes':
      return NotesIcon
    case 'scope':
      return TargetIcon
    case 'study-tips':
      return LightbulbIcon
    default:
      return DocumentIcon
  }
}

export default function QuickAccess() {
  const navigate = useNavigate()

  function handleCardClick(cardId) {
    if (cardId === 'past-papers') {
      navigate('/past-papers')
    } else if (cardId === 'notes') {
      navigate('/notes')
    }
  }

  return (
    <section className="quick-access" aria-labelledby="quick-access-heading">
      <div className="quick-access__header">
        <h2 id="quick-access-heading" className="section-heading">
          <BoltIcon width={20} height={20} />
          Quick Access
        </h2>
      </div>
      <div className="quick-access__grid">
        {RESOURCE_CARDS.map((card) => (
          <button
            key={card.id}
            type="button"
            className="quick-access__card"
            style={{
              '--card-accent': card.accent,
              '--card-bg': card.bgTint,
            }}
            onClick={() => handleCardClick(card.id)}
          >
            <span className="quick-access__icon" aria-hidden="true">
              {(() => {
                const Icon = resourceIconId(card.id)
                return <Icon width={28} height={28} />
              })()}
            </span>
            <span className="quick-access__text">
              <span className="quick-access__title">{card.title}</span>
              <span className="quick-access__desc">{card.description}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}
