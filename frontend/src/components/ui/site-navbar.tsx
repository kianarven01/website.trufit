import React, { useState, useEffect } from "react";
import logo from "@/assets/images/logo.png";

const Navbar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [show, setShow] = useState(true);
  const [active, setActive] = useState("home");
  const [lastScrollY, setLastScrollY] = useState(0);

  const links = [
    { label: "Home", href: "home" },
    { label: "About", href: "about" },
    { label: "Services", href: "services" },
    { label: "Contacts", href: "book-appointment" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 100; // adjust for navbar height

      // detect active section
      for (const link of links) {
        const section = document.getElementById(link.href);
        if (section) {
          const top = section.offsetTop;
          const bottom = top + section.offsetHeight;
          if (scrollPos >= top && scrollPos < bottom) {
            setActive(link.href);
            break;
          }
        }
      }

      // hide/show navbar
      if (window.scrollY > lastScrollY) setShow(false);
      else setShow(true);
      setLastScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // initial check
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const scrollToSection = (id: string) => {
    const section = document.getElementById(id);
    if (!section) return;

    window.scrollTo({
      top: section.offsetTop - 80,
      behavior: "smooth",
    });

    setActive(id); // mark clicked link as active
    setOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 backdrop-blur-md bg-white select-none transition-transform duration-300 ${
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
          />
        </button>

        {/* desktop links */}
        <div className="hidden md:flex items-center justify-center">
          {links.map((link) => (
            <button
              key={link.href}
              onClick={() => scrollToSection(link.href)}
              className={`px-6 pb-1 text-xl font-semibold transition-all duration-300
                ${active === link.href ? "text-red-600 border-b-2 border-red-600" : "text-black border-b-0"}
                hover:text-red-600 hover:border-b-2 hover:border-red-600
              `}
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* mobile hamburger */}
        <div className="md:hidden flex items-center">
          <button onClick={() => setOpen(!open)}>
            <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div className="md:hidden bg-white border-t border-gray-200">
          {links.map((link) => (
            <button
              key={link.href}
              onClick={() => scrollToSection(link.href)}
              className={`block w-full text-left px-6 py-3 transition
                ${active === link.href ? "text-red-600 border-b-2 border-red-600" : "text-black border-b-0"}
                hover:text-red-600 hover:border-b-2 hover:border-red-600
              `}
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