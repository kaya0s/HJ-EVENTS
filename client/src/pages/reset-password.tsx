import React, { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HJLogo } from '@/components/hj-logo'
import LiquidEther from '@/components/ui/LiquidEther'
import { useTheme } from '@/components/theme-provider'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const [formData, setFormData] = useState({
    code: searchParams.get('code') || '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [serverMessage, setServerMessage] = useState('')
  const [resetToken] = useState<string | null>(() => {
    try {
      return searchParams.get('token') || window.sessionStorage.getItem('resetToken')
    } catch {
      return searchParams.get('token') || null
    }
  })
  const { theme } = useTheme()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
    if (serverMessage) setServerMessage('')
  }

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}

    if (!formData.code.trim()) {
      newErrors.code = 'Reset code is required'
    } else if (formData.code.length < 6) {
      newErrors.code = 'Reset code must be at least 6 characters'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
      const body = {
        resetToken: resetToken,
        code: formData.code,
        newPassword: formData.password
      }

      const res = await fetch(`${apiUrl}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body)
      })

      const data = await res.json().catch(() => ({}))

      if (res.ok) {
        setServerMessage(data.message || 'Password reset successful.')
        // clear stored token since it's single-use
  try { window.sessionStorage.removeItem('resetToken') } catch { /* ignore */ }
        setIsSuccess(true)
      } else {
        const msg = data?.message || 'Failed to reset password. Please try again.'
        setErrors({ general: msg })
        setServerMessage(msg)
      }
    } catch (error) {
      console.error('Error resetting password:', error)
      setErrors({ general: 'Network error. Please try again.' })
      setServerMessage('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Theme-based colors for LiquidEther
  const lightModeColors = ['#F5F7FA', '#E3E8EE', '#C9D6E3']
  const darkModeColors = ['#5227FF', '#FF9FFC', '#B19EEF']
  const currentColors = theme === 'dark' ? darkModeColors : lightModeColors

  if (isSuccess) {
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
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-xl font-medium text-foreground">
                Password Reset Successfully
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                {serverMessage || 'Your password has been updated successfully. You can now log in with your new password.'}
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button 
              asChild
              className="w-full"
              size="lg"
            >
              <Link to="/login">
                Continue to Login
              </Link>
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
      
      {/* Reset Password Card */}
      <Card className="w-full max-w-md shadow-lg border-border relative z-10 bg-background/70 backdrop-blur-md">
        <CardHeader className="space-y-6 pb-8">
          <HJLogo />
          <div className="text-center">
            <CardTitle className="text-xl font-medium text-foreground">
              Reset Your Password
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Enter the reset code from your email and create a new password.
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-md">
                {errors.general}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="code" className="text-sm font-medium text-foreground">
                Reset Code
              </Label>
              <Input
                id="code"
                name="code"
                type="text"
                placeholder="Enter the 6-digit code"
                value={formData.code}
                onChange={handleInputChange}
                className={`w-full ${errors.code ? 'border-red-500' : ''}`}
                maxLength={6}
              />
              {errors.code && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.code}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your new password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pr-10 ${errors.password ? 'border-red-500' : ''}`}
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
              {errors.password && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                Confirm New Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your new password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
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
