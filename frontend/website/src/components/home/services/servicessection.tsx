"use client"

import { useRef, useEffect, useState } from "react"
import ServiceCard from "@/components/ui/servicecard"
import { services } from "@/data/services"

export default function ServicesSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLDivElement>(null)
  const [scrollWidth, setScrollWidth] = useState(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const updateWidth = () => setScrollWidth(container.scrollWidth - container.clientWidth)
    updateWidth()
    window.addEventListener("resize", updateWidth)
    return () => window.removeEventListener("resize", updateWidth)
  }, [])

  useEffect(() => {
    const section = sectionRef.current
    const container = containerRef.current
    if (!section || !container) return

    const onScroll = () => {
      if (window.innerWidth < 1024) return // mobile normal scroll

      const rect = section.getBoundingClientRect()
      const windowHeight = window.innerHeight

      if (rect.top < windowHeight && rect.bottom > 0) {
        // calculate vertical progress
        const totalScrollable = rect.height + windowHeight
        let scrollPercent = (windowHeight - rect.top) / totalScrollable

        // pause at center first (e.g., first 20%)
        const pauseFraction = 0.2
        if (scrollPercent < pauseFraction) {
          scrollPercent = 0
        } else {
          scrollPercent = (scrollPercent - pauseFraction) / (1 - pauseFraction)
          scrollPercent = Math.min(Math.max(scrollPercent, 0), 1)
        }

        container.scrollLeft = scrollPercent * scrollWidth
      }
    }

    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [scrollWidth])

  return (
    <section ref={sectionRef} className="relative bg-gray-50">
      <div className="px-6 sm:px-10 md:px-16 lg:px-24 xl:px-32 mx-auto max-w-[1400px]">
        <h2 className="text-3xl font-bold text-center mb-16">Our Services</h2>

        {/* horizontal scroll container */}
        <div className="hidden lg:block relative">
          <div
            ref={containerRef}
            className="lg:flex gap-6 overflow-hidden sticky top-[20vh] h-[400px]"
            style={{ willChange: "transform" }}
          >
            {services.map(service => (
              <div key={service.id} className="flex-shrink-0 w-[300px]">
                <ServiceCard service={service} />
              </div>
            ))}
          </div>

          {/* spacer div to create vertical scroll height */}
          <div style={{ height: `${scrollWidth + 400}px` }} />
        </div>

        {/* mobile fallback */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 lg:hidden auto-rows-fr">
          {services.map(service => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>
    </section>
  )
}