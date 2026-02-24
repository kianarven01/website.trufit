// components/Navbar.tsx
import React, { useState } from "react";
import logo from "@/assets/images/logo.png";

const Navbar: React.FC = () => {
  const [open, setOpen] = useState(false);

  const links = [
    { label: "Home", href: "home" },
    { label: "About", href: "about" },
    { label: "Services", href: "services" },
    { label: "Contacts", href: "book-appointment" }, // use actual section id
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -80; // adjust for navbar height
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
    setOpen(false); // close mobile menu after click
  };

  return (
    <nav className="fixed top-0 w-full bg-white shadow-md z-50 select-none">
      <div className="w-full flex items-center justify-between px-6 md:px-10 py-4">
        {/* logo */}
        <button onClick={() => scrollToSection("home")} className="flex-shrink-0">
          <img src={logo} alt="Trufit Auto Logo" className="h-10 sm:h-12" />
        </button>

        {/* desktop links */}
        <div className="hidden md:flex gap-8">
          {links.map((link) => (
            <button
              key={link.href}
              onClick={() => scrollToSection(link.href)}
              className="text-gray-700 hover:text-red-600 transition font-medium"
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* mobile hamburger */}
        <div className="md:hidden flex items-center">
          <button onClick={() => setOpen(!open)} className="focus:outline-none">
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {open ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* mobile menu */}
      {open && (
        <div className="md:hidden bg-white shadow-md">
          {links.map((link) => (
            <button
              key={link.href}
              onClick={() => scrollToSection(link.href)}
              className="block w-full text-left px-6 py-3 text-gray-700 hover:bg-red-50 transition"
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