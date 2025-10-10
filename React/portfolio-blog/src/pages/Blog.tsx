import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { createPost, deletePost, listPosts, type Post } from '@/lib/posts'
import { useAuth } from '@/contexts/AuthContext'
import ConfirmModal from '@/components/ConfirmModal'

export default function Blog() {
  const { user, isAdmin } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

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

  const onRequestDelete = (id: string) => { setPendingDeleteId(id); setConfirmOpen(true) }
  const onConfirmDelete = async () => {
    const id = pendingDeleteId
    if (!id) return
    try {
      await deletePost(id)
      setPosts(prev => prev.filter(p => p.id !== id))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to delete post')
    } finally {
      setConfirmOpen(false)
      setPendingDeleteId(null)
    }
  }

  function PostExcerpt({ post }: { post: Post }) {
    const [overflowing, setOverflowing] = useState(false)
    const pRef = useRef<HTMLParagraphElement | null>(null)

    useEffect(() => {
      const el = pRef.current
      if (!el) return
      const check = () => {
        // Compare scrollHeight vs clientHeight to detect clamp overflow
        setOverflowing(el.scrollHeight > el.clientHeight + 1)
      }
      // Run after layout
      const id = requestAnimationFrame(check)
      // Also re-check on window resize
      window.addEventListener('resize', check)
      return () => {
        cancelAnimationFrame(id)
        window.removeEventListener('resize', check)
      }
    }, [post.id, post.content])

    // Fallback author label: name -> email -> Guest
    const authorLabel = post.author_profile?.name ?? post.author_email ?? 'Guest'

    return (
      <div className="list-item">
        <article className="sb-post">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link to={`/blog/${post.id}`} className="sb-post-title">{post.title}</Link>
            <span className="dot-leader" />
            {canDelete(post) && (
              <button className="sb-btn" onClick={() => onRequestDelete(post.id)}>Delete</button>
            )}
          </div>

          <div className="sb-post-meta">
            by {authorLabel} · {new Date(post.created_at).toLocaleString()}
          </div>

          <p
            ref={pRef}
            style={{
              whiteSpace: 'pre-wrap',
              marginTop: 8,
              display: '-webkit-box',
              WebkitLineClamp: 5,
              WebkitBoxOrient: 'vertical' as CSSProperties['WebkitBoxOrient'],
              overflow: 'hidden',
            }}
          >
            {post.content}
          </p>
          {overflowing && (
            <div>
              <Link
                to={`/blog/${post.id}`}
                className="sb-btn"
                style={{ padding: 0, background: 'transparent', color: '#2563eb', textDecoration: 'underline' }}
              >
                Read More →
              </Link>
            </div>
          )}
        </article>
      </div>
    )
  }
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
          posts.map(p => <PostExcerpt key={p.id} post={p} />)
        )}
      </div>
      <ConfirmModal
        open={confirmOpen}
        title="Delete post"
        message="Are you sure you want to delete this post? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="danger"
        onConfirm={onConfirmDelete}
        onCancel={() => { setConfirmOpen(false); setPendingDeleteId(null) }}
      />
    </section>
  )
}
 
