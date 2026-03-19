"use client"

import { useRef, useState } from "react"
import ServiceCard from "@/components/ui/servicecard"
import { services } from "@/data/home-services"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"
import { motion, AnimatePresence } from "framer-motion"

gsap.registerPlugin(ScrollTrigger)

export default function ServicesSection() {
  const container = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  
  // Refs for background shapes to ensure reliable targeting
  const aura1Ref = useRef<HTMLDivElement>(null)
  const aura2Ref = useRef<HTMLDivElement>(null)
  const accent1Ref = useRef<HTMLDivElement>(null)
  const accent2Ref = useRef<HTMLDivElement>(null)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)

  // SEPARATE HOOK FOR FLOATING ANIMATIONS (Desktop Only) - SCATTERED VERSION
  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      // Significantly larger ranges (300px+) to "scatter" them across the screen
      gsap.to(aura1Ref.current, {
        x: 350,
        y: 250,
        scale: 1.4,
        rotation: 30,
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
      
      gsap.to(aura2Ref.current, {
        x: -400,
        y: 350,
        scale: 1.3,
        rotation: -45,
        duration: 9,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
      
      gsap.to(accent1Ref.current, {
        scale: 1.6,
        opacity: 0.3,
        x: 250,
        y: -150,
        rotation: 60,
        duration: 7,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut"
      });
      
      gsap.to(accent2Ref.current, {
        x: 300,
        y: -250,
        scale: 1.5,
        rotation: -20,
        duration: 10,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    });

    return () => mm.revert();
  }, { scope: container })
  
  // HOOK FOR SCROLL TRIGGER REVEALS
  useGSAP(() => {
    const mm = gsap.matchMedia();

    // Initial state setup
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

      // Reveal Animations
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
    });

    // --- MOBILE VIEW ---
    mm.add("(max-width: 767px)", () => {
      gsap.set(".section-header > *, .service-card-reveal", { 
        opacity: 1, 
        y: 0 
      });
      gsap.set(innerRef.current, { y: 0 });
    });

    return () => mm.revert();
  }, { scope: container })

  const handleDragEnd = (event: any, info: any) => {
    const swipeThreshold = 50;
    if (info.offset.x > swipeThreshold) {
      setDirection(-1);
      setCurrentIndex((prev) => (prev === 0 ? services.length - 1 : prev - 1))
    } else if (info.offset.x < -swipeThreshold) {
      setDirection(1);
      setCurrentIndex((prev) => (prev === services.length - 1 ? 0 : prev + 1))
    }
  }

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 150 : -150,
      opacity: 0,
      scale: 0.95
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: "spring", stiffness: 400, damping: 40 },
        opacity: { duration: 0.2 }
      }
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 150 : -150,
      opacity: 0,
      scale: 0.95,
      transition: {
        x: { type: "spring", stiffness: 400, damping: 40 },
        opacity: { duration: 0.2 }
      }
    })
  };

  return (
    <section 
      ref={container} 
      id="services-root-stable" 
      className="py-24 md:py-32 bg-white overflow-hidden relative z-10 md:[clip-path:polygon(0%_15%,_100%_0%,_100%_100%,_0%_100%)]"
    >
      <div 
        className="absolute inset-0 z-0 opacity-[0.02] pointer-events-none select-none" 
        style={{ 
          backgroundImage: `linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)`,
          backgroundSize: '80px 80px' 
        }}
      />

      {/* Scattered Background Shapes */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div 
          ref={aura1Ref}
          className="aura-1 absolute -top-40 -left-60 w-[800px] md:w-[1200px] h-[800px] md:h-[1200px] bg-brand-blue/15 rounded-full blur-[80px] md:blur-[130px]" 
        />
        <div 
          ref={aura2Ref}
          className="aura-2 absolute -top-20 -right-60 w-[600px] md:w-[900px] h-[600px] md:h-[900px] bg-brand-red/10 rounded-full blur-[70px] md:blur-[110px]" 
        />
        <div 
          ref={accent1Ref}
          className="accent-1 hidden md:block absolute top-1/2 -left-40 w-[600px] h-[600px] bg-brand-blue/15 rounded-full blur-[90px]" 
        />
        <div 
          ref={accent2Ref}
          className="accent-2 hidden md:block absolute -bottom-40 -right-40 w-[700px] h-[700px] bg-brand-blue/12 rounded-full blur-[100px]" 
        />
      </div>

      <div ref={innerRef} className="relative z-10 px-6 sm:px-10 md:px-16 lg:px-24 xl:px-32 mx-auto max-w-[1820px] w-full" style={{ willChange: "transform" }}>
        <div className="mb-12 md:mb-20 section-header">
          <div className="flex items-center gap-3 mb-4 opacity-0">
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

        {/* Desktop Grid View */}
        <div className="hidden md:grid services-grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {services.map(service => (
            <div key={service.id} className="service-card-reveal opacity-0" style={{ willChange: "opacity, transform" }}>
                <ServiceCard service={service} />
            </div>
          ))}
        </div>

        {/* Mobile Swipeable Stack View */}
        <div className="md:hidden relative h-[560px] w-full flex flex-col items-center touch-pan-y">
          <div className="relative w-full h-[480px] flex items-center justify-center overflow-hidden">
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragEnd={handleDragEnd}
                style={{ willChange: "transform, opacity" }}
                className="absolute w-full max-w-[340px] cursor-grab active:cursor-grabbing px-4"
              >
                <ServiceCard service={services[currentIndex]} />
              </motion.div>
            </AnimatePresence>
          </div>
          
          <div className="mt-4 flex justify-center gap-2">
            {services.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-1.5 transition-all duration-300 rounded-full ${idx === currentIndex ? 'w-8 bg-brand-red' : 'w-2 bg-gray-300'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
