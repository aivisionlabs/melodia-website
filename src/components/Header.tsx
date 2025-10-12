"use client";

import ShareRequirementsCTA from "./ShareRequirementsCTA";
import { HeaderLogo } from "./OptimizedLogo";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="w-full bg-secondary-cream flex items-center justify-between px-2 sm:px-4 md:px-8 py-1 sm:py-2 relative shadow-elegant">
      <Link
        href="/"
        className="flex items-center gap-1 sm:gap-2"
        aria-label="Go to homepage"
      >
        <HeaderLogo alt="Melodia Logo" />
      </Link>

      {/* Desktop Navigation and CTA */}
      <div className="hidden md:flex items-center gap-6">
        <Link
          href="/library"
          className="text-teal hover:text-accent-coral font-medium transition-colors focus:underline font-body"
          aria-label="Jump to Creations section"
        >
          Library
        </Link>
        <Link
          href="/about"
          className="text-teal hover:text-accent-coral font-medium transition-colors focus:underline font-body"
          aria-label="About Us"
        >
          About Us
        </Link>
        <Link
          href="/contact"
          className="text-teal hover:text-accent-coral font-medium transition-colors focus:underline font-body"
          aria-label="Contact Us"
        >
          Contact Us
        </Link>
        <Link
          href="/#testimonials-title"
          className="text-teal hover:text-accent-coral font-medium transition-colors focus:underline font-body"
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
              href="/library"
              className="px-4 py-3 text-gray-700 hover:text-yellow-600 hover:bg-gray-50 font-medium transition-colors focus:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Go to Songs Library"
            >
              Library
            </Link>
            <Link
              href="/about"
              className="px-4 py-3 text-gray-700 hover:text-yellow-600 hover:bg-gray-50 font-medium transition-colors focus:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
              aria-label="About Us"
            >
              About Us
            </Link>
            <Link
              href="/contact"
              className="px-4 py-3 text-gray-700 hover:text-yellow-600 hover:bg-gray-50 font-medium transition-colors focus:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Contact Us"
            >
              Contact Us
            </Link>
            <Link
              href="/#testimonials-title"
              className="px-4 py-3 text-gray-700 hover:text-yellow-600 hover:bg-gray-50 font-medium transition-colors focus:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Jump to Testimonials section"
            >
              Testimonials
            </Link>
            <div className="border-t border-gray-200 my-2"></div>
            <Link
              href="/privacy"
              className="px-4 py-3 text-gray-700 hover:text-yellow-600 hover:bg-gray-50 font-medium transition-colors focus:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Privacy Policy"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="px-4 py-3 text-gray-700 hover:text-yellow-600 hover:bg-gray-50 font-medium transition-colors focus:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Terms and Conditions"
            >
              Terms & Conditions
            </Link>
            <Link
              href="/refund"
              className="px-4 py-3 text-gray-700 hover:text-yellow-600 hover:bg-gray-50 font-medium transition-colors focus:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Refund Policy"
            >
              Refund Policy
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
