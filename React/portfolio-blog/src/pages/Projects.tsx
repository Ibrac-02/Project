import { useEffect, useState } from 'react'
import { listProjects, type Project } from '@/lib/projects'

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
    <section className="sb-card" style={{ display:'grid', gap: 16 }}>
      <div>
        <h1 style={{ margin: 0 }}>Projects</h1>
        <p style={{ color: 'var(--sb-text-dim)', marginTop: 4 }}>A selection of React, Laravel, and school-related projects.</p>
      </div>
      {error && <div className="sb-card" style={{ borderColor: '#b91c1c', color: '#fecaca' }}>{error}</div>}
      {loading ? (
        <div>Loading…</div>
      ) : (
        <div className="sb-row" style={{ flexWrap:'wrap' }}>
          {projects.map((p) => (
            <div key={p.id} className="sb-card" style={{ minWidth: 280, flex: '1 1 320px' }}>
              {p.image_url && (
                <div style={{ margin: '-16px -16px 12px', overflow: 'hidden', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
                  <img src={p.image_url} alt={p.title} style={{ width: '100%', height: 'auto', display: 'block' }} />
                </div>
              )}
              <h3 style={{ marginTop: 0 }}>{p.title}</h3>
              {p.description && <p style={{ color: 'var(--sb-text-dim)' }}>{p.description}</p>}
              {p.stack && (
                <div style={{ display:'flex', gap: 6, flexWrap:'wrap', margin: '8px 0 12px' }}>
                  {p.stack.split(',').map(s => (
                    <span key={s.trim()} style={{ border:'1px solid var(--sb-border)', borderRadius: 999, padding:'4px 8px', fontSize: 12, color:'var(--sb-text-dim)' }}>{s.trim()}</span>
                  ))}
                </div>
              )}
              <div style={{ display:'flex', gap: 8 }}>
                {p.demo_url && <a className="sb-btn" href={p.demo_url} target="_blank" rel="noreferrer">Demo</a>}
                {p.github_url && <a className="sb-btn" href={p.github_url} target="_blank" rel="noreferrer">GitHub</a>}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
