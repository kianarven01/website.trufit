"use client"

import { useRef } from "react"
import ServiceCard from "@/components/ui/servicecard"
import { services } from "@/data/home-services"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"

gsap.registerPlugin(ScrollTrigger)

export default function ServicesSection() {
  const container = useRef<HTMLDivElement>(null)
  // Simple Staggered Entrance (Standard ScrollTrigger)
  useGSAP(() => {
    // Header reveal
    gsap.fromTo(".section-header > *",
      { y: 20, opacity: 0 },
      { 
        y: 0, 
        opacity: 1, 
        stagger: 0.1, 
        duration: 0.6,
        scrollTrigger: {
          trigger: container.current,
          start: "top 85%",
          toggleActions: "play none none none"
        }
      }
    )

    // Basic staggered entrance for cards
    gsap.fromTo(".service-card-reveal", 
      { y: 30, opacity: 0 },
      { 
        y: 0, 
        opacity: 1, 
        stagger: 0.1, 
        duration: 0.5,
        scrollTrigger: {
          trigger: ".services-grid",
          start: "top 80%",
          toggleActions: "play none none none"
        }
      }
    )
  }, { scope: container })

  return (
    <section ref={container} id="services-root-stable" className="py-24 bg-white overflow-hidden relative">
      <div className="px-6 sm:px-10 lg:px-16 mx-auto max-w-[1400px]">
        {/* subheader and heading */}
        <div className="mb-10 md:mb-16 section-header">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-[2px] bg-brand-blue" />
            <span className="text-brand-blue font-bold text-sm md:text-xs tracking-[0.2em] uppercase">
              What We Do
            </span>
          </div>
          <h2 className="text-5xl md:text-5xl lg:text-6xl font-black text-brand-dark leading-tight">
            Our Services
          </h2>
          <p className="mt-6 text-gray-600 md:text-gray-500 max-w-2xl leading-relaxed font-medium md:font-normal">
            Comprehensive automotive repair powered by state of the art tools and decades of expertise
          </p>
        </div>

        {/* Unified Responsive Grid (Stability First) */}
        <div className="services-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map(service => (
            <div key={service.id} className="service-card-reveal">
                <ServiceCard service={service} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}