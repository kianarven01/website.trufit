"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { Cog } from "lucide-react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"

gsap.registerPlugin(ScrollTrigger)

const steps = [
  {
    id: "consultation",
    title: "CONSULTATION",
    description:
      "We will ask you about your car’s issues and do a quick check to see what needs to be done",
    image: "/images/home/our_work/consultation.jpg",
  },
  {
    id: "diagnostics",
    title: "DIAGNOSTICS",
    description:
      "We will run an extensive inspection with our special diagnostic tools to help us find the exact problem.",
    image: "/images/home/our_work/diagnostics.jpg",
  },
  {
    id: "maintenance",
    title: "Repair",
    description:
      "Our expert technicians will perform the necessary repairs and maintenance with proper tools and using premium parts.",
    image: "/images/home/our_work/repair.jpg",
  },
  {
    id: "quality",
    title: "QUALITY CONTROL",
    description:
      "We will test-drive and inspect your car one last time to make sure everything is working properly.",
    image: "/images/home/our_work/quality_control.jpg",
  },
  {
    id: "delivery",
    title: "DELIVERY",
    description:
      "We will hand over your car in great condition while providing a detailed report of all services performed.",
    image: "/images/home/our_work/delivery.jpg",
  },
]

export default function ProcessSection() {
  const [activeStep, setActiveStep] = useState(0)
  const sectionRef = useRef<HTMLDivElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const progressLineRef = useRef<HTMLDivElement>(null)

  // Animated Background Refs
  const gear1Ref = useRef<SVGSVGElement>(null)
  const gear2Ref = useRef<SVGSVGElement>(null)
  const gear3Ref = useRef<SVGSVGElement>(null)
  const gear4Ref = useRef<SVGSVGElement>(null)
  const orb1Ref = useRef<HTMLDivElement>(null)
  const orb2Ref = useRef<HTMLDivElement>(null)

  // Use IntersectionObserver instead of GSAP to reliably toggle the body attribute for navbar
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          document.body.setAttribute("data-hide-navbar-on-scroll-up", "true")
          window.dispatchEvent(new CustomEvent("hideNavbar"))
        } else {
          document.body.removeAttribute("data-hide-navbar-on-scroll-up")
        }
      },
      // Trigger when a small fraction of the element is visible
      { threshold: 0.02 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add("(min-width: 1024px)", () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: `+=${steps.length * 100}%`,
            pin: true,
            scrub: 0.4, // Reduced from 1 to 0.4 for better responsiveness on mid-range devices
            onUpdate: (self) => {
              const time = self.animation ? self.animation.time() : 0;
              // Make activeStep update when we are at the halfway point of transitioning
              const index = Math.min(
                Math.floor(time + 0.2), // slightly earlier than before to feel responsive
                steps.length - 1
              )
              setActiveStep(Math.max(0, index));
            },
          },
        })

        // Animate the progress line separately or as part of the main timeline
        tl.to(progressLineRef.current, {
          width: "100%",
          ease: "none",
          duration: steps.length - 1,
          force3D: true
        }, 0)

        // Animate background elements hooked to the same scroll progress
        tl.to(gear1Ref.current, { rotation: 180, ease: "none", duration: steps.length - 1, force3D: true }, 0)
        tl.to(gear2Ref.current, { rotation: -300, ease: "none", duration: steps.length - 1, force3D: true }, 0)
        tl.to(gear3Ref.current, { rotation: -225, ease: "none", duration: steps.length - 1, force3D: true }, 0)
        tl.to(gear4Ref.current, { rotation: 450, ease: "none", duration: steps.length - 1, force3D: true }, 0)

        tl.to(orb1Ref.current, { x: 200, y: 100, scale: 1.2, ease: "sine.inOut", duration: steps.length - 1, force3D: true }, 0)
        tl.to(orb2Ref.current, { x: -200, y: -100, scale: 0.8, ease: "sine.inOut", duration: steps.length - 1, force3D: true }, 0)

        // Animate content for each step
        steps.forEach((_, i) => {
          if (i === 0) return // First step is default state

          // Shift transitions so they happen *while* the progress line is approaching the dot.
          // Center the fade around 'i' (time=i is exactly when the line hits the dot).
          tl.to(`.step-content-${i-1}`, { opacity: 0, y: -20, duration: 0.4, force3D: true }, i - 0.4)
            .fromTo(`.step-content-${i}`, 
              { opacity: 0, y: 20 }, 
              { opacity: 1, y: 0, duration: 0.4, force3D: true }, 
              i - 0.1
            )
            .to(`.step-image-${i-1}`, { opacity: 0, scale: 1.1, duration: 0.4, force3D: true }, i - 0.4)
            .fromTo(`.step-image-${i}`,
              { opacity: 0, scale: 0.9 },
              { opacity: 1, scale: 1, duration: 0.4, force3D: true },
              i - 0.1
            )
        })
      })
      
      mm.add("(max-width: 1023px)", () => {
        // Mobile & Tablet scroll reveals
        gsap.utils.toArray('.mobile-step').forEach((step: any) => {
          gsap.fromTo(step, 
            { opacity: 0, y: 30 },
            {
              opacity: 1, y: 0, duration: 0.8, ease: "power2.out",
              scrollTrigger: {
                trigger: step,
                start: "top 85%",
                toggleActions: "play reverse play reverse"
              }
            }
          )
        })
      })

      return () => mm.revert()
    },
    { scope: sectionRef }
  )

  const scrollToStep = (idx: number) => {
    const scrollPos = sectionRef.current!.offsetTop + (idx * window.innerHeight)
    window.scrollTo({ top: scrollPos, behavior: "smooth" })
  }

  return (
    <section ref={sectionRef} className="relative bg-brand-dark text-white overflow-hidden" id="process">
      
      {/* --- NEW ANIMATED BACKGROUND LAYER --- */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        {/* Glowing Orbs */}
        <div ref={orb1Ref} className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-red/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
        <div ref={orb2Ref} className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-brand-blue/10 rounded-full blur-[150px] translate-y-1/3 -translate-x-1/4" />

        {/* Top-Left Connected Gear System */}
        <Cog 
          ref={gear1Ref} 
          className="absolute top-0 left-0 text-white opacity-[0.02] -ml-[400px] -mt-[400px] origin-center" 
          strokeWidth={0.5} 
          style={{ width: '1000px', height: '1000px' }} 
        />
        <Cog 
          ref={gear2Ref} 
          className="absolute top-0 left-0 text-white opacity-[0.02] ml-[430px] mt-[180px] origin-center" 
          strokeWidth={0.5} 
          style={{ width: '600px', height: '600px' }} 
        />

        {/* Bottom-Right Connected Gear System */}
        <Cog 
          ref={gear3Ref} 
          className="absolute bottom-0 right-0 text-white opacity-[0.02] -mr-[300px] -mb-[300px] origin-center" 
          strokeWidth={0.5} 
          style={{ width: '800px', height: '800px' }} 
        />
        <Cog 
          ref={gear4Ref} 
          className="absolute bottom-0 right-0 text-white opacity-[0.02] mr-[340px] mb-[280px] origin-center" 
          strokeWidth={0.5} 
          style={{ width: '400px', height: '400px' }} 
        />
      </div>

      {/* DESKTOP VIEW */}
      <div className="hidden lg:block">
        {/* Background Image Overlay */}
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
          <div className="relative w-full h-full">
          {steps.map((step, idx) => (
            <div
              key={`bg-${step.id}`}
              className={`step-image-${idx} absolute inset-0 ${idx === 0 ? "opacity-100" : "opacity-0"}`}
            >
              {step.image ? (
                <Image
                  src={step.image}
                  alt={`Process Background ${idx}`}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-transparent flex items-center justify-center" />
              )}
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/80 to-transparent" />
      </div>

      <div ref={pinRef} className="min-h-screen flex flex-col justify-center relative z-10 py-12">
        <div className="max-w-[1820px] mx-auto w-full px-6 sm:px-10 lg:px-16">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-[2px] w-8 bg-brand-red" />
              <span className="text-sm font-semibold tracking-widest uppercase text-brand-red">
                Our Work
              </span>
              <div className="h-[2px] w-8 bg-brand-red" />
            </div>
            <h2 className="text-4xl md:text-6xl font-semibold uppercase tracking-tighter">Quality at Every Step</h2>
          </div>

          {/* Timeline Dots */}
          <div className="relative mb-12 max-w-5xl mx-auto">
            {/* Background Line */}
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/10 -translate-y-1/2 hidden md:block" />
            
            {/* Progress Line */}
            <div 
              ref={progressLineRef}
              className="absolute top-1/2 left-0 w-0 h-[1px] bg-brand-red -translate-y-1/2 hidden md:block z-10 shadow-[0_0_10px_rgba(227,27,35,0.5)]" 
              style={{ willChange: "width" }}
            />

            <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative">
              {steps.map((step, idx) => (
                <div
                  key={step.id}
                  className="group relative flex flex-col items-center z-20"
                >
                  {/* Circle with Background Cutout */}
                  <div className="bg-brand-dark p-2 rounded-full relative z-30">
                    <div
                      className={`w-4 h-4 rounded-full border-2 transition-all duration-500 ${
                        idx <= activeStep 
                          ? "bg-brand-red border-brand-red scale-110 shadow-[0_0_20px_rgba(227,27,35,0.8)]" 
                          : "bg-brand-dark border-white/20 group-hover:border-white/40"
                      }`}
                    />
                  </div>

                  {/* Label with increased spacing */}
                  <div className={`absolute top-full mt-1 flex flex-col items-center transition-all duration-500 ${idx === activeStep ? "opacity-100 translate-y-0" : "opacity-40 -translate-y-2"}`}>
                    <span className="text-[10px] font-semibold text-brand-red mb-1">STEP {idx + 1}</span>
                    <span className="text-[11px] font-semibold tracking-[0.2em] uppercase whitespace-nowrap">{step.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full flex-1 pb-12">
            <div className="relative h-full flex flex-col justify-start pt-20 order-2 lg:order-1">
             
              <div className="relative w-full">
                {steps.map((step, idx) => (
                  <div 
                    key={`content-${step.id}`}
                    className={`step-content-${idx} ${idx === 0 ? "relative z-10" : "absolute inset-0 opacity-0 pointer-events-none"} flex flex-col justify-center`}
                  >
                    <h3 className="text-2xl md:text-4xl font-semibold mb-4 text-brand-red uppercase tracking-tighter leading-tight
                    ">
                      {step.title}
                    </h3>
                    <p className="text-gray-300 text-base md:text-md leading-relaxed max-w-xl font-medium">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="relative aspect-video w-full rounded-sm overflow-hidden border border-white/10 shadow-2xl bg-black/20 group">
                {steps.map((step, idx) => (
                  <div
                    key={`img-${step.id}`}
                    className={`step-image-${idx} absolute inset-0 ${idx === 0 ? "opacity-100 scale-100" : "opacity-0 scale-110"}`}
                  >
                    {step.image ? (
                      <Image
                        src={step.image}
                        alt={step.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-brand-dark">
                        <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center mb-6 bg-brand-dark shadow-xl">
                          <span className="text-brand-red font-semibold text-2xl tracking-tighter">{idx + 1}</span>
                        </div>
                        <h4 className="text-white/40 font-black uppercase tracking-[0.2em] text-[10px] mb-2">{step.title}</h4>
                        <p className="text-white/5 text-[9px] uppercase font-bold">Trufit Excellence / Process Documentation</p>
                        
                        {/* Decorative scanline */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent h-10 w-full animate-pulse" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-brand-red/10 mix-blend-overlay" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* MOBILE & TABLET VIEW (Vertical Stack) */}
      <div className="block lg:hidden relative z-10 min-h-screen py-16 px-6 mt-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-semibold uppercase tracking-tighter">Quality at Every Step</h2>
          <p className="text-brand-red font-semibold tracking-widest uppercase text-sm mt-4">Our Work</p>
        </div>
        
        <div className="flex flex-col gap-8 pb-12">
          {steps.map((step, idx) => (
            <div key={step.id} className="mobile-step relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-sm p-6 overflow-hidden">
              <span className="absolute -top-6 -right-6 text-white/5 font-semibold text-[140px] select-none leading-none z-0">
                {step.id}
              </span>
              <div className="relative z-10">
                <span className="text-brand-red font-semibold text-xs mb-2 block tracking-[0.2em]">STEP</span>
                <h3 className="text-2xl font-semibold uppercase tracking-tighter text-white mb-3">{step.title}</h3>
                <p className="text-gray-300 text-sm leading-relaxed mb-6 font-medium">{step.description}</p>
              </div>
              {step.image ? (
                <div className="relative w-full h-48 rounded-sm overflow-hidden mt-2 shadow-2xl border border-white/10 z-10">
                  <Image src={step.image} alt={step.title} fill className="object-cover" />
                  <div className="absolute inset-0 bg-brand-red/10 mix-blend-overlay" />
                </div>
              ) : (
                <div className="relative w-full h-48 rounded-sm overflow-hidden mt-2 shadow-2xl border border-white/10 bg-brand-dark flex flex-col items-center justify-center text-center p-4 z-10">
                  <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center mb-4 bg-brand-dark shadow-xl">
                    <span className="text-brand-red font-semibold text-xl tracking-tighter">{idx + 1}</span>
                  </div>
                  <h4 className="text-white/40 font-semibold uppercase tracking-[0.2em] text-[10px] mb-2">{step.title}</h4>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent h-10 w-full animate-pulse" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
