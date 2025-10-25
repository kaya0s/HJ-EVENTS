import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { CheckCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HJLogo } from '@/components/hj-logo'
import LiquidEther from '@/components/ui/LiquidEther'
import { useTheme } from '@/components/theme-provider'

export default function AuthSuccessPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { theme } = useTheme()

  const token = searchParams.get('token')
  const userParam = searchParams.get('user')
  const errorParam = searchParams.get('error')

  useEffect(() => {
    if (errorParam) {
      setError('Authentication failed. Please try again.')
      setIsLoading(false)
      return
    }

    if (token) {
      // Store the token
      localStorage.setItem('authToken', token)
      
      // Store user data if provided
      if (userParam) {
        try {
          const userData = JSON.parse(decodeURIComponent(userParam))
          localStorage.setItem('user', JSON.stringify(userData))
        } catch (error) {
          console.error('Error parsing user data:', error)
        }
      }
      
      // Simulate a brief loading state
      setTimeout(() => {
        setIsLoading(false)
        // Redirect to dashboard or home page
        navigate('/dashboard', { replace: true })
      }, 2000)
    } else {
      setError('No authentication token received.')
      setIsLoading(false)
    }
  }, [token, userParam, errorParam, navigate])

  // Theme-based colors for LiquidEther
  const lightModeColors = ['#F5F7FA', '#E3E8EE', '#C9D6E3']
  const darkModeColors = ['#5227FF', '#FF9FFC', '#B19EEF']
  const currentColors = theme === 'dark' ? darkModeColors : lightModeColors

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
        {/* LiquidEther Background */}
        <div style={{ width: '100%', height: '100vh', position: 'absolute', top: 0, left: 0, zIndex: 0 }}>
          <LiquidEther
            colors={currentColors}
            mouseForce={20}
            cursorSize={100}
            isViscous={false}
            viscous={30}
            iterationsViscous={32}
            iterationsPoisson={32}
            resolution={0.5}
            isBounce={false}
            autoDemo={true}
            autoSpeed={0.5}
            autoIntensity={2.2}
            takeoverDuration={0.25}
            autoResumeDelay={3000}
            autoRampDuration={0.6}
          />
        </div>
        
        {/* Error Card */}
        <Card className="w-full max-w-md shadow-lg border-border relative z-10 bg-background/70 backdrop-blur-md">
          <CardHeader className="space-y-6 pb-8">
            <HJLogo />
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-xl font-medium text-foreground">
                Authentication Failed
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                {error}
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button 
              onClick={() => navigate('/login')}
              className="w-full"
              size="lg"
            >
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
      {/* LiquidEther Background */}
      <div style={{ width: '100%', height: '100vh', position: 'absolute', top: 0, left: 0, zIndex: 0 }}>
        <LiquidEther
          colors={currentColors}
          mouseForce={20}
          cursorSize={100}
          isViscous={false}
          viscous={30}
          iterationsViscous={32}
          iterationsPoisson={32}
          resolution={0.5}
          isBounce={false}
          autoDemo={true}
          autoSpeed={0.5}
          autoIntensity={2.2}
          takeoverDuration={0.25}
          autoResumeDelay={3000}
          autoRampDuration={0.6}
        />
      </div>
      
      {/* Success Card */}
      <Card className="w-full max-w-md shadow-lg border-border relative z-10 bg-background/70 backdrop-blur-md">
        <CardHeader className="space-y-6 pb-8">
          <HJLogo />
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
              {isLoading ? (
                <Loader2 className="w-8 h-8 text-green-600 dark:text-green-400 animate-spin" />
              ) : (
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              )}
            </div>
            <CardTitle className="text-xl font-medium text-foreground">
              {isLoading ? 'Authenticating...' : 'Authentication Successful!'}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              {isLoading 
                ? 'Please wait while we set up your account...' 
                : 'You have been successfully authenticated. Redirecting...'
              }
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isLoading && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                You will be redirected to the dashboard shortly.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
