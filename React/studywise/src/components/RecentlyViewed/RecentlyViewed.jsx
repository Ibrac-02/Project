/* eslint-disable react-refresh/only-export-components */
import { useState } from 'react'
import { ClockIcon, DocumentIcon } from '../icons/Icons'
import './RecentlyViewed.css'

const STORAGE_KEY = 'studywise-recently-viewed'
const MAX_DISPLAY = 5

// Shown until real tracking is wired up — keeps the panel visible per the design.
const SAMPLE_ITEMS = [
  { id: 'sample-1', title: 'Mathematics - 2026 (Term 2) - Paper 1', type: 'Paper' },
  { id: 'sample-2', title: 'English - 2026 (Term 1) - Paper 1', type: 'Paper' },
  { id: 'sample-3', title: 'Business Studies - Final Exam Topics', type: 'Scope' },
]

export default function RecentlyViewed() {
  const [recentItems] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      const parsed = stored ? JSON.parse(stored) : []
      return parsed.length > 0 ? parsed : SAMPLE_ITEMS
    } catch {
      return SAMPLE_ITEMS
    }
  })

  const visibleItems = recentItems.slice(0, MAX_DISPLAY)
  const hasMore = recentItems.length > MAX_DISPLAY

  return (
    <section className="recently-viewed" aria-labelledby="recently-viewed-heading">
      <div className="recently-viewed__header">
        <h2 id="recently-viewed-heading" className="section-heading">
          <ClockIcon width={20} height={20} />
          Recently Viewed
        </h2>
      </div>
      <div className="recently-viewed__card">
        <ul className="recently-viewed__list">
          {visibleItems.map((item) => (
            <li key={item.id}>
              <button type="button" className="recently-viewed__item">
                <span className="recently-viewed__icon" aria-hidden="true">
                  <DocumentIcon width={18} height={18} />
                </span>
                <span className="recently-viewed__title">{item.title}</span>
              </button>
            </li>
          ))}
        </ul>
        {hasMore && (
          <button type="button" className="recently-viewed__view-all">
            View all recent items →
          </button>
        )}
      </div>
    </section>
  )
}

export function addToRecentlyViewed(id, title, type) {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    const current = stored ? JSON.parse(stored) : []
    const filtered = current.filter((item) => item.id !== id)
    const updated = [{ id, title, type }, ...filtered].slice(0, 10)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch {
    // Ignore localStorage errors
  }
}
