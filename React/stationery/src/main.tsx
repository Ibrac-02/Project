import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import App from './App.tsx'
import PaymentCallback from './pages/PaymentCallback'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/payment-callback" element={<PaymentCallback />} />
        <Route path="/payment-return" element={<PaymentCallback />} />
      </Routes>
    </Router>
  </StrictMode>,
)
