"use client";

import ShareRequirementsCTA from "./ShareRequirementsCTA";
import { HeaderLogo } from "./OptimizedLogo";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
          href="/#creations-title"
          className="text-gray-700 hover:text-yellow-600 font-medium transition-colors focus:underline"
          aria-label="Jump to Creations section"
        >
          Creations
        </Link>
        <Link
          href="/#testimonials-title"
          className="text-gray-700 hover:text-yellow-600 font-medium transition-colors focus:underline"
          aria-label="Jump to Testimonials section"
        >
          Testimonials
        </Link>
        <ShareRequirementsCTA size="md" />
      </div>

      {/* Mobile Navigation - Hamburger Menu */}
      <div className="flex items-center gap-2 sm:gap-4 md:hidden">
        <ShareRequirementsCTA size="sm" />

        {/* Hamburger Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 text-gray-700 hover:text-yellow-600 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2 rounded"
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
              href="/#creations-title"
              className="px-4 py-3 text-gray-700 hover:text-yellow-600 hover:bg-gray-50 font-medium transition-colors focus:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Jump to Creations section"
            >
              Creations
            </Link>
            <Link
              href="/#testimonials-title"
              className="px-4 py-3 text-gray-700 hover:text-yellow-600 hover:bg-gray-50 font-medium transition-colors focus:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Jump to Testimonials section"
            >
              Testimonials
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
