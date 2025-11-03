import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Menu, X, Search } from 'lucide-react';

const clientNavItems = [
  { name: "Home", path: "/home"},
  { name: "Packages", path: "/packages"},
  { name: "About", path: "/about"},
  { name: "Contact", path: "/contact"},
];

export const ClientNavBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo and Brand */}
          <div className="flex-shrink-0">
            <Link to="/home" className="text-3xl font-semibold text-gray-800 tracking-tight">
              HJ Events
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {clientNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="text-lg text-gray-600 hover:text-primary transition-colors font-normal tracking-wide"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex items-center max-w-md w-full mx-4">
            <div className="relative w-full">
              <Input
                type="search"
                placeholder="Search events..."
                className="w-full pl-10 pr-4 py-2 rounded-full border-gray-200"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Theme Toggle and Profile */}
          <div className="hidden md:flex items-center space-x-4">
            {/* <ThemeToggle /> */}
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100">
              <User className="h-5 w-5" />
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMenu}>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 pt-4 pb-3 space-y-3">
            {/* Mobile Search */}
            <div className="relative">
              <Input
                type="search"
                placeholder="Search events..."
                className="w-full pl-10 pr-4 py-2 rounded-full border-gray-200"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            
            {/* Mobile Navigation Links */}
            {clientNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="block px-3 py-2 text-lg text-gray-600 hover:text-primary transition-colors font-normal tracking-wide"
              >
                {item.name}
              </Link>
            ))}
            <div className="flex items-center space-x-4 px-3 py-2 border-t">
              <ThemeToggle />
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100">
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};


