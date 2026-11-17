import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Footer from '../../components/Footer/Footer'
import Header from '../../components/Header/Header'
import { ChevronRightIcon } from '../../components/icons/Icons'
import { SUBJECTS } from '../../data/dashboardData'
import { createNote, makeNoteStoragePath, uploadNotePdf } from './adminNotes'
import './Admin.css'

const emptyForm = {
  subjectId: '',
  title: '',
  description: '',
  file: null,
  published: false,
}

export default function UploadNote() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [form, setForm] = useState(emptyForm)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [loading, setLoading] = useState(false)

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    const { subjectId, title, description, file, published } = form

    if (!subjectId || !title.trim()) {
      setErrorMessage('Choose a subject and enter a note title.')
      return
    }

    if (!file) {
      setErrorMessage('Choose a PDF file to upload.')
      return
    }

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage('Only PDF files are allowed.')
      return
    }

    setLoading(true)
    try {
      const storagePath = makeNoteStoragePath({ subjectId, fileName: file.name })
      const publicUrl = await uploadNotePdf(file, storagePath)

      await createNote({
        subjectId,
        title: title.trim(),
        description: description.trim(),
        fileUrl: publicUrl,
        published,
      })

      setSuccessMessage(
        published
          ? `"${title.trim()}" uploaded and published.`
          : `"${title.trim()}" uploaded as a draft.`,
      )

      setForm({ ...emptyForm })
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      setErrorMessage(error?.message || 'Upload failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-page">
      <Header />
      <main id="main-content" className="admin-page__main">
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

        <h1 className="admin-top__title">Upload Note</h1>
        <p className="admin-top__subtitle">
          Upload a note PDF and assign it to a subject. Publish it when it is ready for students.
        </p>

        <form className="admin-form" onSubmit={handleSubmit} style={{ marginTop: '1.25rem' }}>
          <div className="admin-form__row">
            <div className="admin-form__field">
              <label className="admin-form__label" htmlFor="note-subject">
                Subject
              </label>
              <select
                id="note-subject"
                className="admin-form__select"
                value={form.subjectId}
                onChange={(event) => updateField('subjectId', event.target.value)}
                required
              >
                <option value="">Select subject</option>
                {SUBJECTS.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-form__field">
              <label className="admin-form__label" htmlFor="note-title">
                Topic / Title
              </label>
              <input
                id="note-title"
                type="text"
                className="admin-form__input"
                value={form.title}
                onChange={(event) => updateField('title', event.target.value)}
                placeholder="e.g. Algebra – Summary Notes"
                required
              />
            </div>
          </div>

          <div className="admin-form__field">
            <label className="admin-form__label" htmlFor="note-description">
              Description / Summary
            </label>
            <textarea
              id="note-description"
              className="admin-form__textarea"
              rows={4}
              value={form.description}
              onChange={(event) => updateField('description', event.target.value)}
              placeholder="Short summary of what this note covers."
            />
          </div>

          <div className="admin-form__field">
            <label className="admin-form__label" htmlFor="note-file">
              PDF File
            </label>
            <input
              id="note-file"
              ref={fileInputRef}
              type="file"
              className="admin-form__file"
              accept="application/pdf,.pdf"
              onChange={(event) => updateField('file', event.target.files?.[0] ?? null)}
              required
            />
          </div>

          <label className="admin-form__check">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(event) => updateField('published', event.target.checked)}
            />
            Publish this note now (visible to students)
          </label>

          {errorMessage ? (
            <p className="admin-alert admin-alert--error" role="alert">
              {errorMessage}
            </p>
          ) : null}

          {successMessage ? (
            <p className="admin-alert admin-alert--success" role="status">
              {successMessage}
            </p>
          ) : null}

          <div className="admin-form__actions">
            <button
              type="button"
              className="admin-btn"
              onClick={() => navigate('/admin/notes')}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="admin-btn admin-btn--primary"
              disabled={loading}
            >
              {loading ? 'Uploading…' : 'Upload Note'}
            </button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  )
}
