import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { createPost, deletePost, listPosts, type Post } from '@/lib/posts'
import { useAuth } from '@/contexts/AuthContext'

export default function Blog() {
  const { user, isAdmin } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState<string | null>(null)

  const canDelete = (p: Post) => isAdmin || (!!user && p.author_id === user.id)

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const data = await listPosts()
      setPosts(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load posts')
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
      setError(e instanceof Error ? e.message : 'Failed to create post')
    }
  }

  const onDelete = async (id: string) => {
    if (!confirm('Delete this post?')) return
    try {
      await deletePost(id)
      setPosts(prev => prev.filter(p => p.id !== id))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to delete post')
    }
  }

  const MAX_CHARS = 250
  const truncateText = (text: string) =>
    text.length > MAX_CHARS ? text.slice(0, MAX_CHARS).trimEnd() + '...' : text
  return (
    <section className="surface" style={{ display: 'grid', gap: 16 }}>
      <div>
        <h1 style={{ margin: 0 }}>Blog</h1>
        <p style={{ color: 'var(--sb-text-dim)', marginTop: 4 }}>Posts from you and guests. Log in to publish.</p>
      </div>

      {error && (
        <div className="list-item" style={{ borderColor: '#b91c1c', color: '#fecaca' }}>
          {error}
        </div>
      )}

      {isAdmin && (
        <form onSubmit={onCreate} className="surface" style={{ display: 'grid', gap: 8 }}>
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

      <div className="list">
        {loading ? (
          <div className="list-item">Loading posts...</div>
        ) : posts.length === 0 ? (
          <div className="list-item" style={{ color: 'var(--sb-text-dim)' }}>No posts yet.</div>
        ) : (
          posts.map(p => {
            const displayText = truncateText(p.content)

            return (
              <div key={p.id} className="list-item">
                <article className="sb-post">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Link to={`/blog/${p.id}`} className="sb-post-title">{p.title}</Link>
                    <span className="dot-leader" />
                    {canDelete(p) && (
                      <button className="sb-btn" onClick={() => onDelete(p.id)}>Delete</button>
                    )}
                  </div>

                  <div className="sb-post-meta">
                    by {p.author_profile?.name ?? p.author_email ?? 'Guest'} · {new Date(p.created_at).toLocaleString()}
                  </div>

                  <p style={{ whiteSpace: 'pre-wrap', marginTop: 8 }}>{displayText}</p>
                  <div>
                    <Link to={`/blog/${p.id}`} className="sb-btn" style={{ padding: 0, background: 'transparent', color: '#2563eb', textDecoration: 'underline' }}>Read More →</Link>
                  </div>
                </article>
              </div>
            )
          })
        )}
      </div>
    </section>
  )
}
 
