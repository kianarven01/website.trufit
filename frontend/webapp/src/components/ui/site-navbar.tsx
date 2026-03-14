import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "@/assets/images/logo.png";

const Navbar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const links = [
    { label: "Home", path: "/home" },
    { label: "About", path: "/about" },
    { label: "Services", path: "/services" },
    { label: "Products", path: "/products" },
    { label: "Contacts", path: "/contacts" },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-white select-none transition-transform duration-300 shadow-lg">
      <div className="w-full flex items-center justify-between px-6 md:px-10 py-4">
        {/* logo */}
        <Link to="/home" className="flex-shrink-0">
          <img
            src={logo}
            alt="Trufit Auto Logo"
            className="h-14 sm:h-16 md:h-20 w-auto"
            draggable={false}
          />
        </Link>

        {/* desktop links */}
        <div className="hidden md:flex items-center justify-center">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-6 pb-1 text-xl font-semibold transition-all duration-300
                ${location.pathname === link.path
                  ? "text-red-600 border-b-2 border-red-600"
                  : "text-black border-b-0"
                }
                hover:text-red-600 hover:border-b-2 hover:border-red-600
              `}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* mobile hamburger */}
        <div className="md:hidden flex items-center">
          <button onClick={() => setOpen(!open)}>
            <svg
              className="w-6 h-6 text-black"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
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
        <div className="md:hidden bg-white border-t border-gray-200">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setOpen(false)}
              className={`block w-full text-left px-6 py-3 transition
                ${location.pathname === link.path
                  ? "text-red-600 border-b-2 border-red-600"
                  : "text-black border-b-0"
                }
                hover:text-red-600 hover:border-b-2 hover:border-red-600
              `}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;