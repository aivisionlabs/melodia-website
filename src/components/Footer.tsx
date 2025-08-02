const Footer = () => (
  <footer className="w-full bg-slate-50 py-4 px-4 md:px-8 flex flex-col md:flex-row items-center justify-between text-gray-600 text-sm mt-auto">
    <div className="mb-2 md:mb-0">
      &copy; {new Date().getFullYear()} Melodia. All rights reserved.
    </div>
  </footer>
);

export default Footer;
