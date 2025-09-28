import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

interface LoginCardProps {
  onSwitchToSignup: () => void
}

export function LoginCard({ onSwitchToSignup }: LoginCardProps) {
  return (
    <div className="w-full">
      <form className="space-y-4 sm:space-y-6">
        <div className="space-y-3 sm:space-y-4">
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
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <div className="flex items-center space-x-2">
            <Checkbox id="remember" />
            <Label htmlFor="remember" className="text-sm">
              Keep me signed in
            </Label>
          </div>
          <a
            href="#"
            className="text-sm text-primary hover:underline"
          >
            Forgot password?
          </a>
        </div>

        <Button type="submit" className="w-full h-10 sm:h-12 text-base">
          Sign in
        </Button>

        <div className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="text-primary hover:underline"
          >
            Sign up
          </button>
        </div>
      </form>
    </div>
  )
}
