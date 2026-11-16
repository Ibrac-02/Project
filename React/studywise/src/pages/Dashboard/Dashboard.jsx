import Footer from '../../components/Footer/Footer'
import Header from '../../components/Header/Header'
import LowerSection from '../../components/LowerSection/LowerSection'
import MobileBottomNav from '../../components/MobileBottomNav/MobileBottomNav'
import ResourceCards from '../../components/ResourceCards/ResourceCards'
import SubjectsSection from '../../components/SubjectsSection/SubjectsSection'
import WelcomeBanner from '../../components/WelcomeBanner/WelcomeBanner'
import './Dashboard.css'

export default function Dashboard() {
  return (
    <div className="dashboard"> 
      <Header />
      <main id="main-content" className="dashboard__main">
        <WelcomeBanner />
        <ResourceCards />
        <SubjectsSection />
        <LowerSection />
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  )
} 
