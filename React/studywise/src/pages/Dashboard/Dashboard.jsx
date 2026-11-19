import Footer from '../../components/Footer/Footer'
import Header from '../../components/Header/Header'
import MobileBottomNav from '../../components/MobileBottomNav/MobileBottomNav'
import MotivationSection from '../../components/MotivationSection/MotivationSection'
import QuickAccess from '../../components/QuickAccess/QuickAccess'
import RecentlyViewed from '../../components/RecentlyViewed/RecentlyViewed'
import SubjectsSection from '../../components/SubjectsSection/SubjectsSection'
import WelcomeBanner from '../../components/WelcomeBanner/WelcomeBanner'
import './Dashboard.css'

export default function Dashboard() {
  return (
    <div className="dashboard">
      <Header />
      <div className="dashboard__layout">
        <main id="main-content" className="dashboard__main">
          <WelcomeBanner />
          <SubjectsSection />
          <div className="dashboard__bottom">
            <div className="dashboard__bottom-main">
              <QuickAccess />
              <RecentlyViewed />
            </div>
            <aside className="dashboard__bottom-side">
              <MotivationSection />
            </aside>
          </div>
        </main>
      </div>
      <Footer />
      <MobileBottomNav />
    </div>
  )
}
