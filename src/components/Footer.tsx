const Footer = () => (
  <footer className="w-full bg-secondary-cream py-4 px-4 md:px-8 flex flex-col md:flex-row items-center justify-between text-teal text-sm mt-auto shadow-elegant">
    <div className="mb-2 md:mb-0 font-body">
      &copy; {new Date().getFullYear()} Melodia. Spreading joy through music! 🎵
    </div>
  </footer>
);

export default Footer;
