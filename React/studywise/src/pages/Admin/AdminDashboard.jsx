import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Footer from '../../components/Footer/Footer'
import Header from '../../components/Header/Header'
import { ChevronRightIcon, DocumentIcon, ListIcon, NotesIcon } from '../../components/icons/Icons'
import { fetchAllPapers } from './adminPapers'
import { fetchAllNotes } from './adminNotes'
import { adminSignOut } from './useAdminAuth'
import { getSubjectName } from '../Papers/subjectMeta'
import './Admin.css'

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [papers, setPapers] = useState([])
  const [notes, setNotes] = useState([])
  const [status, setStatus] = useState('loading')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let cancelled = false

    Promise.all([fetchAllPapers(), fetchAllNotes()])
      .then(([paperRows, noteRows]) => {
        if (cancelled) return
        setPapers(paperRows)
        setNotes(noteRows)
        setStatus('ready')
      })
      .catch((error) => {
        if (cancelled) return
        setErrorMessage(error?.message || 'Dashboard could not be loaded.')
        setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [])

  const totalPapers = papers.length
  const publishedNotes = notes.filter((note) => note.published).length
  const recent = papers.slice(0, 5)

  return (
    <div className="admin-page">
      <Header />
      <main id="main-content" className="admin-page__main">
        <div className="admin-top">
          <div>
            <h1 className="admin-top__title">Admin Dashboard</h1>
            <p className="admin-top__subtitle">Manage StudyWise past papers and notes.</p>
          </div>
          <button
            type="button"
            className="admin-btn"
            onClick={async () => {
              await adminSignOut()
              navigate('/admin/login')
            }}
          >
            Log out
          </button>
        </div>

        {status === 'loading' ? (
          <p className="admin-empty">Loading dashboard…</p>
        ) : null}

        {status === 'error' ? (
          <p className="admin-empty admin-empty--error" role="alert">
            {errorMessage}
          </p>
        ) : null}

        {status === 'ready' ? (
          <>
            <div className="admin-stats">
              <div className="admin-stat">
                <p className="admin-stat__value">{totalPapers}</p>
                <p className="admin-stat__label">Total papers</p>
              </div>
              <div className="admin-stat">
                <p className="admin-stat__value">{publishedNotes}</p>
                <p className="admin-stat__label">Published notes</p>
              </div>
              <div className="admin-stat">
                <p className="admin-stat__value">{notes.length}</p>
                <p className="admin-stat__label">Total notes</p>
              </div>
            </div>

            <div className="admin-cards">
              <button
                type="button"
                className="admin-card-link"
                onClick={() => navigate('/admin/papers/upload')}
              >
                <span className="admin-card-link__icon" aria-hidden="true">
                  <DocumentIcon width={24} height={24} />
                </span>
                <span>
                  <span className="admin-card-link__title" style={{ display: 'block' }}>
                    Upload Paper
                  </span>
                  <span className="admin-card-link__desc">
                    Add a question paper or memorandum PDF.
                  </span>
                </span>
                <ChevronRightIcon
                  width={18}
                  height={18}
                  style={{ marginLeft: 'auto', color: 'var(--sw-text-muted)' }}
                  aria-hidden="true"
                />
              </button>

              <button
                type="button"
                className="admin-card-link"
                onClick={() => navigate('/admin/papers')}
              >
                <span className="admin-card-link__icon" aria-hidden="true">
                  <ListIcon width={24} height={24} />
                </span>
                <span>
                  <span className="admin-card-link__title" style={{ display: 'block' }}>
                    Manage Papers
                  </span>
                  <span className="admin-card-link__desc">
                    Edit, publish, or delete uploaded papers.
                  </span>
                </span>
                <ChevronRightIcon
                  width={18}
                  height={18}
                  style={{ marginLeft: 'auto', color: 'var(--sw-text-muted)' }}
                  aria-hidden="true"
                />
              </button>

              <button
                type="button"
                className="admin-card-link"
                onClick={() => navigate('/admin/notes/upload')}
              >
                <span className="admin-card-link__icon" aria-hidden="true">
                  <NotesIcon width={24} height={24} />
                </span>
                <span>
                  <span className="admin-card-link__title" style={{ display: 'block' }}>
                    Upload Note
                  </span>
                  <span className="admin-card-link__desc">
                    Add a note PDF with subject, title and summary.
                  </span>
                </span>
                <ChevronRightIcon
                  width={18}
                  height={18}
                  style={{ marginLeft: 'auto', color: 'var(--sw-text-muted)' }}
                  aria-hidden="true"
                />
              </button>

              <button
                type="button"
                className="admin-card-link"
                onClick={() => navigate('/admin/notes')}
              >
                <span className="admin-card-link__icon" aria-hidden="true">
                  <ListIcon width={24} height={24} />
                </span>
                <span>
                  <span className="admin-card-link__title" style={{ display: 'block' }}>
                    Manage Notes
                  </span>
                  <span className="admin-card-link__desc">
                    Edit, publish, replace or delete uploaded notes.
                  </span>
                </span>
                <ChevronRightIcon
                  width={18}
                  height={18}
                  style={{ marginLeft: 'auto', color: 'var(--sw-text-muted)' }}
                  aria-hidden="true"
                />
              </button>
            </div>

            <h2 className="admin-section-title">Recent uploads</h2>
            {recent.length === 0 ? (
              <p className="admin-empty">No papers uploaded yet.</p>
            ) : (
              <ul className="admin-recent">
                {recent.map((paper) => (
                  <li key={paper.id} className="admin-recent__item">
                    <span className="admin-recent__title">{paper.title}</span>
                    <span className="admin-recent__meta">
                      {getSubjectName(paper.subjectId)} · {formatDate(paper.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : null}
      </main>
      <Footer />
    </div>
  )
}
