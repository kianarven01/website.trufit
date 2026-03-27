"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Phone, Mail, Clock, Menu, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import BibleVerseMarquee from "./BibleVerseMarquee"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const isVisibleRef = useRef(true)
  const lastScrollY = useRef(0)
  const isLockedRef = useRef(false)

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Services", href: "/services" },
    { name: "Gallery", href: "/gallery" },
    { name: "News", href: "/news" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ]

  // handle custom hide event (e.g., from ProcessSection)
  useEffect(() => {
    const handleHide = () => {
      setIsVisible(false)
      isVisibleRef.current = false
    }
    window.addEventListener("hideNavbar", handleHide as EventListener)
    return () => window.removeEventListener("hideNavbar", handleHide as EventListener)
  }, [])

  // handle scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // Always show at top (force show) and reset scrolled state
      if (currentScrollY < 60) {
        setIsScrolled(false)
        if (!isVisibleRef.current) {
          setIsVisible(true)
          isVisibleRef.current = true
        }
        lastScrollY.current = currentScrollY
        return
      }

      // Early exit if locked to prevent jitter loop (only after top-check)
      if (isLockedRef.current) return
      
      // Update scrolled state - threshold for changing appearance
      setIsScrolled(currentScrollY > 20)

      const diff = currentScrollY - lastScrollY.current
      
      // Decisions based on scroll direction and cumulative distance
      // Higher hide threshold to prevent "accidental" hiding
      if (diff > 50 && isVisibleRef.current && !isOpen) {
        // Scrolling down decisively
        setIsVisible(false)
        isVisibleRef.current = false
        lastScrollY.current = currentScrollY
        
        // Lock for 500ms to allow animation to finish and scroll to settle
        isLockedRef.current = true
        setTimeout(() => { isLockedRef.current = false }, 500)
      } else if (diff < -30 && !isVisibleRef.current) {
        // Prevent showing navbar if the section has requested it hidden
        if (document.body.hasAttribute("data-hide-navbar-on-scroll-up")) {
          return
        }

        // Scrolling up decisively
        setIsVisible(true)
        isVisibleRef.current = true
        lastScrollY.current = currentScrollY
        
        // Lock for 500ms
        isLockedRef.current = true
        setTimeout(() => { isLockedRef.current = false }, 500)
      }
      
      // Periodically update last position to avoid stale anchors
      if (Math.abs(diff) > 150) {
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
        <div className="max-w-[1820px] mx-auto px-2 sm:px-10 lg:px-16 flex items-center h-8 md:h-10">
          <div className="hidden lg:flex items-center gap-4 sm:gap-8 shrink-0">
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

          <BibleVerseMarquee />

          <div className="hidden lg:flex items-center gap-1.5 shrink-0">
            <Clock size={14} className="text-brand-red" />
            <span className="hidden xs:inline">Mon – Sat: 8:00 AM – 5:00 PM</span>
            <span className="xs:hidden">Mon – Sat: 8:00 AM – 5:00 PM</span>
          </div>
        </div>
      </div>

      {/* navbar wrapper - hides on scroll down */}
      <motion.nav 
        className="overflow-hidden"
        initial={false}
        animate={{ 
          y: isVisible ? 0 : "-100%",
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
                width={220}
                height={58}
                className="object-contain transition-all duration-500 w-[140px] md:w-[220px] landscape:w-[100px] md:landscape:w-[140px]"
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
              href="/#appointment"
              onClick={(e) => {
                const el = document.getElementById("appointment");

                if (el) {
                  e.preventDefault();
                  el.scrollIntoView(); // no smooth → instant jump
                }
              }}
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
              className="lg:hidden fixed top-0 left-0 w-full min-h-[100dvh] z-[999] flex flex-col items-center justify-start pt-20 pb-10 gap-8 bg-brand-dark overflow-y-auto"
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
              href="/#appointment"
              onClick={(e) => {
                const el = document.getElementById("appointment");

                if (el) {
                  e.preventDefault();
                  el.scrollIntoView(); // instant jump
                }

                setIsOpen(false);
              }}
              className="mt-4 px-10 py-4 bg-brand-red text-white rounded-sm text-xl font-bold hover:bg-white hover:text-brand-dark transition-all"
            >
              Book Now
            </Link>

              <div className="absolute bottom-12 flex gap-6 text-white/40">
                <a href="tel:09187747788" className="hover:text-white transition-colors">
                  <Phone size={20} />
                </a>

                <a href="mailto:trufitautocenter@gmail.com" className="hover:text-white transition-colors">
                  <Mail size={20} />
                </a>
                <span className="text-sm">Trufit Auto Center</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </header>
  )
}