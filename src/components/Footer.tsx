import Link from "next/link";

const Footer = () => (
  <footer className="w-full bg-secondary-cream py-8 px-4 md:px-8 mt-auto shadow-elegant">
    <div className="max-w-7xl mx-auto">
      {/* Main Footer Content */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
        {/* About Section */}
        <div>
          <h3 className="text-teal font-semibold text-lg mb-4 font-heading">
            About Melodia
          </h3>
          <ul className="space-y-2">
            <li>
              <Link
                href="/about"
                className="text-teal/80 hover:text-accent-coral transition-colors text-sm font-body"
              >
                Our Story
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="text-teal/80 hover:text-accent-coral transition-colors text-sm font-body"
              >
                Contact Us
              </Link>
            </li>
            <li>
              <Link
                href="/library"
                className="text-teal/80 hover:text-accent-coral transition-colors text-sm font-body"
              >
                Song Library
              </Link>
            </li>
          </ul>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-teal font-semibold text-lg mb-4 font-heading">
            Quick Links
          </h3>
          <ul className="space-y-2">
            <li>
              <Link
                href="/#creations"
                className="text-teal/80 hover:text-accent-coral transition-colors text-sm font-body"
              >
                Our Creations
              </Link>
            </li>
            <li>
              <Link
                href="/#testimonials"
                className="text-teal/80 hover:text-accent-coral transition-colors text-sm font-body"
              >
                Testimonials
              </Link>
            </li>
            <li>
              <Link
                href="/library"
                className="text-teal/80 hover:text-accent-coral transition-colors text-sm font-body"
              >
                Browse All Songs
              </Link>
            </li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h3 className="text-teal font-semibold text-lg mb-4 font-heading">
            Legal
          </h3>
          <ul className="space-y-2">
            <li>
              <Link
                href="/privacy"
                className="text-teal/80 hover:text-accent-coral transition-colors text-sm font-body"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                href="/terms"
                className="text-teal/80 hover:text-accent-coral transition-colors text-sm font-body"
              >
                Terms & Conditions
              </Link>
            </li>
            <li>
              <Link
                href="/refund"
                className="text-teal/80 hover:text-accent-coral transition-colors text-sm font-body"
              >
                Refund Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* Connect */}
        <div>
          <h3 className="text-teal font-semibold text-lg mb-4 font-heading">
            Connect
          </h3>
          <ul className="space-y-2">
            <li>
              <a
                href="https://www.instagram.com/melodia.songs"
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal/80 hover:text-accent-coral transition-colors text-sm font-body"
              >
                Instagram
              </a>
            </li>
            <li>
              <a
                href="https://x.com/melodia_songs?t=-JQpro8iywfJoPTWgsFWDA&s=09"
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal/80 hover:text-accent-coral transition-colors text-sm font-body"
              >
                Twitter/X
              </a>
            </li>
            <li>
              <a
                href="mailto:info@melodia-songs.com"
                className="text-teal/80 hover:text-accent-coral transition-colors text-sm font-body"
              >
                Email Us
              </a>
            </li>
            <li>
              <a
                href="https://wa.me/918880522285"
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal/80 hover:text-accent-coral transition-colors text-sm font-body"
              >
                WhatsApp
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-teal/20 pt-6 flex flex-col md:flex-row items-center justify-between">
        <p className="text-teal/70 text-sm mb-2 md:mb-0 font-body">
          &copy; {new Date().getFullYear()} Melodia. Spreading joy through
          music! 🎵
        </p>
        <p className="text-teal/70 text-sm font-body">
          Made with ❤️ for creating musical memories
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
