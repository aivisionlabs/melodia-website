"use client";

import ShareRequirementsCTA from "./ShareRequirementsCTA";
import { HeaderLogo } from "./OptimizedLogo";
import Link from "next/link";
import { useState } from "react";
import { Menu, X, User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { logout, isAuthenticated } = useAuth();

  return (
    <header className="w-full bg-slate-50 flex items-center justify-between px-2 sm:px-4 md:px-8 py-2 sm:py-3 relative">
      <Link
        href="/"
        className="flex items-center gap-2 sm:gap-3"
        aria-label="Go to homepage"
      >
        <HeaderLogo alt="Melodia Logo" className="w-12 h-12 sm:w-16 sm:h-16" />
        <span className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
          Melodia
        </span>
      </Link>

      {/* Desktop Navigation and CTA */}
      <div className="hidden md:flex items-center gap-6">
        <Link
          href="/library"
          className="text-gray-700 hover:text-yellow-600 font-medium transition-colors focus:underline"
          aria-label="Jump to Creations section"
        >
          Library
        </Link>
        <Link
          href="/#testimonials-title"
          className="text-gray-700 hover:text-yellow-600 font-medium transition-colors focus:underline"
          aria-label="Jump to Testimonials section"
        >
          Testimonials
        </Link>
        
        {isAuthenticated ? (
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="text-gray-700 hover:text-gray-900">
                <User className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Link href="/create-song">
              <Button size="sm" className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white">
                Create Song
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-gray-700 hover:text-gray-900"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button size="sm" className="bg-gray-900 hover:bg-gray-800 text-white">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm" className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white">
                Sign Up
              </Button>
            </Link>
          </div>
        )}
        
        <ShareRequirementsCTA size="md" />
      </div>

      {/* Mobile Navigation - Hamburger Menu */}
      <div className="flex items-center gap-2 sm:gap-4 md:hidden">
        {isAuthenticated ? (
          <div className="flex items-center gap-2">
            <Link href="/create-song">
              <Button size="sm" className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white text-xs">
                Create
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-gray-700 hover:text-gray-900 p-2"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/auth/login">
              <Button size="sm" className="bg-gray-900 hover:bg-gray-800 text-white text-xs">
                Sign In
              </Button>
            </Link>
          </div>
        )}
        
        <ShareRequirementsCTA size="sm" />

        {/* Hamburger Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 text-gray-700 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded"
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg md:hidden z-50">
          <nav className="flex flex-col py-2" aria-label="Mobile navigation">
            <Link
              href="/library"
              className="px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-gray-50 font-medium transition-colors focus:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Go to Songs Library"
            >
              Library
            </Link>
            <Link
              href="/#testimonials-title"
              className="px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-gray-50 font-medium transition-colors focus:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Jump to Testimonials section"
            >
              Testimonials
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-gray-50 font-medium transition-colors focus:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="Go to Dashboard"
                >
                  Dashboard
                </Link>
                <Link
                  href="/create-song"
                  className="px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-gray-50 font-medium transition-colors focus:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="Create New Song"
                >
                  Create Song
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-gray-50 font-medium transition-colors focus:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="Sign In"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-gray-50 font-medium transition-colors focus:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="Sign Up"
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
