"use client"

import { useState, useEffect } from "react"
import { ArrowUp } from "lucide-react"

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 200)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (!visible) return null

  return (
    <button
      onClick={handleClick}
      className="
        fixed
        right-4
        bottom-8       /* lower on mobile */
        lg:bottom-24   /* higher on desktop */
        z-50
        p-3
        rounded-full
        bg-red-600
        text-white
        shadow-lg
        hover:bg-red-700
        transition
      "
      aria-label="Scroll to top"
    >
      <ArrowUp size={20} />
    </button>
  )
}