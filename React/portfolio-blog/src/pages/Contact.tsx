export default function Contact() {
  return (
    <section className="sb-card" style={{ maxWidth: 720, margin: '0 auto', display:'grid', gap: 12 }}>
      <h1 style={{ marginTop: 0 }}>Contact</h1>
      <p style={{ color: 'var(--sb-text-dim)' }}>Reach out for collaborations, freelance work, or questions.</p>
      <ul style={{ lineHeight: 1.9, margin: 0 }}>
        <li>Email: <a className="sb-link" href={`mailto:${import.meta.env.VITE_ADMIN_EMAIL}`}>{import.meta.env.VITE_ADMIN_EMAIL}</a></li>
        <li>GitHub: <a className="sb-link" href="https://github.com/Ibrac-02" target="_blank" rel="noreferrer">Ibrac-02</a></li>
        <li>Contact No: <a className="sb-link" href="tel:+265 999 198 480/+265 894 984 764" target="_blank" rel="noreferrer">+265 999 198 480/+265 894 984 764</a></li>
      </ul>
    </section>
  )
}
