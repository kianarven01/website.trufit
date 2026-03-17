"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Phone, Mail, Clock, Menu, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const lastScrollY = useRef(0)
  const isVisibleRef = useRef(true)

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Services", href: "/services" },
    { name: "Gallery", href: "/gallery" },
    { name: "News", href: "/news" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ]

  // handle scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // Update scrolled state
      setIsScrolled(currentScrollY > 50)

      // Always show at top (or very near top)
      if (currentScrollY < 120) {
        if (!isVisibleRef.current) {
          setIsVisible(true)
          isVisibleRef.current = true
        }
        lastScrollY.current = currentScrollY
        return
      }

      const diff = currentScrollY - lastScrollY.current
      const threshold = 15 // decisive threshold

      if (Math.abs(diff) > threshold) {
        if (diff > 0 && isVisibleRef.current && !isOpen) {
          // scrolling down decisively
          setIsVisible(false)
          isVisibleRef.current = false
        } else if (diff < 0 && !isVisibleRef.current) {
          // scrolling up decisively
          setIsVisible(true)
          isVisibleRef.current = true
        }
        lastScrollY.current = currentScrollY
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [isOpen])

  // disable background scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) document.body.classList.add("overflow-hidden")
    else document.body.classList.remove("overflow-hidden")
    return () => document.body.classList.remove("overflow-hidden")
  }, [isOpen])

  const linkStyle = `relative text-lg transition-all duration-300 hover:text-brand-red after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-brand-red after:transition-all after:duration-300 hover:after:w-full ${
    isScrolled ? "text-brand-dark" : "text-white"
  }`

  return (
    <header
      className={`sticky top-0 left-0 w-full z-50 transition-colors duration-500 ${
        isScrolled && isVisible ? "bg-white shadow-md" : "bg-transparent"
      }`}
    >
      {/* info bar - always visible */}
      <div className="bg-gray-950 text-white text-xs md:text-sm relative z-50">
        <div className="max-w-[1820px] mx-auto px-6 sm:px-10 lg:px-16 flex justify-between h-8 md:h-10 items-center">
          <div className="flex items-center gap-4 sm:gap-8">
            <div className="flex items-center gap-1.5">
              <Phone size={14} className="text-brand-red" />
              <a href="tel:09187747788" className="hover:underline">
                0918-774-7788
              </a>
            </div>
            <div className="hidden sm:flex items-center gap-1.5">
              <Mail size={14} className="text-brand-red" />
              <a href="mailto:trufitautocenter@gmail.com" className="hover:underline text-[10px] md:text-sm">
                trufitautocenter@gmail.com
              </a>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={14} className="text-brand-red" />
            <span className="hidden xs:inline">Mon – Sat: 8:00 AM – 5:00 PM</span>
            <span className="xs:hidden">8AM – 5PM</span>
          </div>
        </div>
      </div>

      {/* navbar wrapper - hides on scroll down */}
      <motion.nav 
        className="overflow-hidden"
        initial={false}
        animate={{ 
          height: isVisible ? "auto" : 0,
          opacity: isVisible ? 1 : 0
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="max-w-[1820px] mx-auto px-6 sm:px-10 lg:px-16 py-2">
          <div className="flex items-center h-16 w-full">
            {/* logo - swapped logic for user files */}
            <Link href="/" className="flex items-center">
              <Image
                src={isScrolled ? "/images/logo-white1.png" : "/images/logo-dark1.png"}
                alt="logo"
                width={160}
                height={42}
                className="object-contain transition-all duration-500 w-[120px] md:w-[160px] landscape:w-[70px] md:landscape:w-[100px]"
              />
            </Link>

            {/* desktop nav - hidden below lg */}
            <div className="hidden lg:flex flex-1 justify-center gap-12 ml-4">
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
                className={`px-8 py-2.5 rounded-sm font-bold transition-all duration-300 shadow-lg ${
                  isScrolled
                    ? "bg-brand-red text-white hover:bg-brand-dark"
                    : "bg-white text-brand-dark hover:bg-brand-red hover:text-white"
                }`}
              >
                Book Now
              </Link>
            </div>

            {/* hamburger - visible below lg */}
            <div className="lg:hidden ml-auto z-50">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={isScrolled ? "text-brand-dark" : "text-white"}
              >
                {isOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        {/* full-screen mobile menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="lg:hidden fixed top-0 left-0 w-full h-screen z-50 flex flex-col items-center justify-center gap-8 bg-brand-dark"
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-8 right-4 text-white"
              >
                <X size={32} />
              </button>

              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-white text-3xl font-brawler hover:text-brand-red transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}

              <Link
                href="/book"
                className="mt-4 px-10 py-4 bg-brand-red text-white rounded-sm text-xl font-bold hover:bg-white hover:text-brand-dark transition-all"
                onClick={() => setIsOpen(false)}
              >
                Book Now
              </Link>

              <div className="absolute bottom-12 flex gap-6 text-white/40">
                <Phone size={20} />
                <Mail size={20} />
                <span className="text-sm">Trufit Auto Center</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </header>
  )
}