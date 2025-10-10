import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { listComments, createComment, deleteComment, type Comment } from '@/lib/comments'
import supabase from '@/config/supabaseClient'
import { useAuth } from '@/contexts/AuthContext'
import ConfirmModal from '@/components/ConfirmModal'
import { getInitials, stringToColor } from '@/lib/avatar'

export type FullPost = {
  id: string
  title: string
  content: string
  author_id: string | null
  author_email: string | null
  author_profile?: { id: string; name: string | null; email: string | null } | null
  created_at: string
}

export default function Post() {
  const { id } = useParams()
  const [post, setPost] = useState<FullPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!id) return
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('posts')
        .select('id, title, content, author_id, author_email, created_at, author_profile:profiles!posts_author_id_fkey(id, name, email)')
        .eq('id', id)
        .single()
      if (error) throw new Error(error.message)
      type ProfileRow = { id: string; name: string | null; email: string | null }
      type Row = Omit<FullPost, 'author_profile'> & { author_profile?: ProfileRow | ProfileRow[] | null }
      const row = data as Row
      setPost({
        ...row,
        author_profile: Array.isArray(row.author_profile) ? row.author_profile[0] : (row.author_profile ?? null),
      })
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load post')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { load() }, [load])

  return (
    <section className="surface" style={{ display: 'grid', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link to="/blog" className="sb-btn">← Back to Blog</Link>
        <h1 style={{ margin: 0 }}>Post</h1>
      </div>

      {error && <div className="list-item" style={{ borderColor: '#b91c1c', color: '#fecaca' }}>{error}</div>}

      {loading ? (
        <div className="list-item">Loading…</div>
      ) : !post ? (
        <div className="list-item" style={{ color: 'var(--sb-text-dim)' }}>Not found.</div>
      ) : (
        <article className="surface" style={{ display: 'grid', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="sb-post-title" style={{ fontSize: 22 }}>{post.title}</div>
            <span className="dot-leader" />
          </div>
          <div className="sb-post-meta">
            by {post.author_profile?.name ?? post.author_email ?? 'Guest'} · {new Date(post.created_at).toLocaleString()}
          </div>
          <div style={{ whiteSpace: 'pre-wrap' }}>{post.content}</div>

          <div style={{ marginTop: 16 }}>
            <PostComments postId={post.id} />
          </div>
        </article>
      )}
    </section>
  )
}

function PostComments({ postId }: { postId: string }) {
  const { user } = useAuth()
  const [items, setItems] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [text, setText] = useState('')
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  const canDelete = (c: Comment) => !!user && c.user_id === user.id

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const data = await listComments(postId)
      setItems(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load comments')
    } finally {
      setLoading(false)
    }
  }, [postId])

  useEffect(() => { load() }, [load])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const content = text.trim()
    if (!content) return
    try {
      await createComment(postId, content, user ? {} : { guest_name: guestName.trim() || 'Guest', guest_email: guestEmail.trim() || null })
      setText('')
      if (!user) { setGuestName(''); setGuestEmail('') }
      await load()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to add comment')
    }
  }

  const onRequestDelete = (id: string) => { setPendingDeleteId(id); setConfirmOpen(true) }
  const onConfirmDelete = async () => {
    const id = pendingDeleteId
    if (!id) return
    try {
      await deleteComment(id)
      setItems(prev => prev.filter(i => i.id !== id))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to delete comment')
    } finally {
      setConfirmOpen(false)
      setPendingDeleteId(null)
    }
  }
  const onCancelDelete = () => { setConfirmOpen(false); setPendingDeleteId(null) }

  return (
    <>
    <div className="surface" style={{ display: 'grid', gap: 12 }}>
      <div style={{ fontWeight: 600 }}>Comments</div>
      {error && <div className="list-item" style={{ borderColor: '#b91c1c', color: '#fecaca' }}>{error}</div>}
      {loading ? (
        <div className="list"><div className="list-item">Loading comments...</div></div>
      ) : items.length === 0 ? (
        <div className="list"><div className="list-item" style={{ color: 'var(--sb-text-dim)' }}>No comments yet. Be the first to comment!</div></div>
      ) : (
        <div className="list">
          {items.map(c => {
            const name = c.user_name ?? c.guest_name ?? 'Guest'
            const email = c.user_email ?? c.guest_email ?? null
            const initials = getInitials(name, email)
            const color = stringToColor(name || email || 'guest')
            return (
              <div key={c.id} className="list-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="mini-avatar" style={{ background: color }}>{initials}</div>
                  <div style={{ fontWeight: 600 }}>{name}</div>
                  <span className="dot-leader" />
                  <div className="muted" style={{ fontSize: 12 }}>{new Date(c.created_at).toLocaleString()}</div>
                  {canDelete(c) && (
                    <div style={{ marginLeft: 'auto' }}>
                      <button className="sb-btn" onClick={() => onRequestDelete(c.id)}>Delete</button>
                    </div>
                  )}
                </div>
                <div style={{ whiteSpace: 'pre-wrap', marginLeft: 38 }}>{c.content}</div>
              </div>
            )
          })}
        </div>
      )}

      <form onSubmit={onSubmit} className="surface" style={{ display: 'grid', gap: 8 }}>
        {!user && (
          <div style={{ display: 'grid', gap: 8, gridTemplateColumns: '1fr 1fr' }}>
            <div>
              <label className="sb-label" htmlFor={`guest_name_${postId}`}>Name</label>
              <input id={`guest_name_${postId}`} className="sb-input" value={guestName} onChange={e => setGuestName(e.target.value)} placeholder="Your name" />
            </div>
          </div>
        )}
        <div>
          <label className="sb-label" htmlFor={`comment_${postId}`}>Add a comment</label>
          <textarea id={`comment_${postId}`} className="sb-input" style={{ minHeight: 80 }} value={text} onChange={e => setText(e.target.value)} placeholder={user ? 'Write a comment…' : 'Write a comment as guest…'} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="sb-btn sb-btn-primary" type="submit">Post Comment</button>
        </div>
      </form>
    </div>
    <ConfirmModal
      open={confirmOpen}
      title="Delete comment"
      message="Are you sure you want to delete this comment? This action cannot be undone."
      confirmText="Delete"
      cancelText="Cancel"
      onConfirm={onConfirmDelete}
      onCancel={onCancelDelete}
    />
    </>
  )
}
