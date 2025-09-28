import { SignupCard } from "@/components/SignupCard"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Mountain } from "lucide-react"

interface SignupPageProps {
  onSwitchToLogin: () => void
}

export function SignupPage({ onSwitchToLogin }: SignupPageProps) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Signup Form */}
      <div className="flex-1 bg-background flex items-center justify-center p-4 sm:p-8 min-h-screen lg:min-h-0">
        <div className="w-full max-w-md lg:max-w-md">
          <div className="mb-6 sm:mb-8">
            <div className="w-8 h-8 bg-primary rounded-md mb-4 sm:mb-6 flex items-center justify-center">
              <div className="w-4 h-4 bg-primary-foreground rounded-sm"></div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Sign up</h1>
            <p className="text-muted-foreground text-base sm:text-lg">
              Create your account to unlock tailored content and join your community
            </p>
          </div>
          <SignupCard onSwitchToLogin={onSwitchToLogin} />
        </div>
      </div>

      {/* Right Side - Visual Area */}
      <div className="flex-1 bg-muted flex items-center justify-center relative min-h-[300px] lg:min-h-screen">
        <ThemeToggle />
        <div className="text-center p-4">
          <div className="w-24 h-24 sm:w-32 sm:h-32 bg-muted-foreground/20 rounded-full flex items-center justify-center mb-6 sm:mb-8 mx-auto">
            <Mountain className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground/60" />
          </div>
          <div className="space-y-2">
            <div className="w-2 h-2 bg-muted-foreground/40 rounded-full mx-auto"></div>
            <div className="w-1 h-1 bg-muted-foreground/30 rounded-full mx-auto"></div>
            <div className="w-3 h-3 bg-muted-foreground/50 rounded-full mx-auto"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
