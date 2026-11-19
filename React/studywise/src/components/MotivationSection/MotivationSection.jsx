import { useEffect, useState } from 'react'
import { MegaphoneIcon } from '../icons/Icons'
import { fetchDailyMotivation } from '../../pages/Admin/adminMotivation'
import './MotivationSection.css'

export default function MotivationSection() {
  const [dailyPhrase, setDailyPhrase] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    fetchDailyMotivation()
      .then((result) => {
        if (cancelled) return
        setDailyPhrase(result)
        setLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const quote = loading
    ? 'Loading daily inspiration…'
    : dailyPhrase?.phrase || 'Small steps today, great achievements tomorrow.'

  return (
    <section className="motivation-section" aria-labelledby="motivation-heading">
      <div className="motivation-section__header">
        <h2 id="motivation-heading" className="section-heading">
          <MegaphoneIcon width={20} height={20} />
          Motivation
        </h2>
      </div>
      <div className="motivation-section__card">
        <div className="motivation-section__deco" aria-hidden="true">
          <div className="motivation-section__cloud motivation-section__cloud--1" />
          <div className="motivation-section__cloud motivation-section__cloud--2" />
          <div className="motivation-section__mountains">
            <div className="motivation-section__mountain motivation-section__mountain--1" />
            <div className="motivation-section__mountain motivation-section__mountain--2" />
            <div className="motivation-section__mountain motivation-section__mountain--3" />
          </div>
          <div className="motivation-section__cap">
            <div className="motivation-section__cap-tassel" />
          </div>
        </div>
        <div className="motivation-section__content">
          <blockquote className="motivation-section__quote">{quote}</blockquote>
          <p className="motivation-section__label">STUDYWISE • DAILY INSPIRATION</p>
        </div>
      </div>
    </section>
  )
}
