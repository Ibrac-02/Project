import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Footer from '../../components/Footer/Footer'
import Header from '../../components/Header/Header'
import { ChevronRightIcon } from '../../components/icons/Icons'
import {
  fetchAllMotivationPhrases,
  createMotivationPhrase,
  updateMotivationPhrase,
  deleteMotivationPhrase,
} from './adminMotivation'
import './Admin.css'

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function ManageMotivation() {
  const navigate = useNavigate()
  const [phrases, setPhrases] = useState([])
  const [status, setStatus] = useState('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [notice, setNotice] = useState('')

  const [editingId, setEditingId] = useState(null) // 'new' or phrase.id
  const [busyId, setBusyId] = useState(null)

  useEffect(() => {
    let cancelled = false

    fetchAllMotivationPhrases()
      .then((rows) => {
        if (cancelled) return
        setPhrases(rows)
        setStatus('ready')
      })
      .catch((error) => {
        if (cancelled) return
        setErrorMessage(error?.message || 'Motivation phrases could not be loaded.')
        setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [])

  async function refresh() {
    const rows = await fetchAllMotivationPhrases()
    setPhrases(rows)
  }

  async function handleAdd(formData) {
    setBusyId('new')
    setNotice('')
    setErrorMessage('')
    try {
      await createMotivationPhrase(formData)
      await refresh()
      setEditingId(null)
      setNotice('Phrase added successfully.')
    } catch (error) {
      setErrorMessage(error?.message || 'Could not add the phrase.')
    } finally {
      setBusyId(null)
    }
  }

  async function handleUpdate(id, formData) {
    setBusyId(id)
    setNotice('')
    setErrorMessage('')
    try {
      await updateMotivationPhrase(id, formData)
      await refresh()
      setEditingId(null)
      setNotice('Phrase updated successfully.')
    } catch (error) {
      setErrorMessage(error?.message || 'Could not save changes.')
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete(phrase) {
    const confirmed = window.confirm(`Delete "${phrase.phrase}"? This cannot be undone.`)
    if (!confirmed) return

    setBusyId(phrase.id)
    setNotice('')
    setErrorMessage('')
    try {
      await deleteMotivationPhrase(phrase.id)
      setPhrases((current) => current.filter((row) => row.id !== phrase.id))
      setNotice('Phrase deleted successfully.')
    } catch (error) {
      setErrorMessage(error?.message || 'Could not delete the phrase.')
    } finally {
      setBusyId(null)
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

        <div className="admin-top">
          <div>
            <h1 className="admin-top__title">Manage Motivation</h1>
            <p className="admin-top__subtitle">
              {phrases.length} phrase{phrases.length === 1 ? '' : 's'} total · one is
              shown to students each day
            </p>
          </div>
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            onClick={() => setEditingId('new')}
          >
            Add Phrase
          </button>
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
          <p className="admin-empty">Loading phrases…</p>
        ) : null}

        {status === 'error' ? (
          <p className="admin-empty admin-empty--error" role="alert">
            {errorMessage || 'Phrases could not be loaded.'}
          </p>
        ) : null}

        {editingId === 'new' ? (
          <PhraseForm
            initialPhrase=""
            initialActive={true}
            submitLabel="Add"
            showActiveToggle={false}
            onSubmit={handleAdd}
            onCancel={() => setEditingId(null)}
            busy={busyId === 'new'}
          />
        ) : null}

        {status === 'ready' && phrases.length === 0 && editingId !== 'new' ? (
          <p className="admin-empty">No motivation phrases yet. Add one to get started.</p>
        ) : null}

        {status === 'ready' && phrases.length > 0 ? (
          <ul className="admin-recent" style={{ marginTop: '1.5rem' }}>
            {phrases.map((phrase) => (
              <li key={phrase.id} className="admin-recent__item">
                {editingId === phrase.id ? (
                  <PhraseForm
                    initialPhrase={phrase.phrase}
                    initialActive={phrase.is_active}
                    submitLabel="Save"
                    showActiveToggle
                    onSubmit={(data) => handleUpdate(phrase.id, data)}
                    onCancel={() => setEditingId(null)}
                    busy={busyId === phrase.id}
                  />
                ) : (
                  <>
                    <span className="admin-recent__title">{phrase.phrase}</span>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        flexWrap: 'wrap',
                      }}
                    >
                      <span className="admin-recent__meta">
                        Updated {formatDate(phrase.updated_at || phrase.created_at)}
                      </span>
                      <span
                        className={`admin-badge ${
                          phrase.is_active ? 'admin-badge--published' : 'admin-badge--draft'
                        }`}
                      >
                        {phrase.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <div className="admin-row-actions" style={{ gap: '0.25rem' }}>
                        <button
                          type="button"
                          className="admin-btn"
                          style={{ padding: '0.375rem 0.625rem', fontSize: '0.75rem' }}
                          disabled={busyId === phrase.id}
                          onClick={() => setEditingId(phrase.id)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="admin-btn admin-btn--danger"
                          style={{ padding: '0.375rem 0.625rem', fontSize: '0.75rem' }}
                          disabled={busyId === phrase.id}
                          onClick={() => handleDelete(phrase)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        ) : null}
      </main>
      <Footer />
    </div>
  )
}

function PhraseForm({
  initialPhrase,
  initialActive,
  submitLabel,
  showActiveToggle,
  onSubmit,
  onCancel,
  busy,
}) {
  const [phrase, setPhrase] = useState(initialPhrase)
  const [isActive, setIsActive] = useState(initialActive)

  async function handleSubmit(event) {
    event.preventDefault()
    if (!phrase.trim()) return
    await onSubmit({ phrase: phrase.trim(), isActive })
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        alignItems: 'end',
        padding: '0.75rem',
        background: '#f8fafc',
        borderRadius: '0.75rem',
        width: '100%',
      }}
    >
      <div className="admin-form__field" style={{ flex: '2 1 16rem' }}>
        <label className="admin-form__label" htmlFor={`phrase-${submitLabel}`}>
          Phrase
        </label>
        <input
          id={`phrase-${submitLabel}`}
          className="admin-form__input"
          value={phrase}
          onChange={(event) => setPhrase(event.target.value)}
          placeholder="Enter motivational phrase..."
          required
        />
      </div>
      {showActiveToggle ? (
        <label className="admin-form__check" style={{ flex: '0 0 auto', minWidth: 'auto' }}>
          <input
            type="checkbox"
            checked={isActive}
            onChange={(event) => setIsActive(event.target.checked)}
          />
          Active
        </label>
      ) : null}
      <button type="submit" className="admin-btn admin-btn--primary" disabled={busy}>
        {busy ? 'Saving…' : submitLabel}
      </button>
      <button type="button" className="admin-btn" onClick={onCancel} disabled={busy}>
        Cancel
      </button>
    </form>
  )
}
