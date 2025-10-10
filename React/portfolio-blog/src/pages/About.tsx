import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getSiteOwner } from '@/lib/site'
 

export default function About() {
  const { isAdmin } = useAuth()
  const [ownerName, setOwnerName] = useState<string | null>(null)
  const [ownerEmail, setOwnerEmail] = useState<string | null>(null)
  const ENV_NAME = (import.meta.env.VITE_ADMIN_NAME as string | undefined) ?? 'Ibrac-02'
  const ENV_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL as string | undefined) ?? 'ibrahim@example.com'

  useEffect(() => {
    const load = async () => {
      try {
        const owner = await getSiteOwner()
        setOwnerName(owner?.name ?? null)
        setOwnerEmail(owner?.email ?? null)
      } catch {
        // ignore; fall back to env
      }
    }
    void load()
  }, [])

  const ADMIN_NAME = ownerName ?? ENV_NAME
  const ADMIN_EMAIL = ownerEmail ?? ENV_EMAIL

  const ABOUT_TEXT = `Hi, I'm Ibrahim Cassim — a passionate web developer who loves turning ideas into functional and beautiful digital products. I specialize in React.js and Laravel, creating clean, responsive, and user-friendly web applications.
I enjoy solving real-world problems with code, learning new technologies, and sharing my knowledge through blogs and projects. When I’m not coding, I’m usually exploring tech trends or working on personal projects to sharpen my skills.`

  const CONTACT = {
    github: 'github.com/Ibrac-02',
    instagram: 'instagram.com/qas_im2002',
    facebook: 'facebook.com/ibrac.ahmad',
    whatsapp: 'wa.me/+265 999 198 480 & +265 894 984 764',
  }


  return (
    <section className="sb-card" style={{ maxWidth: 720, margin: '0 auto', display: 'grid', gap: 12 }}>
      <div>
        <p className="muted" style={{ marginTop: 4 ,marginLeft: 10 }}>Profile information.</p>
      </div>

      <div className="surface" style={{ display: 'grid', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="mini-avatar" style={{ width: 56, height: 56, fontSize: 18 }}>
            {ADMIN_NAME.trim().split(/\s+/).map(p=>p[0]).slice(0,2).join('').toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>{ADMIN_NAME}</div>
            <div className="muted" style={{ fontSize: 14 }}>{ADMIN_EMAIL}</div>
          </div>
        </div>

        {/* Show biography to everyone */}
        <div>
          <div className="muted" style={{ marginBottom: 6 }}>Biography</div>
          <div className="sb-card" style={{ whiteSpace: 'pre-wrap' }}>{ABOUT_TEXT}</div>
        </div>

        {/* Admin-only contact details */}
        {isAdmin && (
          <div className="surface" style={{ display: 'grid', gap: 6 }}>
            <div style={{ fontWeight: 600 }}>Contact</div>
            <div>GitHub: <a className="sb-link" href={CONTACT.github} target="_blank" rel="noreferrer">{CONTACT.github}</a></div>
            <div>Instagram: <a className="sb-link" href={CONTACT.instagram} target="_blank" rel="noreferrer">{CONTACT.instagram}</a></div>
            <div>Facebook: <a className="sb-link" href={CONTACT.facebook} target="_blank" rel="noreferrer">{CONTACT.facebook}</a></div>
            <div>WhatsApp: <a className="sb-link" href={CONTACT.whatsapp} target="_blank" rel="noreferrer">{CONTACT.whatsapp}</a></div>
          </div>
        )}
      </div>
    </section>
  )
}
