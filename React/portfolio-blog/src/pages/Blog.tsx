import { useEffect, useState } from 'react'
import { createPost, deletePost, listPosts, type Post } from '@/lib/posts'
import { useAuth } from '@/contexts/AuthContext'

export default function Blog() {
  const { user, isAdmin } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const canDelete = (p: Post) => isAdmin || (!!user && p.author_id === user.id)

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const data = await listPosts()
      setPosts(data)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load posts'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPosts() }, [])

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return
    try {
      await createPost(title.trim(), content.trim())
      setTitle('')
      setContent('')
      fetchPosts()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to create post'
      setError(msg)
    }
  }

  const onDelete = async (id: string) => {
    if (!confirm('Delete this post?')) return
    try {
      await deletePost(id)
      setPosts(prev => prev.filter(p => p.id !== id))
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to delete post'
      setError(msg)
    }
  }

  const MAX_CHARS = 220
  const isLong = (text: string) => text.length > MAX_CHARS
  const getPreview = (text: string) => text.slice(0, MAX_CHARS).trimEnd() + '…'
  const toggleExpand = (id: string) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }))

  return (
    <section className="sb-card" style={{ display: 'grid', gap: 16 }}>
      <div>
        <h1 style={{ margin: 0 }}>Blog</h1>
        <p style={{ color: 'var(--sb-text-dim)', marginTop: 4 }}>Posts from you and guests. Log in to publish.</p>
      </div>

      {error && <div className="sb-card" style={{ borderColor: '#b91c1c', color: '#fecaca' }}>{error}</div>}

      {user && (
        <form onSubmit={onCreate} className="sb-card" style={{ display: 'grid', gap: 8 }}>
          <div>
            <label className="sb-label" htmlFor="title">Title</label>
            <input id="title" className="sb-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Post title" />
          </div>
          <div>
            <label className="sb-label" htmlFor="content">Content</label>
            <textarea id="content" className="sb-input" style={{ minHeight: 120 }} value={content} onChange={e => setContent(e.target.value)} placeholder="Write something..." />
          </div>
          <div style={{ display:'flex', justifyContent:'flex-end' }}>
            <button className="sb-btn sb-btn-primary" type="submit">Publish</button>
          </div>
        </form>
      )}

      <div className="sb-card" style={{ display: 'grid', gap: 12 }}>
        {loading ? (
          <div>Loading posts...</div>
        ) : posts.length === 0 ? (
          <div style={{ color: 'var(--sb-text-dim)' }}>No posts yet.</div>
        ) : (
          posts.map(p => {
            const expandedOn = !!expanded[p.id]
            const showToggle = isLong(p.content)
            const body = expandedOn || !showToggle ? p.content : getPreview(p.content)
            return (
              <article key={p.id} className="sb-post">
                <div style={{ display:'flex', alignItems:'center', gap: 8 }}>
                  <div className="sb-post-title">{p.title}</div>
                  <span className="dot-leader" />
                  {canDelete(p) && (
                    <div className="sb-post-actions">
                      <button className="sb-btn" onClick={() => onDelete(p.id)}>Delete</button>
                    </div>
                  )}
                </div>
                <div className="sb-post-meta">
                  by {p.author_email ?? 'Guest'} · {new Date(p.created_at).toLocaleString()}
                </div>
                <p style={{ marginTop: 4, whiteSpace: 'pre-wrap' }}>{body}</p>
                {showToggle && (
                  <button className="sb-btn" onClick={() => toggleExpand(p.id)}>
                    {expandedOn ? 'Show less' : 'Read more'}
                  </button>
                )}
              </article>
            )
          })
        )}
      </div>
    </section>
  )
}
