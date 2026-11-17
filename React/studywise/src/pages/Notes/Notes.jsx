import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Footer from '../../components/Footer/Footer'
import Header from '../../components/Header/Header'
import MobileBottomNav from '../../components/MobileBottomNav/MobileBottomNav'
import { ChevronRightIcon, DocumentIcon, DownloadIcon, NotesIcon } from '../../components/icons/Icons'
import { SUBJECTS } from '../../data/dashboardData'
import { fetchPublishedNotes } from './fetchNotes'
import { getSubjectColor, getSubjectName } from '../Papers/subjectMeta'
import './Notes.css'

function openPublishedFile(url) {
  window.open(url, '_blank', 'noopener,noreferrer')
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function Notes() {
  const navigate = useNavigate()
  const [subjectFilter, setSubjectFilter] = useState('all')
  const [notes, setNotes] = useState([])
  const [status, setStatus] = useState('loading')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let cancelled = false

    fetchPublishedNotes()
      .then((rows) => {
        if (cancelled) return
        setNotes(rows)
        setStatus('ready')
      })
      .catch((error) => {
        if (cancelled) return
        const missingTable = error?.code === 'PGRST205'
        setErrorMessage(
          missingTable
            ? 'Notes are not available yet. Please check back later.'
            : error?.message || 'Notes could not be loaded.',
        )
        setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [])

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => subjectFilter === 'all' || note.subjectId === subjectFilter)
  }, [notes, subjectFilter])

  return (
    <div className="notes-page">
      <Header />
      <main id="main-content" className="notes-page__main">
        <div className="notes-page__top">
          <button
            type="button"
            className="notes-page__back"
            onClick={() => navigate('/')}
          >
            <ChevronRightIcon
              width={18}
              height={18}
              style={{ transform: 'rotate(180deg)' }}
              aria-hidden="true"
            />
            Back to Home
          </button>
          <h1 className="notes-page__title">Notes</h1>
          <p className="notes-page__subtitle">
            Read summarised notes for each subject and topic.
          </p>
        </div>

        <div className="notes-filters">
          <div className="notes-filters__field">
            <label className="notes-filters__label" htmlFor="note-subject">
              Subject
            </label>
            <select
              id="note-subject"
              className="notes-filters__select"
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
        </div>

        {status === 'loading' ? (
          <p className="notes-empty">Loading notes…</p>
        ) : null}

        {status === 'error' ? (
          <p className="notes-empty notes-empty--error" role="alert">
            {errorMessage}
          </p>
        ) : null}

        {status === 'ready' && filteredNotes.length === 0 ? (
          <p className="notes-empty">No published notes for this subject yet.</p>
        ) : null}

        {status === 'ready' && filteredNotes.length > 0 ? (
          <ul className="notes-list">
            {filteredNotes.map((note) => (
              <li
                key={note.id}
                className="note-card"
                style={{ '--note-color': getSubjectColor(note.subjectId) }}
              >
                <div className="note-card__header">
                  <span className="note-card__icon" aria-hidden="true">
                    <NotesIcon width={22} height={22} />
                  </span>
                  <div className="note-card__meta">
                    <h2 className="note-card__title">{note.title}</h2>
                    <p className="note-card__details">
                      {getSubjectName(note.subjectId)} · {formatDate(note.createdAt)}
                    </p>
                  </div>
                </div>
                {note.description ? (
                  <p className="note-card__desc">{note.description}</p>
                ) : null}
                <div className="note-card__actions">
                  <button
                    type="button"
                    className="note-card__btn note-card__btn--primary"
                    disabled={!note.hasFile}
                    onClick={() => openPublishedFile(note.fileUrl)}
                  >
                    <DocumentIcon width={16} height={16} aria-hidden="true" />
                    <span>Read note</span>
                    {note.hasFile && <DownloadIcon width={16} height={16} aria-hidden="true" />}
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
