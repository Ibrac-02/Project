import { useEffect, useState } from 'react'
import { listProjects, createProject, deleteProject, type Project } from '@/lib/projects'
import { useAuth } from '@/contexts/AuthContext'
import supabase from '@/config/supabaseClient'

export default function Projects() {
  const { isAdmin, user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    stack: '',
    image_url: '',
    demo_url: '',
    github_url: '',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const data = await listProjects()
        setProjects(data)
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load projects')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <section className="surface" style={{ display:'grid', gap: 16 }}>
      <div>
        <h1 style={{ margin: 0 }}>Portfolio</h1>
        <p style={{ color: 'var(--sb-text-dim)', marginTop: 4 }}>This is where I show who I am and what I’ve built.</p>
      </div>

      {/* About/Skills removed to avoid hardcoded content. If needed, we can load from a table later. */}

      {error && <div className="list-item" style={{ borderColor: '#b91c1c', color: '#fecaca' }}>{error}</div>}

      {isAdmin && (
        <form
          className="surface"
          style={{ display:'grid', gap: 12 }}
          onSubmit={async (e) => {
            e.preventDefault()
            if (!form.title.trim()) { setError('Title is required'); return }
            try {
              setSaving(true)
              let finalImageUrl = form.image_url.trim() || undefined
              if (imageFile && user?.id) {
                const ext = imageFile.name.split('.').pop()?.toLowerCase() || 'png'
                const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
                const { error: upErr } = await supabase.storage.from('project-images').upload(fileName, imageFile, { cacheControl: '3600', upsert: true })
                if (upErr) throw new Error(upErr.message)
                const { data: pub } = supabase.storage.from('project-images').getPublicUrl(fileName)
                finalImageUrl = pub.publicUrl
              }
              await createProject({
                title: form.title.trim(),
                description: form.description.trim() || undefined,
                stack: form.stack.trim() || undefined,
                image_url: finalImageUrl,
                demo_url: form.demo_url.trim() || undefined,
                github_url: form.github_url.trim() || undefined,
              })
              setForm({ title: '', description: '', stack: '', image_url: '', demo_url: '', github_url: '' })
              setImageFile(null)
              const data = await listProjects()
              setProjects(data)
              setError(null)
            } catch (e: unknown) {
              setError(e instanceof Error ? e.message : 'Failed to create project')
            } finally {
              setSaving(false)
            }
          }}
        >
          <div style={{ display:'grid', gap: 8, gridTemplateColumns: '1fr 1fr' }}>
            <div>
              <label className="sb-label" htmlFor="prj_title">Project Title</label>
              <input id="prj_title" className="sb-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Land Access Marketplace" />
            </div>
            <div>
              <label className="sb-label" htmlFor="prj_stack">Built With (stack)</label>
              <input id="prj_stack" className="sb-input" value={form.stack} onChange={e => setForm({ ...form, stack: e.target.value })} placeholder="Laravel, React, Postgres" />
            </div>
          </div>
          <div>
            <label className="sb-label" htmlFor="prj_desc">Short Description</label>
            <textarea id="prj_desc" className="sb-input" style={{ minHeight: 80 }} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="What it does, problem solved, etc." />
          </div>
          <div style={{ display:'grid', gap: 8, gridTemplateColumns: '1fr 1fr 1fr' }}>
            <div>
              <label className="sb-label" htmlFor="prj_img">Image URL</label>
              <input id="prj_img" className="sb-input" value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} placeholder="https://.../screenshot.png" />
              <div style={{ marginTop: 8 }}>
                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
                <div className="muted" style={{ fontSize: 12 }}>You can either paste an image URL above or choose a file to upload.</div>
              </div>
            </div>
            <div>
              <label className="sb-label" htmlFor="prj_demo">Live Demo URL</label>
              <input id="prj_demo" className="sb-input" value={form.demo_url} onChange={e => setForm({ ...form, demo_url: e.target.value })} placeholder="https://demo.example.com" />
            </div>
            <div>
              <label className="sb-label" htmlFor="prj_code">GitHub URL</label>
              <input id="prj_code" className="sb-input" value={form.github_url} onChange={e => setForm({ ...form, github_url: e.target.value })} placeholder="https://github.com/user/repo" />
            </div>
          </div>
          <div style={{ display:'flex', justifyContent:'flex-end', gap: 8 }}>
            <button className="sb-btn sb-btn-primary" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Add Project'}</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="list"><div className="list-item">Loading projects…</div></div>
      ) : projects.length === 0 ? (
        <div className="list"><div className="list-item" style={{ color: 'var(--sb-text-dim)' }}>No projects yet.</div></div>
      ) : (
        <div className="sb-row" style={{ flexWrap:'wrap' }}>
          {projects.map((p) => (
            <article key={p.id} className="surface" style={{ minWidth: 280, flex: '1 1 320px', display:'grid', gap: 8 }}>
              {p.image_url && (
                <div style={{ margin: '-16px -16px 12px', overflow: 'hidden', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
                  <img src={p.image_url} alt={p.title} style={{ width: '100%', height: 'auto', display: 'block' }} />
                </div>
              )}
              <h3 style={{ marginTop: 0 }}>{p.title}</h3>
              {p.description && <p className="muted">{p.description}</p>}
              {p.stack && (
                <div style={{ display:'flex', gap: 6, flexWrap:'wrap', margin: '8px 0 12px' }}>
                  {p.stack.split(',').map(s => (
                    <span key={s.trim()} style={{ border:'1px solid var(--sb-border)', borderRadius: 999, padding:'4px 8px', fontSize: 12, color:'var(--sb-text-dim)' }}>{s.trim()}</span>
                  ))}
                </div>
              )}
              <div style={{ display:'flex', gap: 8, alignItems:'center' }}>
                {p.demo_url && <a className="sb-btn" href={p.demo_url} target="_blank" rel="noreferrer">View Project</a>}
                {p.github_url && <a className="sb-btn" href={p.github_url} target="_blank" rel="noreferrer">View Code</a>}
                {isAdmin && (
                  <button className="sb-btn" onClick={async () => {
                    if (!confirm('Delete this project?')) return
                    try {
                      await deleteProject(p.id)
                      setProjects(prev => prev.filter(x => x.id !== p.id))
                    } catch (e: unknown) {
                      setError(e instanceof Error ? e.message : 'Failed to delete project')
                    }
                  }}>Delete</button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
