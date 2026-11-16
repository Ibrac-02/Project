import { useEffect, useState } from 'react'
import Footer from '../../components/Footer/Footer'
import Header from '../../components/Header/Header'
import { ChevronRightIcon, DocumentIcon, ListIcon } from '../../components/icons/Icons'
import { useNavigation } from '../../context/useNavigation'
import { fetchAllPapers } from './adminPapers'
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
  const { navigate } = useNavigation()
  const [papers, setPapers] = useState([])
  const [status, setStatus] = useState('loading')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let cancelled = false

    fetchAllPapers()
      .then((rows) => {
        if (cancelled) return
        setPapers(rows)
        setStatus('ready')
      })
      .catch((error) => {
        if (cancelled) return
        setErrorMessage(error?.message || 'Papers could not be loaded.')
        setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [])

  const total = papers.length
  const published = papers.filter((paper) => paper.isPublished).length
  const recent = papers.slice(0, 5)

  return (
    <div className="admin-page">
      <Header />
      <main id="main-content" className="admin-page__main">
        <div className="admin-top">
          <div>
            <h1 className="admin-top__title">Admin Dashboard</h1>
            <p className="admin-top__subtitle">Manage StudyWise past papers.</p>
          </div>
          <button
            type="button"
            className="admin-btn"
            onClick={async () => {
              await adminSignOut()
              navigate('home')
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
                <p className="admin-stat__value">{total}</p>
                <p className="admin-stat__label">Total papers</p>
              </div>
              <div className="admin-stat">
                <p className="admin-stat__value">{published}</p>
                <p className="admin-stat__label">Published papers</p>
              </div>
              <div className="admin-stat">
                <p className="admin-stat__value">{total - published}</p>
                <p className="admin-stat__label">Unpublished</p>
              </div>
            </div>

            <div className="admin-cards">
              <button
                type="button"
                className="admin-card-link"
                onClick={() => navigate('admin-upload')}
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
                onClick={() => navigate('admin-manage')}
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
