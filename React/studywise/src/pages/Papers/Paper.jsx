import { useEffect, useMemo, useState } from 'react'
import Footer from '../../components/Footer/Footer'
import Header from '../../components/Header/Header'
import MobileBottomNav from '../../components/MobileBottomNav/MobileBottomNav'
import { ChevronRightIcon, DocumentIcon } from '../../components/icons/Icons'
import { useNavigation } from '../../context/useNavigation'
import { SUBJECTS } from '../../data/dashboardData'
import { fetchPastPapers } from './fetchPastPapers'
import { getSubjectColor, getSubjectName, PAPER_YEARS } from './subjectMeta'
import './Paper.css'

function openPublishedFile(url) {
  window.open(url, '_blank', 'noopener,noreferrer')
}

export default function Paper() {
  const { navigate } = useNavigation()
  const [subjectFilter, setSubjectFilter] = useState('all')
  const [yearFilter, setYearFilter] = useState('all')
  const [papers, setPapers] = useState([])
  const [status, setStatus] = useState('loading')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let cancelled = false

    fetchPastPapers()
      .then((rows) => {
        if (cancelled) return
        setPapers(rows)
        setStatus('ready')
      })
      .catch((error) => {
        if (cancelled) return
        const missingTable = error?.code === 'PGRST205'
        setErrorMessage(
          missingTable
            ? 'The past_papers table is not in Supabase yet. Run src/pages/Papers/past_papers.sql in the SQL editor, then reload this page.'
            : error?.message || 'Past papers could not be loaded.',
        )
        setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [])

  const filteredPapers = useMemo(() => {
    return papers.filter((paper) => {
      const matchesSubject = subjectFilter === 'all' || paper.subjectId === subjectFilter
      const matchesYear = yearFilter === 'all' || paper.year === Number(yearFilter)
      return matchesSubject && matchesYear
    })
  }, [papers, subjectFilter, yearFilter])

  return (
    <div className="papers-page">
      <Header />
      <main id="main-content" className="papers-page__main">
        <div className="papers-page__top">
          <button
            type="button"
            className="papers-page__back"
            onClick={() => navigate('home')}
          >
            <ChevronRightIcon
              width={18}
              height={18}
              style={{ transform: 'rotate(180deg)' }}
              aria-hidden="true"
            />
            Back to Home
          </button>
          <h1 className="papers-page__title">Past Papers</h1>
          <p className="papers-page__subtitle">
            Browse Grade 11 past papers by subject and year (2017–2024).
          </p>
          <p className="papers-page__note">
            Papers are loaded from Supabase. View paper and View memo open a file only when a URL is published.
          </p>
        </div>

        <div className="papers-filters">
          <div className="papers-filters__field">
            <label className="papers-filters__label" htmlFor="paper-subject">
              Subject
            </label>
            <select
              id="paper-subject"
              className="papers-filters__select"
              value={subjectFilter}
              onChange={(event) => setSubjectFilter(event.target.value)}
            >
              <option value="all">All subjects</option>
              {SUBJECTS.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>

          <div className="papers-filters__field">
            <label className="papers-filters__label" htmlFor="paper-year">
              Year
            </label>
            <select
              id="paper-year"
              className="papers-filters__select"
              value={yearFilter}
              onChange={(event) => setYearFilter(event.target.value)}
            >
              <option value="all">All years</option>
              {PAPER_YEARS.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {status === 'loading' ? (
          <p className="papers-empty">Loading past papers…</p>
        ) : null}

        {status === 'error' ? (
          <p className="papers-empty papers-empty--error" role="alert">
            {errorMessage}
          </p>
        ) : null}

        {status === 'ready' && filteredPapers.length === 0 ? (
          <p className="papers-empty">No past papers match these filters.</p>
        ) : null}

        {status === 'ready' && filteredPapers.length > 0 ? (
          <ul className="papers-list">
            {filteredPapers.map((paper) => (
              <li
                key={paper.id}
                className="paper-card"
                style={{ '--paper-color': getSubjectColor(paper.subjectId) }}
              >
                <div className="paper-card__header">
                  <span className="paper-card__badge" aria-hidden="true" />
                  <div className="paper-card__meta">
                    <h2 className="paper-card__title">{paper.title}</h2>
                    <p className="paper-card__details">
                      {getSubjectName(paper.subjectId)} · {paper.year}
                    </p>
                  </div>
                </div>
                <div className="paper-card__actions">
                  <button
                    type="button"
                    className="paper-card__btn"
                    disabled={!paper.hasPaper}
                    onClick={() => openPublishedFile(paper.paperUrl)}
                  >
                    <DocumentIcon width={16} height={16} aria-hidden="true" />
                    View paper
                  </button>
                  <button
                    type="button"
                    className="paper-card__btn"
                    disabled={!paper.hasMemo}
                    onClick={() => openPublishedFile(paper.memoUrl)}
                  >
                    <DocumentIcon width={16} height={16} aria-hidden="true" />
                    View memo
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  )
}
