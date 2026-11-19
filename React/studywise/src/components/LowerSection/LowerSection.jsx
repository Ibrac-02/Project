import { useEffect, useState } from 'react'
import { fetchDailyMotivation } from '../../pages/Admin/adminMotivation'
import './LowerSection.css'

export default function LowerSection() {
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

  return (
    <section className="lower-section" aria-label="Motivation">
      <div className="lower-panel lower-panel--motivation" aria-label="Motivation">
        <div className="motivation-card">
          <div className="motivation-card__background" aria-hidden="true" />
          <div className="motivation-card__content">
            {loading ? (
              <p className="motivation-card__quote">Loading daily inspiration…</p>
            ) : dailyPhrase ? (
              <p className="motivation-card__quote">{dailyPhrase.phrase}</p>
            ) : (
              <p className="motivation-card__quote">You are closer than you think.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
