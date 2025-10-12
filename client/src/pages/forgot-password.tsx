import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HJLogo } from '@/components/hj-logo'
import LiquidEther from '@/components/ui/LiquidEther'
import { useTheme } from '@/components/theme-provider'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { theme } = useTheme()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // TODO: Implement API call to send reset code
      console.log('Sending reset code to:', email)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setIsSubmitted(true)
    } catch (error) {
      console.error('Error sending reset code:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Theme-based colors for LiquidEther
  const lightModeColors = ['#F5F7FA', '#E3E8EE', '#C9D6E3']
  const darkModeColors = ['#5227FF', '#FF9FFC', '#B19EEF']
  const currentColors = theme === 'dark' ? darkModeColors : lightModeColors

  if (isSubmitted) {
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
                <Mail className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-xl font-medium text-foreground">
                Check Your Email
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                We've sent a password reset code to <strong>{email}</strong>
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Please check your email and click the link to reset your password. 
                The code will expire in 15 minutes.
              </p>
              <Button 
                asChild
                className="w-full"
                size="lg"
              >
                <Link to="/reset-password">
                  Enter Reset Code
                </Link>
              </Button>
            </div>
            
            <div className="text-center">
              <span className="text-sm text-muted-foreground">
                Didn't receive the email?{' '}
              </span>
              <Button 
                variant="link" 
                className="p-0 h-auto text-sm font-medium text-primary hover:text-primary/80"
                onClick={() => setIsSubmitted(false)}
              >
                Try again
              </Button>
            </div>
            
            <div className="text-center">
              <Link 
                to="/login" 
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Link>
            </div>
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
      
      {/* Forgot Password Card */}
      <Card className="w-full max-w-md shadow-lg border-border relative z-10 bg-background/70 backdrop-blur-md">
        <CardHeader className="space-y-6 pb-8">
          <HJLogo />
          <div className="text-center">
            <CardTitle className="text-xl font-medium text-foreground">
              Forgot Password?
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Enter your email address and we'll send you a code to reset your password.
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Reset Code'}
            </Button>
          </form>

          <div className="text-center mt-6">
            <Link 
              to="/login" 
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
