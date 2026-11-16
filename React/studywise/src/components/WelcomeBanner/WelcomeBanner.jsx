import './WelcomeBanner.css'

export default function WelcomeBanner() {
  return (
    <section className="welcome-banner" aria-labelledby="welcome-heading">
      <div className="welcome-banner__content">
        <h1 id="welcome-heading" className="welcome-banner__title">
          Welcome to StudyWise
        </h1>
        <p className="welcome-banner__subtitle">Your one stop Grade 11 study hub.</p>
        <p className="welcome-banner__message">Small steps every day lead to big results!</p>
      </div>
      <div className="welcome-banner__art" aria-hidden="true">
        <div className="hero-illustration">
          <div className="hero-illustration__books">
            <div className="hero-illustration__book hero-illustration__book--a" />
            <div className="hero-illustration__book hero-illustration__book--b" />
            <div className="hero-illustration__book hero-illustration__book--c" />
          </div>
          <div className="hero-illustration__cup">
            <div className="hero-illustration__pencil hero-illustration__pencil--1" />
            <div className="hero-illustration__pencil hero-illustration__pencil--2" />
            <div className="hero-illustration__pencil hero-illustration__pencil--3" />
          </div>
        </div>
      </div>
    </section>
  )
}
