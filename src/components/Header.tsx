import ShareRequirementsCTA from "./ShareRequirementsCTA";
import { HeaderLogo } from "./OptimizedLogo";
import Link from "next/link";

const Header = () => (
  <header className="w-full bg-slate-50 flex items-center justify-between px-4 md:px-8 py-3">
    <Link
      href="/"
      className="flex items-center gap-3"
      aria-label="Go to homepage"
    >
      <HeaderLogo alt="Melodia Logo" />
      <span className="text-2xl font-bold text-gray-800 sm:inline">
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

    {/* Mobile Navigation - Hide testimonials, show only CTA */}
    <nav
      className="flex items-center gap-4 md:hidden"
      aria-label="Main navigation"
    >
      <Link
        href="/#creations-title"
        className="text-gray-700 hover:text-yellow-600 font-medium transition-colors focus:underline text-sm block max-[425px]:hidden"
        aria-label="Jump to Creations section"
      >
        Creations
      </Link>
      <ShareRequirementsCTA size="sm" />
    </nav>
  </header>
);

export default Header;
