import { SUBJECTS } from '../../data/dashboardData'
import { ChevronRightIcon, StarIcon, SubjectIcon } from '../icons/Icons'
import './SubjectsSection.css'

export default function SubjectsSection() {
  return (
    <section className="subjects-section" aria-labelledby="subjects-heading">
      <div className="subjects-section__header">
        <h2 id="subjects-heading" className="section-heading">
          <StarIcon width={20} height={20} />
          Our Subjects
        </h2>
        <button type="button" className="subjects-section__view-all">
          Browse All Subjects →
        </button>
      </div> 

      <ul className="subjects-section__grid subjects-section__grid--desktop">
        {SUBJECTS.map((subject) => (
          <li key={subject.id}>
            <button
              type="button"
              className="subject-card"
              style={{ '--subject-color': subject.color }}
            >
              <span className="subject-card__icon" aria-hidden="true">
                <SubjectIcon type={subject.icon} width={32} height={32} />
              </span>
              <span className="subject-card__name">{subject.name}</span>
              <span className="subject-card__arrow" aria-hidden="true">
                <ChevronRightIcon width={16} height={16} />
              </span>
            </button>
          </li>
        ))}
      </ul>

      <ul className="subjects-section__list subjects-section__list--mobile">
        {SUBJECTS.map((subject) => (
          <li key={subject.id}>
            <button
              type="button"
              className="subject-row"
              style={{ '--subject-color': subject.color }}
            >
              <span className="subject-row__icon" aria-hidden="true">
                <SubjectIcon type={subject.icon} width={22} height={22} />
              </span>
              <span className="subject-row__name">{subject.name}</span>
              <ChevronRightIcon className="subject-row__chevron" width={20} height={20} />
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
