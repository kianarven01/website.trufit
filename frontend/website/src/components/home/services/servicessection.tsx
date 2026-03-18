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
    const mm = gsap.matchMedia();

    // Initial state setup to prevent flash of content (FOUM)
    gsap.set(".section-header > *, .service-card-reveal", { 
      opacity: 0, 
      y: 40 
    });

    // --- DESKTOP VIEW ---
    mm.add("(min-width: 768px)", () => {
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

      gsap.fromTo(innerRef.current,
        { y: 150 },
        {
          y: -150,
          ease: "none",
          scrollTrigger: {
            trigger: container.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true
          }
        }
      )
    });

    // --- MOBILE VIEW ---
    mm.add("(max-width: 767px)", () => {
      gsap.fromTo(innerRef.current,
        { yPercent: 4 },
        {
          yPercent: -4,
          ease: "none",
          force3D: true,
          scrollTrigger: {
            trigger: container.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.5
          }
        }
      )
    });

    // --- SHARED BI-DIRECTIONAL REVEALS ---
    gsap.to(".section-header > *", { 
      y: 0, 
      opacity: 1, 
      stagger: 0.1, 
      duration: 1,
      ease: "power4.out",
      scrollTrigger: {
        trigger: ".section-header",
        start: "top 92%",
        end: "bottom 8%",
        toggleActions: "play reverse play reverse"
      }
    })

    gsap.to(".service-card-reveal", { 
      y: 0, 
      opacity: 1, 
      stagger: 0.1, 
      duration: 0.8,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".services-grid",
        start: "top 92%",
        end: "bottom 8%",
        toggleActions: "play reverse play reverse"
      }
    })

    return () => mm.revert();
  }, { scope: container })

  return (
    <section 
      ref={container} 
      id="services-root-stable" 
      className="py-24 md:py-32 bg-white overflow-hidden relative md:[clip-path:polygon(0%_15%,_100%_0%,_100%_100%,_0%_100%)]"
    >
      <div 
        className="absolute inset-0 z-0 opacity-[0.02] pointer-events-none select-none" 
        style={{ 
          backgroundImage: `linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)`,
          backgroundSize: '80px 80px' 
        }}
      />

      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="aura-1 absolute -top-40 -left-40 w-[800px] md:w-[1200px] h-[800px] md:h-[1200px] bg-brand-blue/10 rounded-full blur-[80px] md:blur-[130px] will-change-transform" />
        <div className="aura-2 absolute top-0 -right-40 w-[600px] md:w-[900px] h-[600px] md:h-[900px] bg-brand-red/8 rounded-full blur-[70px] md:blur-[110px] will-change-transform" />
        <div className="accent-1 hidden md:block absolute top-1/2 left-1/4 w-[600px] h-[600px] bg-brand-blue/12 rounded-full blur-[90px] will-change-transform" />
        <div className="accent-2 hidden md:block absolute bottom-0 right-1/4 w-[700px] h-[700px] bg-brand-blue/8 rounded-full blur-[100px] will-change-transform" />
      </div>

      <div ref={innerRef} className="relative z-10 px-6 sm:px-10 md:px-16 lg:px-24 xl:px-32 mx-auto max-w-[1820px] w-full" style={{ willChange: "transform" }}>
        <div className="mb-12 md:mb-20 section-header">
          <div className="flex items-center gap-3 mb-4 opacity-0"> {/* Initial opacity for SSR safety */}
            <div className="w-12 h-[2px] bg-brand-blue" />
            <span className="text-brand-blue font-bold text-sm md:text-xs tracking-[0.2em] uppercase">
              What We Do
            </span>
          </div>
          <h2 className="text-5xl md:text-6xl lg:text-8xl font-black text-brand-dark leading-tight uppercase tracking-tight opacity-0">
            Our Services
          </h2>
          <p className="mt-4 md:mt-8 text-gray-600 md:text-gray-500 max-w-2xl leading-relaxed text-base md:text-xl font-medium md:font-normal opacity-0">
            Comprehensive automotive repair powered by state of the art tools and decades of expertise
          </p>
        </div>

        <div className="services-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {services.map(service => (
            <div key={service.id} className="service-card-reveal opacity-0" style={{ willChange: "opacity, transform" }}>
                <ServiceCard service={service} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
