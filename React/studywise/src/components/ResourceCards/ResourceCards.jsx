import { useNavigation } from '../../context/useNavigation'
import { RESOURCE_CARDS } from '../../data/dashboardData'
import { ChevronRightIcon } from '../icons/Icons'
import { resourceIconId } from '../icons/resourceIcons'
import './ResourceCards.css'

export default function ResourceCards() {
  const { navigate } = useNavigation()

  function handleCardClick(cardId) {
    if (cardId === 'past-papers') {
      navigate('past-papers')
    }
  }

  return (
    <section className="resource-cards" aria-labelledby="resources-heading">
      <h2 id="resources-heading" className="visually-hidden">
        Study resources
      </h2>
      <ul className="resource-cards__grid">
        {RESOURCE_CARDS.map((card) => {
          const Icon = resourceIconId(card.id)
          return (
            <li key={card.id}>
              <button
                type="button"
                className="resource-card"
                style={{
                  '--card-accent': card.accent,
                  '--card-bg': card.bgTint,
                }}
                onClick={() => handleCardClick(card.id)}
              >
                <span className="resource-card__icon" aria-hidden="true">
                  <Icon width={24} height={24} />
                </span>
                <span className="resource-card__text">
                  <span className="resource-card__title">{card.title}</span>
                  <span className="resource-card__desc">{card.description}</span>
                </span>
                <ChevronRightIcon className="resource-card__chevron" width={20} height={20} />
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
