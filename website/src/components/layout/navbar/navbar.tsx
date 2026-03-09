// src/components/layout/Navbar/Navbar.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Menu, X } from "lucide-react"

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Services", href: "/services" },
  { name: "News", href: "/news" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // close menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <header className="w-full bg-white border-b shadow-sm fixed top-0 left-0 z-50">
      <div className="container flex items-center justify-between h-20">

        {/* logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/images/logo-white.png"
            alt="TruFit Auto Center"
            width={150}
            height={40}
            priority
          />
        </Link>

        {/* desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-gray-700 hover:text-blue-600 font-medium transition"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* desktop book now */}
        <Link
          href="/contact"
          className="hidden md:inline-block bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md font-semibold transition"
        >
          Book Now
        </Link>

        {/* hamburger */}
        <button
          className="md:hidden text-gray-700"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* mobile menu with slide-down */}
      <div
        ref={menuRef}
        className={`md:hidden overflow-hidden transition-all duration-700 ease-in-out ${
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="flex flex-col px-6 py-4 space-y-2 bg-white border-t border-gray-200">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-gray-700 hover:text-blue-600 font-medium transition"
              onClick={() => setOpen(false)}
            >
              {link.name}
            </Link>
          ))}

          {/* mobile book now button */}
          <Link
            href="/contact"
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md font-semibold mt-2 transition"
            onClick={() => setOpen(false)}
          >
            Book Now
          </Link>
        </nav>
      </div>
    </header>
  )
}