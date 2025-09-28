import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface SignupCardProps {
  onSwitchToLogin: () => void
}

export function SignupCard({ onSwitchToLogin }: SignupCardProps) {
  return (
    <div className="w-full">
      <form className="space-y-4 sm:space-y-6">
        <div className="space-y-3 sm:space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Full Name"
              required
              className="h-10 sm:h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Email"
              required
              className="h-10 sm:h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="Password"
              required 
              className="h-10 sm:h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input 
              id="confirm-password" 
              type="password" 
              placeholder="Confirm Password"
              required 
              className="h-10 sm:h-12"
            />
          </div>
        </div>

        <Button type="submit" className="w-full h-10 sm:h-12 text-base">
          Sign up
        </Button>

        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-primary hover:underline"
          >
            Sign in
          </button>
        </div>
      </form>
    </div>
  )
}
