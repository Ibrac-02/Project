import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Footer from '../../components/Footer/Footer'
import Header from '../../components/Header/Header'
import { ChevronRightIcon } from '../../components/icons/Icons'
import { SUBJECTS } from '../../data/dashboardData'
import {
  deletePaper,
  deleteStorageFile,
  fetchAllPapers,
  makeStoragePath,
  updatePaperDetails,
  updatePaperDocumentUrl,
  uploadPdfToStorage,
} from './adminPapers'
import { getSubjectName } from '../Papers/subjectMeta'
import './Admin.css'

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function AvailabilityBadge({ url }) {
  return url ? (
    <span className="admin-badge admin-badge--yes">Available</span>
  ) : (
    <span className="admin-badge admin-badge--no">Missing</span>
  )
}

export default function ManagePapers() {
  const navigate = useNavigate()
  const replaceInputRef = useRef(null)
  const [papers, setPapers] = useState([])
  const [status, setStatus] = useState('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [notice, setNotice] = useState('')

  const [subjectFilter, setSubjectFilter] = useState('all')
  const [yearFilter, setYearFilter] = useState('all')
  const [search, setSearch] = useState('')

  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ title: '', term: '', paperNumber: '' })
  const [busyId, setBusyId] = useState(null)
  const [replaceTarget, setReplaceTarget] = useState(null) // { id, docType }

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

  const filteredPapers = useMemo(() => {
    const term = search.trim().toLowerCase()
    return papers.filter((paper) => {
      const matchesSubject = subjectFilter === 'all' || paper.subjectId === subjectFilter
      const matchesYear = yearFilter === 'all' || paper.year === Number(yearFilter)
      const matchesSearch =
        term === '' ||
        paper.title.toLowerCase().includes(term) ||
        getSubjectName(paper.subjectId).toLowerCase().includes(term)
      return matchesSubject && matchesYear && matchesSearch
    })
  }, [papers, subjectFilter, yearFilter, search])

  const yearOptions = useMemo(
    () => [...new Set(papers.map((paper) => paper.year))].sort((a, b) => b - a),
    [papers],
  )

  function openFile(url) {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  function startReplace(paper, docType) {
    setReplaceTarget({ id: paper.id, docType })
    if (replaceInputRef.current) {
      replaceInputRef.current.value = ''
      replaceInputRef.current.click()
    }
  }

  async function handleReplaceFile(event) {
    const file = event.target.files?.[0]
    const target = replaceTarget
    setReplaceTarget(null)
    if (!file || !target) return

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage('Only PDF files are allowed.')
      return
    }

    const paper = papers.find((row) => row.id === target.id)
    if (!paper) return

    setBusyId(target.id)
    setNotice('')
    setErrorMessage('')
    try {
      const storagePath = makeStoragePath({
        subjectId: paper.subjectId,
        year: paper.year,
        docType: target.docType === 'paper' ? 'question-paper' : 'memo',
        fileName: file.name,
      })
      const publicUrl = await uploadPdfToStorage(file, storagePath)
      await updatePaperDocumentUrl(target.id, target.docType, publicUrl)

      const oldUrl = target.docType === 'paper' ? paper.paperUrl : paper.memoUrl
      try {
        await deleteStorageFile(oldUrl)
      } catch {
        // Old file cleanup is best-effort; the new URL is already saved.
      }

      setPapers((current) =>
        current.map((row) =>
          row.id === target.id
            ? {
                ...row,
                paperUrl: target.docType === 'paper' ? publicUrl : row.paperUrl,
                memoUrl: target.docType === 'memo' ? publicUrl : row.memoUrl,
              }
            : row,
        ),
      )
      setNotice(
        `${target.docType === 'paper' ? 'Question paper' : 'Memorandum'} replaced for "${paper.title}".`,
      )
    } catch (error) {
      setErrorMessage(error?.message || 'Could not replace the file.')
    } finally {
      setBusyId(null)
    }
  }

  function startEdit(paper) {
    setEditingId(paper.id)
    setEditForm({
      title: paper.title,
      term: paper.term,
      paperNumber: paper.paperNumber,
    })
  }

  async function saveEdit(id) {
    setBusyId(id)
    setNotice('')
    setErrorMessage('')
    try {
      await updatePaperDetails(id, editForm)
      setPapers((current) =>
        current.map((row) =>
          row.id === id
            ? { ...row, title: editForm.title, term: editForm.term, paperNumber: editForm.paperNumber }
            : row,
        ),
      )
      setEditingId(null)
    } catch (error) {
      setErrorMessage(error?.message || 'Could not save changes.')
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete(paper) {
    const confirmed = window.confirm(
      `Delete "${paper.title}"? This also removes its PDF files from storage. This cannot be undone.`,
    )
    if (!confirmed) return

    setBusyId(paper.id)
    setNotice('')
    setErrorMessage('')
    try {
      await deletePaper(paper.id, paper.paperUrl, paper.memoUrl)
      setPapers((current) => current.filter((row) => row.id !== paper.id))
      setNotice(`"${paper.title}" was deleted.`)
    } catch (error) {
      setErrorMessage(error?.message || 'Could not delete the paper.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="admin-page">
      <Header />
      <main id="main-content" className="admin-page__main">
        <input
          ref={replaceInputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="visually-hidden"
          aria-hidden="true"
          tabIndex={-1}
          onChange={handleReplaceFile}
        />

        <button
          type="button"
          className="admin-back"
          onClick={() => navigate('/admin')}
        >
          <ChevronRightIcon
            width={16}
            height={16}
            style={{ transform: 'rotate(180deg)' }}
            aria-hidden="true"
          />
          Back to Dashboard
        </button>

        <div className="admin-top">
          <div>
            <h1 className="admin-top__title">Manage Papers</h1>
            <p className="admin-top__subtitle">
              {papers.length} record{papers.length === 1 ? '' : 's'} total
              {status === 'ready' ? ` · ${filteredPapers.length} shown` : ''}
            </p>
          </div>
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            onClick={() => navigate('/admin/papers/upload')}
          >
            Upload Paper
          </button>
        </div>

        <div className="admin-filters">
          <input
            type="search"
            className="admin-form__input"
            placeholder="Search title or subject…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search papers"
          />
          <select
            className="admin-form__select"
            value={subjectFilter}
            onChange={(event) => setSubjectFilter(event.target.value)}
            aria-label="Filter by subject"
          >
            <option value="all">All subjects</option>
            {SUBJECTS.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
          <select
            className="admin-form__select"
            value={yearFilter}
            onChange={(event) => setYearFilter(event.target.value)}
            aria-label="Filter by year"
          >
            <option value="all">All years</option>
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {notice ? (
          <p className="admin-alert admin-alert--success" role="status">
            {notice}
          </p>
        ) : null}

        {errorMessage ? (
          <p className="admin-alert admin-alert--error" role="alert">
            {errorMessage}
          </p>
        ) : null}

        {status === 'loading' ? (
          <p className="admin-empty">Loading papers…</p>
        ) : null}

        {status === 'error' ? (
          <p className="admin-empty admin-empty--error" role="alert">
            {errorMessage || 'Papers could not be loaded.'}
          </p>
        ) : null}

        {status === 'ready' && filteredPapers.length === 0 ? (
          <p className="admin-empty">No papers match these filters.</p>
        ) : null}

        {status === 'ready' && filteredPapers.length > 0 ? (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Paper</th>
                  <th>Subject</th>
                  <th>Year</th>
                  <th>Term</th>
                  <th>Paper No.</th>
                  <th>Question Paper</th>
                  <th>Memo</th>
                  <th>Uploaded</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPapers.map((paper) => (
                  <PaperRow
                    key={paper.id}
                    paper={paper}
                    isEditing={editingId === paper.id}
                    editForm={editForm}
                    setEditForm={setEditForm}
                    busy={busyId === paper.id}
                    onOpenFile={openFile}
                    onReplace={startReplace}
                    onStartEdit={startEdit}
                    onSaveEdit={saveEdit}
                    onCancelEdit={() => setEditingId(null)}
                    onDelete={handleDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </main>
      <Footer />
    </div>
  )
}

function PaperRow({
  paper,
  isEditing,
  editForm,
  setEditForm,
  busy,
  onOpenFile,
  onReplace,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
}) {
  if (isEditing) {
    return (
      <tr className="admin-edit-row">
        <td colSpan={9}>
          <form
            className="admin-edit-form"
            onSubmit={(event) => {
              event.preventDefault()
              onSaveEdit(paper.id)
            }}
          >
            <div className="admin-form__field" style={{ flex: '2 1 12rem' }}>
              <label className="admin-form__label" htmlFor={`edit-title-${paper.id}`}>
                Title
              </label>
              <input
                id={`edit-title-${paper.id}`}
                className="admin-form__input"
                value={editForm.title}
                onChange={(event) =>
                  setEditForm((current) => ({ ...current, title: event.target.value }))
                }
                required
              />
            </div>
            <div className="admin-form__field">
              <label className="admin-form__label" htmlFor={`edit-term-${paper.id}`}>
                Term
              </label>
              <input
                id={`edit-term-${paper.id}`}
                className="admin-form__input"
                value={editForm.term}
                onChange={(event) =>
                  setEditForm((current) => ({ ...current, term: event.target.value }))
                }
              />
            </div>
            <div className="admin-form__field">
              <label className="admin-form__label" htmlFor={`edit-paper-${paper.id}`}>
                Paper No.
              </label>
              <input
                id={`edit-paper-${paper.id}`}
                className="admin-form__input"
                value={editForm.paperNumber}
                onChange={(event) =>
                  setEditForm((current) => ({ ...current, paperNumber: event.target.value }))
                }
              />
            </div>
            <button type="submit" className="admin-btn admin-btn--primary" disabled={busy}>
              {busy ? 'Saving…' : 'Save'}
            </button>
            <button type="button" className="admin-btn" onClick={onCancelEdit} disabled={busy}>
              Cancel
            </button>
          </form>
        </td>
      </tr>
    )
  }

  return (
    <tr>
      <td className="admin-table__title" title={paper.title}>
        {paper.title}
      </td>
      <td>{getSubjectName(paper.subjectId)}</td>
      <td>{paper.year}</td>
      <td>{paper.term || '—'}</td>
      <td>{paper.paperNumber || '—'}</td>
      <td>
        <AvailabilityBadge url={paper.paperUrl} />
      </td>
      <td>
        <AvailabilityBadge url={paper.memoUrl} />
      </td>
      <td>{formatDate(paper.createdAt)}</td>
      <td>
        <div className="admin-row-actions">
          <button
            type="button"
            className="admin-btn"
            disabled={!paper.paperUrl || busy}
            onClick={() => onOpenFile(paper.paperUrl)}
          >
            View paper
          </button>
          <button
            type="button"
            className="admin-btn"
            disabled={!paper.paperUrl || busy}
            onClick={() => onReplace(paper, 'paper')}
          >
            Replace paper
          </button>
          <button
            type="button"
            className="admin-btn"
            disabled={!paper.memoUrl || busy}
            onClick={() => onOpenFile(paper.memoUrl)}
          >
            View memo
          </button>
          <button
            type="button"
            className="admin-btn"
            disabled={!paper.memoUrl || busy}
            onClick={() => onReplace(paper, 'memo')}
          >
            Replace memo
          </button>
          <button type="button" className="admin-btn" disabled={busy} onClick={() => onStartEdit(paper)}>
            Edit
          </button>
          <button
            type="button"
            className="admin-btn admin-btn--danger"
            disabled={busy}
            onClick={() => onDelete(paper)}
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  )
}
