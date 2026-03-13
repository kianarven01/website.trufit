// src/components/layout/Navbar/Navbar.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Menu, X, Phone, Mail, Clock } from "lucide-react"

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Our Services", href: "/services" },
  { name: "Gallery", href: "/gallery" },
  { name: "News", href: "/news" },
  { name: "About us", href: "/about" },
  { name: "Contact us", href: "/contact" },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // close mobile menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // detect scroll
  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header className="w-full fixed top-0 left-0 z-50">

      {/* top info bar */}
      <div className="w-full bg-gray-950 text-gray-100 text-xs md:text-sm">
        <div className="container flex justify-between items-center h-8 px-4 md:px-0">

          {/* phone + email */}
          <div className="flex gap-4 items-center">
            <a
              href="tel:+639187747788"
              className="flex items-center gap-1 hover:underline"
            >
              <Phone size={14} /> 0918-774-7788
            </a>

            <a
              href="mailto:trufitautocenter@gmail.com"
              className="hidden md:flex items-center gap-1 hover:underline"
            >
              <Mail size={14} /> trufitautocenter@gmail.com
            </a>
          </div>

          {/* hours */}
          <div className="flex items-center gap-1">
            <Clock size={14} /> Mon-Sat 8:00am - 5:00pm
          </div>
        </div>
      </div>

      {/* main navbar */}
      <div
        className={`w-full transition-all duration-300 ${
          scrolled
            ? "bg-white shadow-sm border-b"
            : "bg-transparent border-transparent"
        }`}
      >
        <div
          className={`container flex items-center justify-between px-4 md:px-0 transition-all duration-300 ${
            scrolled ? "h-16" : "h-20"
          }`}
        >

          {/* logo */}
          <Link href="/" className="flex items-center">
            <Image
              src={scrolled ? "/images/logo-white1.png" : "/images/logo-dark1.png"}
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
                className={`relative font-medium transition
                ${scrolled ? "text-gray-700" : "text-white"}
                hover:text-red-600
                after:content-[''] after:absolute after:left-0 after:-bottom-1
                after:w-0 after:h-[2px] after:bg-red-600 after:transition-all after:duration-300
                hover:after:w-full`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* desktop button */}
          <Link
            href="/contact"
            className={`hidden md:inline-block px-5 py-2 rounded-md font-medium transition
            ${
              scrolled
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-white/20 backdrop-blur-md border border-white/40 text-white hover:bg-white/30"
            }`}
          >
            Book Now
          </Link>

          {/* hamburger */}
          <button
            className={`md:hidden transition ${
              scrolled ? "text-gray-700" : "text-white"
            }`}
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

        {/* mobile menu */}
        <div
          ref={menuRef}
          className={`md:hidden overflow-hidden transition-all duration-500 ${
            open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <nav className="flex flex-col px-6 py-4 bg-white/30 backdrop-blur-md border-t border-white/20">

            {navLinks.map((link) => (
              <div
                key={link.name}
                className={`relative border-b ${scrolled ? "border-gray-300" : "border-white/40"}`}
              >
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`block py-2 font-medium transition
                             ${scrolled ? "text-gray-700" : "text-white"}
                             after:content-[''] after:absolute after:left-0 after:bottom-0
                             after:h-[2px] after:bg-red-600 after:w-0 after:transition-all after:duration-300
                             hover:after:w-full hover:text-red-600`}
                >
                  {link.name}
                </Link>
              </div>
            ))}

            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-md font-semibold transition mt-2"
            >
              Book Now
            </Link>

          </nav>
        </div>
      </div>
    </header>
  )
}