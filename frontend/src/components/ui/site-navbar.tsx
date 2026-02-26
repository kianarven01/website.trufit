import React, { useState, useEffect } from "react";
import logo from "@/assets/images/logo.png";

const Navbar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [show, setShow] = useState(true); // navbar visibility
  const [lastScrollY, setLastScrollY] = useState(0);

  const links = [
    { label: "Home", href: "home" },
    { label: "About", href: "about" },
    { label: "Services", href: "services" },
    { label: "Contacts", href: "book-appointment" },
  ];

  // handle scroll to hide/show navbar
  const controlNavbar = () => {
    if (window.scrollY > lastScrollY) {
      // scrolling down → hide
      setShow(false);
    } else {
      // scrolling up → show
      setShow(true);
    }
    setLastScrollY(window.scrollY);
  };

  useEffect(() => {
    window.addEventListener("scroll", controlNavbar);
    return () => window.removeEventListener("scroll", controlNavbar);
  }, [lastScrollY]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
    setOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 backdrop-blur-md bg-gray-900/80 select-none transition-transform duration-300 ${
        show ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="w-full flex items-center justify-between px-6 md:px-10 py-4">
        {/* logo */}
        <button onClick={() => scrollToSection("home")} className="flex-shrink-0">
          <img
            src={logo}
            alt="Trufit Auto Logo"
            className="h-14 sm:h-16 md:h-20 w-auto"
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
          />
        </button>

        {/* desktop links */}
        <div className="hidden md:flex items-center justify-center divide-x divide-white/30">
          {links.map((link) => (
            <button
              key={link.href}
              onClick={() => scrollToSection(link.href)}
              className="px-6 text-xl text-white hover:text-red-600 transition font-semibold"
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* mobile hamburger */}
        <div className="md:hidden flex items-center">
          <button onClick={() => setOpen(!open)} className="focus:outline-none">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* mobile menu */}
      {open && (
        <div className="md:hidden bg-white/20 backdrop-blur-md border-t border-white/20">
          {links.map((link) => (
            <button
              key={link.href}
              onClick={() => scrollToSection(link.href)}
              className="block w-full text-left px-6 py-3 text-white hover:bg-red-50/20 transition"
            >
              {link.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;