import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Menu, X, Search, LogIn } from "lucide-react";

// Links rendered inline to enable smooth-scroll behaviors

type StoredUser = { id?: string; role?: string; email?: string };

export const ClientNavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<StoredUser | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      setUser(raw ? JSON.parse(raw) : null);
    } catch {
      setUser(null);
    }
  }, []);

  const toggleMenu = () => setIsOpen((v) => !v);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm md:text-base font-medium tracking-wide transition-colors ${
      isActive ? "text-white" : "text-gray-300 hover:text-white"
    }`;

  const scrollToFooter = () => {
    const footer = document.getElementById("site-footer");
    if (footer) {
      footer.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handlePackagesClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname === "/home") {
      const el = document.getElementById("packages");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      navigate("/home#packages");
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur supports-[backdrop-filter]:bg-gray-900/70 bg-gray-900/80 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 md:h-24 text-white">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <Link
              to="/home"
              className="text-2xl font-semibold tracking-tight text-white"
            >
              HJ Events
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-10">
            {/* Home */}
            <NavLink to="/home" className={navLinkClass}>
              Home
            </NavLink>
            {/* Packages */}
            <a
              href="/home#packages"
              onClick={handlePackagesClick}
              className="text-sm md:text-base font-medium tracking-wide text-gray-300 hover:text-white transition-colors"
            >
              Packages
            </a>
            {/* About */}
            <a
              href="#footer"
              onClick={(e) => {
                e.preventDefault();
                scrollToFooter();
              }}
              className="text-sm md:text-base font-medium tracking-wide text-gray-300 hover:text-white transition-colors"
            >
              About
            </a>
            {/* Contact */}
            <a
              href="#footer"
              onClick={(e) => {
                e.preventDefault();
                scrollToFooter();
              }}
              className="text-sm md:text-base font-medium tracking-wide text-gray-300 hover:text-white transition-colors"
            >
              Contact
            </a>
          </nav>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-4">
            <div className="relative">
              <Input
                type="search"
                placeholder="Search events..."
                className="w-[240px] pl-10 pr-3 py-3 rounded-full border-gray-700 bg-transparent text-gray-200 placeholder:text-gray-400"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            {/* <ThemeToggle /> */}
            <Button
              asChild
              variant="default"
              className="h-11 px-6 bg-gradient-to-r from-primary to-primary/80 text-white font-semibold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 hover:scale-105"
            >
              <Link to="/book">Reserve Now</Link>
            </Button>
            {user ? (
              <Button
                variant="ghost"
                size="icon"
                className="h-11 w-11 rounded-full hover:bg-white/10 text-white"
              >
                <User className="h-5 w-5" />
              </Button>
            ) : (
              <Button
                asChild
                variant="ghost"
                className="h-11 px-4 text-gray-300 hover:text-white hover:bg-white/10"
              >
                <Link to="/login" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" /> Sign in
                </Link>
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              className="text-white hover:bg-white/10"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden border-t border-white/10 bg-gray-900/90 backdrop-blur text-white">
          <div className="px-4 pt-4 pb-3 space-y-3">
            <div className="relative">
              <Input
                type="search"
                placeholder="Search events..."
                className="w-full pl-10 pr-4 py-2 rounded-full border-gray-700 bg-transparent text-gray-200 placeholder:text-gray-400"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            {/* Mobile links */}
            <NavLink
              to="/home"
              className={({ isActive }) =>
                `block px-3 py-2 text-base font-medium transition-colors ${
                  isActive ? "text-white" : "text-gray-300 hover:text-white"
                }`
              }
              onClick={() => setIsOpen(false)}
            >
              Home
            </NavLink>
            <a
              href="/home#packages"
              className="block px-3 py-2 text-base font-medium transition-colors text-gray-300 hover:text-white"
              onClick={(e) => {
                e.preventDefault();
                setIsOpen(false);
                handlePackagesClick(e);
              }}
            >
              Packages
            </a>
            <a
              href="#footer"
              className="block px-3 py-2 text-base font-medium transition-colors text-gray-300 hover:text-white"
              onClick={(e) => {
                e.preventDefault();
                setIsOpen(false);
                scrollToFooter();
              }}
            >
              About
            </a>
            <a
              href="#footer"
              className="block px-3 py-2 text-base font-medium transition-colors text-gray-300 hover:text-white"
              onClick={(e) => {
                e.preventDefault();
                setIsOpen(false);
                scrollToFooter();
              }}
            >
              Contact
            </a>
            <div className="flex items-center justify-between gap-3 px-1 pt-2 border-t border-white/10">
              {/* <ThemeToggle /> */}
              <Button
                asChild
                variant="default"
                className="flex-1 bg-gradient-to-r from-primary to-primary/80 text-white font-semibold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300"
              >
                <Link to="/book" onClick={() => setIsOpen(false)}>
                  Reserve Now
                </Link>
              </Button>
              {user ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-white/10 text-white"
                >
                  <User className="h-5 w-5" />
                </Button>
              ) : (
                <Button
                  asChild
                  variant="ghost"
                  className="flex-1 text-gray-300 hover:text-white hover:bg-white/10"
                >
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-2"
                  >
                    <LogIn className="h-4 w-4" /> Sign in
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
