import LiquidEther from '@/components/ui/LiquidEther';
import { useTheme } from '@/components/theme-provider'

import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HJLogo } from '@/components/hj-logo'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const { theme } = useTheme()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle login logic here
    console.log('Login submitted')
  }

  // Theme-based colors for LiquidEther
  const lightModeColors = ['#F5F7FA', '#E3E8EE', '#C9D6E3'] // Soft gray/blue for white background
  const darkModeColors = ['#5227FF', '#FF9FFC', '#B19EEF'] // Vibrant colors for dark mode
  const currentColors = theme === 'dark' ? darkModeColors : lightModeColors

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
      
      {/* Login Card */}
      <Card className="w-full max-w-md shadow-lg border-border relative z-10 bg-background/70 backdrop-blur-md">
        <CardHeader className="space-y-6 pb-8">
          <HJLogo />
          <CardTitle className="text-center text-xl font-medium text-foreground">
            Welcome Back
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Example@gmail.com"
                required
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  required
                  className="w-full pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full"
              size="lg"
            >
              Login now
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-3 text-muted-foreground">
                Or
              </span>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full"
            size="lg"
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>

          <div className="text-center mt-6">
            <span className="text-sm text-muted-foreground">
              Don't Have An Account?{' '}
            </span>
            <Link 
              to="/signup" 
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
