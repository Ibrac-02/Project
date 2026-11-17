import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Footer from '../../components/Footer/Footer'
import Header from '../../components/Header/Header'
import { ChevronRightIcon } from '../../components/icons/Icons'
import { SUBJECTS } from '../../data/dashboardData'
import {
  deleteNote,
  deleteNoteFile,
  fetchAllNotes,
  makeNoteStoragePath,
  updateNoteDetails,
  updateNoteFileUrl,
  uploadNotePdf,
} from './adminNotes'
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

function PublishedBadge({ published }) {
  return published ? (
    <span className="admin-badge admin-badge--published">Published</span>
  ) : (
    <span className="admin-badge admin-badge--draft">Draft</span>
  )
}

export default function ManageNotes() {
  const navigate = useNavigate()
  const replaceInputRef = useRef(null)
  const [notes, setNotes] = useState([])
  const [status, setStatus] = useState('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [notice, setNotice] = useState('')

  const [subjectFilter, setSubjectFilter] = useState('all')
  const [search, setSearch] = useState('')

  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({
    subjectId: '',
    title: '',
    description: '',
    published: false,
  })
  const [busyId, setBusyId] = useState(null)
  const [replaceTarget, setReplaceTarget] = useState(null) // note id

  useEffect(() => {
    let cancelled = false

    fetchAllNotes()
      .then((rows) => {
        if (cancelled) return
        setNotes(rows)
        setStatus('ready')
      })
      .catch((error) => {
        if (cancelled) return
        setErrorMessage(error?.message || 'Notes could not be loaded.')
        setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [])

  const filteredNotes = useMemo(() => {
    const term = search.trim().toLowerCase()
    return notes.filter((note) => {
      const matchesSubject = subjectFilter === 'all' || note.subjectId === subjectFilter
      const matchesSearch =
        term === '' ||
        note.title.toLowerCase().includes(term) ||
        note.description.toLowerCase().includes(term) ||
        getSubjectName(note.subjectId).toLowerCase().includes(term)
      return matchesSubject && matchesSearch
    })
  }, [notes, subjectFilter, search])

  function openFile(url) {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  function startReplace(noteId) {
    setReplaceTarget(noteId)
    if (replaceInputRef.current) {
      replaceInputRef.current.value = ''
      replaceInputRef.current.click()
    }
  }

  async function handleReplaceFile(event) {
    const file = event.target.files?.[0]
    const targetId = replaceTarget
    setReplaceTarget(null)
    if (!file || !targetId) return

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage('Only PDF files are allowed.')
      return
    }

    const note = notes.find((row) => row.id === targetId)
    if (!note) return

    setBusyId(targetId)
    setNotice('')
    setErrorMessage('')
    try {
      const storagePath = makeNoteStoragePath({
        subjectId: note.subjectId,
        fileName: file.name,
      })
      const publicUrl = await uploadNotePdf(file, storagePath)
      await updateNoteFileUrl(targetId, publicUrl)

      try {
        await deleteNoteFile(note.fileUrl)
      } catch {
        // Old file cleanup is best-effort; the new URL is already saved.
      }

      setNotes((current) =>
        current.map((row) =>
          row.id === targetId ? { ...row, fileUrl: publicUrl, hasFile: true } : row,
        ),
      )
      setNotice(`File replaced for "${note.title}".`)
    } catch (error) {
      setErrorMessage(error?.message || 'Could not replace the file.')
    } finally {
      setBusyId(null)
    }
  }

  function startEdit(note) {
    setEditingId(note.id)
    setEditForm({
      subjectId: note.subjectId,
      title: note.title,
      description: note.description,
      published: note.published,
    })
  }

  async function saveEdit(id) {
    if (!editForm.title.trim()) {
      setErrorMessage('Title cannot be empty.')
      return
    }
    setBusyId(id)
    setNotice('')
    setErrorMessage('')
    try {
      await updateNoteDetails(id, {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        subjectId: editForm.subjectId,
        published: editForm.published,
      })
      setNotes((current) =>
        current.map((row) =>
          row.id === id
            ? {
                ...row,
                title: editForm.title.trim(),
                description: editForm.description.trim(),
                subjectId: editForm.subjectId,
                published: editForm.published,
              }
            : row,
        ),
      )
      setEditingId(null)
      setNotice('Note updated.')
    } catch (error) {
      setErrorMessage(error?.message || 'Could not save changes.')
    } finally {
      setBusyId(null)
    }
  }

  async function togglePublished(note) {
    setBusyId(note.id)
    setNotice('')
    setErrorMessage('')
    try {
      await updateNoteDetails(note.id, {
        title: note.title,
        description: note.description,
        subjectId: note.subjectId,
        published: !note.published,
      })
      setNotes((current) =>
        current.map((row) =>
          row.id === note.id ? { ...row, published: !row.published } : row,
        ),
      )
      setNotice(note.published ? `"${note.title}" unpublished.` : `"${note.title}" published.`)
    } catch (error) {
      setErrorMessage(error?.message || 'Could not update the note.')
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete(note) {
    const confirmed = window.confirm(
      `Delete "${note.title}"? This also removes its PDF from storage. This cannot be undone.`,
    )
    if (!confirmed) return

    setBusyId(note.id)
    setNotice('')
    setErrorMessage('')
    try {
      await deleteNote(note.id, note.fileUrl)
      setNotes((current) => current.filter((row) => row.id !== note.id))
      setNotice(`"${note.title}" was deleted.`)
    } catch (error) {
      setErrorMessage(error?.message || 'Could not delete the note.')
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
            <h1 className="admin-top__title">Manage Notes</h1>
            <p className="admin-top__subtitle">
              {notes.length} note{notes.length === 1 ? '' : 's'} total
              {status === 'ready' ? ` · ${filteredNotes.length} shown` : ''}
            </p>
          </div>
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            onClick={() => navigate('/admin/notes/upload')}
          >
            Upload Note
          </button>
        </div>

        <div className="admin-filters">
          <input
            type="search"
            className="admin-form__input"
            placeholder="Search title, summary or subject…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search notes"
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
          <p className="admin-empty">Loading notes…</p>
        ) : null}

        {status === 'error' ? (
          <p className="admin-empty admin-empty--error" role="alert">
            {errorMessage || 'Notes could not be loaded.'}
          </p>
        ) : null}

        {status === 'ready' && filteredNotes.length === 0 ? (
          <p className="admin-empty">No notes match these filters.</p>
        ) : null}

        {status === 'ready' && filteredNotes.length > 0 ? (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>File</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredNotes.map((note) => (
                  <NoteRow
                    key={note.id}
                    note={note}
                    isEditing={editingId === note.id}
                    editForm={editForm}
                    setEditForm={setEditForm}
                    busy={busyId === note.id}
                    onOpenFile={openFile}
                    onReplace={startReplace}
                    onStartEdit={startEdit}
                    onSaveEdit={saveEdit}
                    onCancelEdit={() => setEditingId(null)}
                    onTogglePublished={togglePublished}
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

function NoteRow({
  note,
  isEditing,
  editForm,
  setEditForm,
  busy,
  onOpenFile,
  onReplace,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onTogglePublished,
  onDelete,
}) {
  if (isEditing) {
    return (
      <tr className="admin-edit-row">
        <td colSpan={6}>
          <form
            className="admin-edit-form"
            onSubmit={(event) => {
              event.preventDefault()
              onSaveEdit(note.id)
            }}
          >
            <div className="admin-form__field" style={{ flex: '2 1 12rem' }}>
              <label className="admin-form__label" htmlFor={`edit-title-${note.id}`}>
                Title
              </label>
              <input
                id={`edit-title-${note.id}`}
                className="admin-form__input"
                value={editForm.title}
                onChange={(event) =>
                  setEditForm((current) => ({ ...current, title: event.target.value }))
                }
                required
              />
            </div>
            <div className="admin-form__field">
              <label className="admin-form__label" htmlFor={`edit-subject-${note.id}`}>
                Subject
              </label>
              <select
                id={`edit-subject-${note.id}`}
                className="admin-form__select"
                value={editForm.subjectId}
                onChange={(event) =>
                  setEditForm((current) => ({ ...current, subjectId: event.target.value }))
                }
              >
                {SUBJECTS.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="admin-form__field" style={{ flex: '3 1 16rem' }}>
              <label className="admin-form__label" htmlFor={`edit-desc-${note.id}`}>
                Description
              </label>
              <input
                id={`edit-desc-${note.id}`}
                className="admin-form__input"
                value={editForm.description}
                onChange={(event) =>
                  setEditForm((current) => ({ ...current, description: event.target.value }))
                }
              />
            </div>
            <label className="admin-form__check">
              <input
                type="checkbox"
                checked={editForm.published}
                onChange={(event) =>
                  setEditForm((current) => ({ ...current, published: event.target.checked }))
                }
              />
              Published
            </label>
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
      <td className="admin-table__title" title={note.title}>
        {note.title}
      </td>
      <td>{getSubjectName(note.subjectId)}</td>
      <td>
        <PublishedBadge published={note.published} />
      </td>
      <td>
        {note.hasFile ? (
          <span className="admin-badge admin-badge--yes">Attached</span>
        ) : (
          <span className="admin-badge admin-badge--no">Missing</span>
        )}
      </td>
      <td>{formatDate(note.updatedAt)}</td>
      <td>
        <div className="admin-row-actions">
          <button
            type="button"
            className="admin-btn"
            disabled={!note.hasFile || busy}
            onClick={() => onOpenFile(note.fileUrl)}
          >
            View
          </button>
          <button
            type="button"
            className="admin-btn"
            disabled={busy}
            onClick={() => onReplace(note.id)}
          >
            Replace
          </button>
          <button type="button" className="admin-btn" disabled={busy} onClick={() => onStartEdit(note)}>
            Edit
          </button>
          <button
            type="button"
            className="admin-btn"
            disabled={busy}
            onClick={() => onTogglePublished(note)}
          >
            {note.published ? 'Unpublish' : 'Publish'}
          </button>
          <button
            type="button"
            className="admin-btn admin-btn--danger"
            disabled={busy}
            onClick={() => onDelete(note)}
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  )
}
