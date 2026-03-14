"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Phone, Mail, Clock, Menu, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Services", href: "/services" },
    { name: "Gallery", href: "/gallery" },
    { name: "News", href: "/news" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ]

  // disable background scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) document.body.classList.add("overflow-hidden")
    else document.body.classList.remove("overflow-hidden")
    return () => document.body.classList.remove("overflow-hidden")
  }, [isOpen])

  const linkStyle =
    "relative text-white text-lg transition-colors hover:text-red-600 after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-red-600 after:transition-all after:duration-300 hover:after:w-full"

  return (
    <header className="absolute top-0 left-0 w-full z-50">

      {/* info bar - always visible */}
      <div className="bg-gray-950 text-white text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between h-8 items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Phone size={14} />
              <a href="tel:+639187747788" className="hover:underline">
                +639187747788
              </a>
            </div>
            <div className="hidden sm:flex items-center gap-1">
              <Mail size={14} />
              <a href="mailto:trufitautocenter@gmail.com" className="hover:underline">
                trufitautocenter@gmail.com
              </a>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={14} /> Mon–Sat: 8am – 5pm
          </div>
        </div>
      </div>

      {/* navbar */}
      <nav className="shadow-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 w-full">

            {/* logo - always visible */}
            <Link href="/" className="flex items-center">
              <Image
                src={isHovered ? "/images/logo-white1.png" : "/images/logo-dark1.png"}
                alt="logo"
                width={150}
                height={40}
                className="object-contain transition-all duration-300"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              />
            </Link>

            {/* desktop nav - hidden below lg */}
            <div className="hidden lg:flex flex-1 justify-center gap-8 ml-4">
              {navLinks.map((link) => (
                <Link key={link.name} href={link.href} className={linkStyle}>
                  {link.name}
                </Link>
              ))}
            </div>

            {/* desktop book button - hidden below lg */}
            <div className="hidden lg:flex ml-4">
              <Link
                href="/book"
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
              >
                Book Now
              </Link>
            </div>

            {/* hamburger - visible below lg */}
            <div className="lg:hidden ml-auto z-50">
              <AnimatePresence initial={false}>
                {!isOpen && (
                  <motion.button
                    onClick={() => setIsOpen(true)}
                    className="text-white"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <Menu size={26} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>

        {/* full-screen mobile menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="lg:hidden fixed top-0 left-0 w-full h-full z-50 flex flex-col items-center justify-center gap-6 bg-black/85"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-12 right-4 text-white"
              >
                <X size={28} />
              </button>

              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={linkStyle + " text-white"}
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}

              <Link
                href="/book"
                className="mt-4 px-6 py-3 bg-red-600 text-white rounded-md text-center hover:bg-red-700 transition"
                onClick={() => setIsOpen(false)}
              >
                Book Now
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  )
}