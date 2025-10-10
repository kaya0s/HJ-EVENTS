import { StrictMode } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from '@/components/theme-provider'
import { ThemeToggle } from '@/components/theme-toggle'
import LoginPage from '@/pages/login'
import SignupPage from '@/pages/signup'

function App() {
  return (
    <StrictMode>
      <ThemeProvider defaultTheme="light" storageKey="hj-events-theme">
        <Router>
          <div className="relative min-h-screen">
            <div className="fixed top-4 right-4 z-50">
              <ThemeToggle />
            </div>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
            </Routes>
          </div>
        </Router>
      </ThemeProvider>
    </StrictMode>
  )
}

export default App