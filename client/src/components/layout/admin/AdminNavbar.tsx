import { Button } from '@/components/ui/button'
import { User, Search, Bell } from 'lucide-react'
import { ThemeToggle } from "@/components/theme-toggle"

export default function AdminNavBar() {

  return (
    <header className="bg-card px-8 py-5 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Welcome Back, Admin!</h1>
          <p className="text-sm text-muted-foreground mt-1">Here's what's happening with your events today</p>
        </div>
        <div className="flex items-center">
          <div className="relative mr-6">
            <input
              type="text"
              placeholder="Search..."
              className="w-72 px-4 py-2 pr-10 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <Search className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2" />
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="hover:bg-accent transition-colors">
              <Bell className="h-5 w-5 text-muted-foreground" />
            </Button>
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="hover:bg-accent transition-colors">
              <User className="h-5 w-5 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
