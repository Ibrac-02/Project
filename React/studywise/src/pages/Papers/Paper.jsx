import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Footer from '../../components/Footer/Footer'
import Header from '../../components/Header/Header'
import MobileBottomNav from '../../components/MobileBottomNav/MobileBottomNav'
import { ChevronRightIcon, DocumentIcon, DownloadIcon } from '../../components/icons/Icons'
import { SUBJECTS } from '../../data/dashboardData'
import { fetchPastPapers } from './fetchPastPapers'
import { getSubjectColor, getSubjectName, PAPER_YEARS } from './subjectMeta'
import './Paper.css'

function openPublishedFile(url) {
  window.open(url, '_blank', 'noopener,noreferrer')
}

function formatPaperTitle(paper) {
  const parts = [getSubjectName(paper.subjectId), paper.year]
  if (paper.term) parts.push(`(${paper.term})`)
  if (paper.paperNumber) parts.push(paper.paperNumber)
  return parts.join(' - ')
}

export default function Paper() {
  const navigate = useNavigate()
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
            onClick={() => navigate('/')}
          >
            <ChevronRightIcon
              width={18}
              height={18}
              style={{ transform: 'rotate(180deg)' }}
              aria-hidden="true"
            />
            Back to Subjects
          </button>
          <h1 className="papers-page__title">Past Papers</h1>
          <p className="papers-page__subtitle">
            Browse Grade 11 past papers by subject and year (2017–2026).
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

          <button
            type="button"
            className="papers-filters__search-btn"
            aria-label="Search papers"
          >
            Search
          </button>
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
                    <h2 className="paper-card__title">{formatPaperTitle(paper)}</h2>
                  </div>
                </div>
                <div className="paper-card__actions">
                  <button
                    type="button"
                    className="paper-card__doc-btn"
                    disabled={!paper.hasPaper}
                    onClick={() => openPublishedFile(paper.paperUrl)}
                  >
                    <DocumentIcon width={16} height={16} aria-hidden="true" />
                    <span>Question Paper</span>
                    {paper.hasPaper && <DownloadIcon width={16} height={16} aria-hidden="true" />}
                  </button>
                  <button
                    type="button"
                    className="paper-card__doc-btn"
                    disabled={!paper.hasMemo}
                    onClick={() => openPublishedFile(paper.memoUrl)}
                  >
                    <DocumentIcon width={16} height={16} aria-hidden="true" />
                    <span>Memorandum</span>
                    {paper.hasMemo && <DownloadIcon width={16} height={16} aria-hidden="true" />}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : null}

        {status === 'ready' && filteredPapers.length > 0 ? (
          <p className="papers-source">
            Source: Department of Basic Education (DBE)
          </p>
        ) : null}
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  )
}
