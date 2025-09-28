
import { useState } from 'react'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { LoginPage } from '@/pages/LoginPage'
import { SignupPage } from '@/pages/SignupPage'

type Page = 'login' | 'signup'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('login')

  const switchToSignup = () => setCurrentPage('signup')
  const switchToLogin = () => setCurrentPage('login')

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-foreground">
        {currentPage === 'login' ? (
          <LoginPage onSwitchToSignup={switchToSignup} />
        ) : (
          <SignupPage onSwitchToLogin={switchToLogin} />
        )}
      </div>
    </ThemeProvider>
  )
}

export default App
