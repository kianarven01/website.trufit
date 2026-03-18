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
  
  useGSAP(() => {
    // Media query to check if we are on mobile
    const isMobile = window.innerWidth < 768

    // 1. Optimized Floating Animations
    // On mobile, we reduce the number of moving parts and simplify properties
    gsap.to(".aura-1", {
      x: isMobile ? 50 : 200,
      y: isMobile ? 40 : 150,
      rotation: isMobile ? 0 : 360, // Disable rotation on mobile
      duration: isMobile ? 15 : 25,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    })

    gsap.to(".aura-2", {
      x: isMobile ? -60 : -250,
      y: isMobile ? -30 : -100,
      rotation: isMobile ? 0 : -360,
      duration: isMobile ? 18 : 30,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: 2
    })

    if (!isMobile) {
      // High-energy accents only for Desktop
      gsap.to(".accent-1", {
        x: 300, y: -200, scale: 1.3, duration: 15, repeat: -1, yoyo: true, ease: "power1.inOut"
      })
      gsap.to(".accent-2", {
        x: -400, y: 300, duration: 12, repeat: -1, yoyo: true, ease: "power2.inOut", delay: 1
      })
    }

    // 2. Content reveals (Stays the same, very efficient)
    gsap.fromTo(".section-header > *",
      { y: 20, opacity: 0 },
      { 
        y: 0, opacity: 1, stagger: 0.1, duration: 0.6,
        scrollTrigger: { trigger: container.current, start: "top 85%", toggleActions: "play none none none" }
      }
    )

    gsap.fromTo(".service-card-reveal", 
      { y: 30, opacity: 0 },
      { 
        y: 0, opacity: 1, stagger: 0.1, duration: 0.5,
        scrollTrigger: { trigger: ".services-grid", start: "top 80%", toggleActions: "play none none none" }
      }
    )
  }, { scope: container })

  return (
    <section ref={container} id="services-root-stable" className="py-20 md:py-24 bg-white overflow-hidden relative">
      
      {/* Structural Engineering Grid - Lower opacity for performance */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none select-none" 
        style={{ 
          backgroundImage: `linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)`,
          backgroundSize: '80px 80px' 
        }}
      />

      {/* Atmospheric Background Layers (Reduced count/size on mobile) */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Aura 1: Smaller and less blurry on mobile */}
        <div className="aura-1 absolute -top-20 -left-20 w-[400px] md:w-[1000px] h-[400px] md:h-[1000px] bg-brand-red/15 rounded-full blur-[60px] md:blur-[120px]" />
        
        {/* Aura 2: Smaller and less blurry on mobile */}
        <div className="aura-2 absolute top-0 -right-20 w-[450px] md:w-[1100px] h-[450px] md:h-[1100px] bg-brand-blue/15 rounded-full blur-[70px] md:blur-[150px]" />
        
        {/* Accent Blobs: Hidden on mobile to save GPU */}
        <div className="accent-1 hidden md:block absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-brand-red/20 rounded-full blur-[80px]" />
        <div className="accent-2 hidden md:block absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-brand-blue/20 rounded-full blur-[90px]" />
        
        {/* Subtle center intensity */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[1200px] h-[600px] md:h-[1200px] bg-white/40 rounded-full blur-[100px] md:blur-[160px] mix-blend-overlay" />
      </div>

      <div className="relative z-10 px-6 sm:px-10 md:px-16 lg:px-24 xl:px-32 mx-auto max-w-[1820px] w-full">
        <div className="mb-10 md:mb-16 section-header">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-[2px] bg-brand-blue" />
            <span className="text-brand-blue font-bold text-sm md:text-xs tracking-[0.2em] uppercase">
              What We Do
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-brand-dark leading-tight uppercase tracking-tight">
            Our Services
          </h2>
          <p className="mt-4 md:mt-6 text-gray-600 md:text-gray-500 max-w-2xl leading-relaxed text-base md:text-lg font-medium md:font-normal">
            Comprehensive automotive repair powered by state of the art tools and decades of expertise
          </p>
        </div>

        <div className="services-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
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
