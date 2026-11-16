import { useRef, useState } from 'react'
import Footer from '../../components/Footer/Footer'
import Header from '../../components/Header/Header'
import { ChevronRightIcon } from '../../components/icons/Icons'
import { useNavigation } from '../../context/useNavigation'
import { SUBJECTS } from '../../data/dashboardData'
import {
  buildPaperTitle,
  makeStoragePath,
  savePaperDocument,
  uploadPdfToStorage,
} from './adminPapers'
import { getSubjectName } from '../Papers/subjectMeta'
import './Admin.css'

const YEARS = Array.from({ length: 10 }, (_, index) => 2026 - index)
const TERMS = ['Term 1', 'Term 2', 'Term 3']
const PAPER_NUMBERS = ['Paper 1', 'Paper 2', 'Paper 3']
const DOC_TYPES = [
  { id: 'paper', label: 'Question Paper' },
  { id: 'memo', label: 'Memorandum' },
]

const emptyForm = {
  subjectId: '',
  year: '',
  term: '',
  paperNumber: '',
  docType: 'paper',
  file: null,
  isPublished: true,
}

export default function UploadPaper() {
  const { navigate } = useNavigation()
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

    const { subjectId, year, term, paperNumber, docType, file, isPublished } = form

    if (!subjectId || !year || !term || !paperNumber) {
      setErrorMessage('Choose a subject, year, term and paper number.')
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
      const subjectName = getSubjectName(subjectId)
      const title = buildPaperTitle({ subjectName, year, term, paperNumber })

      const storagePath = makeStoragePath({
        subjectId,
        year,
        docType,
        fileName: file.name,
      })
      const publicUrl = await uploadPdfToStorage(file, storagePath)

      const result = await savePaperDocument({
        subjectId,
        year: Number(year),
        term,
        paperNumber,
        title,
        docType,
        url: publicUrl,
        isPublished,
      })

      const docLabel = docType === 'paper' ? 'question paper' : 'memorandum'
      const docTitle = docType === 'paper' ? 'Question paper' : 'Memorandum'
      setSuccessMessage(
        result.created
          ? `${title} created with its ${docLabel}.`
          : `${docTitle} added to the existing ${title} record.`,
      )

      setForm({ ...emptyForm, docType, isPublished })
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
          onClick={() => navigate('admin')}
        >
          <ChevronRightIcon
            width={16}
            height={16}
            style={{ transform: 'rotate(180deg)' }}
            aria-hidden="true"
          />
          Back to Dashboard
        </button>

        <h1 className="admin-top__title">Upload Past Paper</h1>
        <p className="admin-top__subtitle">
          Upload a question paper or memorandum PDF. If a record already exists for
          the same subject, year, term and paper number, the file is added to it
          without replacing the other document.
        </p>

        <form className="admin-form" onSubmit={handleSubmit} style={{ marginTop: '1.25rem' }}>
          <div className="admin-form__row">
            <div className="admin-form__field">
              <label className="admin-form__label" htmlFor="up-subject">
                Subject
              </label>
              <select
                id="up-subject"
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
              <label className="admin-form__label" htmlFor="up-year">
                Year
              </label>
              <select
                id="up-year"
                className="admin-form__select"
                value={form.year}
                onChange={(event) => updateField('year', event.target.value)}
                required
              >
                <option value="">Select year</option>
                {YEARS.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-form__field">
              <label className="admin-form__label" htmlFor="up-term">
                Term
              </label>
              <select
                id="up-term"
                className="admin-form__select"
                value={form.term}
                onChange={(event) => updateField('term', event.target.value)}
                required
              >
                <option value="">Select term</option>
                {TERMS.map((term) => (
                  <option key={term} value={term}>
                    {term}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-form__field">
              <label className="admin-form__label" htmlFor="up-paper-number">
                Paper Number
              </label>
              <select
                id="up-paper-number"
                className="admin-form__select"
                value={form.paperNumber}
                onChange={(event) => updateField('paperNumber', event.target.value)}
                required
              >
                <option value="">Select paper</option>
                {PAPER_NUMBERS.map((paperNumber) => (
                  <option key={paperNumber} value={paperNumber}>
                    {paperNumber}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="admin-form__field">
            <span className="admin-form__label" id="up-doctype-label">
              Document Type
            </span>
            <div
              role="radiogroup"
              aria-labelledby="up-doctype-label"
              style={{ display: 'flex', gap: '1rem', marginTop: '0.375rem' }}
            >
              {DOC_TYPES.map((docType) => (
                <label key={docType.id} className="admin-form__check">
                  <input
                    type="radio"
                    name="docType"
                    value={docType.id}
                    checked={form.docType === docType.id}
                    onChange={() => updateField('docType', docType.id)}
                  />
                  {docType.label}
                </label>
              ))}
            </div>
          </div>

          <div className="admin-form__field">
            <label className="admin-form__label" htmlFor="up-file">
              PDF File
            </label>
            <input
              id="up-file"
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
              checked={form.isPublished}
              onChange={(event) => updateField('isPublished', event.target.checked)}
            />
            Publish this paper (visible to students)
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
              onClick={() => navigate('admin')}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="admin-btn admin-btn--primary"
              disabled={loading}
            >
              {loading ? 'Uploading…' : 'Upload Paper'}
            </button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  )
}
