import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getSiteOwner, type SiteOwner } from '@/lib/site'

export default function Home() {
  const [owner, setOwner] = useState<SiteOwner | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const data = await getSiteOwner()
        setOwner(data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const title = owner?.name ? `Welcome to ${owner.name}'s Portfolio` : 'Welcome to My Portfolio'
  const subtitle = owner?.email ? `Explore projects and posts by ${owner.name ?? owner.email}.` : 'Explore my projects and blog posts, and feel free to reach out.'

  return (
    <section className="container hero">
      <h1 className="hero-title">{loading ? 'Loading…' : title}</h1>
      <p className="hero-subtitle">{subtitle}</p>
      <div className="grid hero-actions">
        <Link to="/projects" className="card">View Projects →</Link>
        <Link to="/blog" className="card">Read the Blog →</Link>
        <Link to="/contact" className="card">Contact Me →</Link>
      </div>
    </section>
  )
}
