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
  const innerRef = useRef<HTMLDivElement>(null)
  
  useGSAP(() => {
    const isMobile = window.innerWidth < 768

    // 1. Dynamic Bidirectional Wipe Reveal (Hero <-> Services <-> About)
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container.current,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        invalidateOnRefresh: true
      }
    });

    tl.fromTo(container.current, 
      { 
        clipPath: "polygon(0% 15%, 100% 0%, 100% 100%, 0% 100%)",
        webkitClipPath: "polygon(0% 15%, 100% 0%, 100% 100%, 0% 100%)"
      },
      {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        webkitClipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        ease: "none",
        duration: 0.4
      }
    )
    .to({}, { duration: 0.2 })
    .to(container.current, {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 85%, 0% 100%)",
      webkitClipPath: "polygon(0% 0%, 100% 0%, 100% 85%, 0% 100%)",
      ease: "none",
      duration: 0.4
    });

    // 2. Parallax Depth for Content
    gsap.fromTo(innerRef.current,
      { y: 100 },
      {
        y: -100,
        ease: "none",
        scrollTrigger: {
          trigger: container.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      }
    )

    // 3. Floating Background Animations
    gsap.to(".aura-1", {
      x: isMobile ? 50 : 200,
      y: isMobile ? 40 : 150,
      duration: isMobile ? 15 : 25,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    })

    gsap.to(".aura-2", {
      x: isMobile ? -60 : -250,
      y: isMobile ? -30 : -100,
      duration: isMobile ? 18 : 30,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: 2
    })

    if (!isMobile) {
      gsap.to(".accent-1", {
        x: 300, y: -200, scale: 1.3, duration: 15, repeat: -1, yoyo: true, ease: "power1.inOut"
      })
      gsap.to(".accent-2", {
        x: -400, y: 300, duration: 12, repeat: -1, yoyo: true, ease: "power2.inOut", delay: 1
      })
    }

    // 4. Staggered Card Entrance (Bidirectional Fade)
    // Updated toggleActions to trigger from both top and bottom
    gsap.fromTo(".service-card-reveal", 
      { y: 60, opacity: 0 },
      { 
        y: 0, 
        opacity: 1, 
        stagger: 0.1, 
        duration: 0.8,
        scrollTrigger: {
          trigger: ".services-grid",
          start: "top 90%", // Trigger slightly earlier for better visibility
          end: "bottom 10%",
          toggleActions: "play reverse play reverse" // play on enter, reverse on leave, play on enter back, reverse on leave back
        }
      }
    )
  }, { scope: container })

  return (
    <section 
      ref={container} 
      id="services-root-stable" 
      className="py-24 md:py-32 bg-white overflow-hidden relative"
      style={{ 
        clipPath: "polygon(0% 15%, 100% 0%, 100% 100%, 0% 100%)" 
      }}
    >
      
      {/* Structural Engineering Grid */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none select-none" 
        style={{ 
          backgroundImage: `linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)`,
          backgroundSize: '80px 80px' 
        }}
      />

      {/* Atmospheric Background Layers */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="aura-1 absolute -top-20 -left-20 w-[400px] md:w-[1000px] h-[400px] md:h-[1000px] bg-brand-red/15 rounded-full blur-[60px] md:blur-[120px]" />
        <div className="aura-2 absolute top-0 -right-20 w-[450px] md:w-[1100px] h-[450px] md:h-[1100px] bg-brand-blue/15 rounded-full blur-[70px] md:blur-[150px]" />
        <div className="accent-1 hidden md:block absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-brand-red/20 rounded-full blur-[80px]" />
        <div className="accent-2 hidden md:block absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-brand-blue/20 rounded-full blur-[90px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[1200px] h-[600px] md:h-[1200px] bg-white/40 rounded-full blur-[100px] md:blur-[160px] mix-blend-overlay" />
      </div>

      <div ref={innerRef} className="relative z-10 px-6 sm:px-10 md:px-16 lg:px-24 xl:px-32 mx-auto max-w-[1820px] w-full">
        {/* section-header */}
        <div className="mb-12 md:mb-20 section-header">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-[2px] bg-brand-blue" />
            <span className="text-brand-blue font-bold text-sm md:text-xs tracking-[0.2em] uppercase">
              What We Do
            </span>
          </div>
          <h2 className="text-5xl md:text-6xl lg:text-8xl font-black text-brand-dark leading-tight uppercase tracking-tight">
            Our Services
          </h2>
          <p className="mt-4 md:mt-8 text-gray-600 md:text-gray-500 max-w-2xl leading-relaxed text-base md:text-xl font-medium md:font-normal">
            Comprehensive automotive repair powered by state of the art tools and decades of expertise
          </p>
        </div>

        {/* Services Grid */}
        <div className="services-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
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
