"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"

gsap.registerPlugin(ScrollTrigger)

const steps = [
  {
    id: "consultation",
    title: "CONSULTATION",
    description:
      "We begin by understanding your concerns and performing a preliminary assessment of your vehicle's needs.",
    image: "",
  },
  {
    id: "diagnostics",
    title: "DIAGNOSTICS",
    description:
      "We utilize advanced diagnostic technology to look beyond surface symptoms, performing an exhaustive digital analysis that identifies the root cause of any issue. This data-driven approach allows us to act as your technical consultants, providing a transparent, high-definition view of your vehicle's health so you can make the most strategic maintenance decisions.",
    image: "",
  },
  {
    id: "maintenance",
    title: "PRECISE MAINTENANCE",
    description:
      "Our expert technicians perform the necessary repairs and maintenance with surgical precision using premium parts.",
    image: "",
  },
  {
    id: "quality",
    title: "QUALITY CONTROL",
    description:
      "Every vehicle undergoes a rigorous multi-point inspection to ensure all work meets our high standards.",
    image: "",
  },
  {
    id: "delivery",
    title: "DELIVERY",
    description:
      "We return your vehicle in peak condition, providing a detailed report of all services performed.",
    image: "",
  },
]

export default function ProcessSection() {
  const [activeStep, setActiveStep] = useState(0)
  const sectionRef = useRef<HTMLDivElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const progressLineRef = useRef<HTMLDivElement>(null)

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
            scrub: 1,
            onUpdate: (self) => {
              const progress = self.progress
              const index = Math.min(
                Math.floor(progress * steps.length),
                steps.length - 1
              )
              setActiveStep(index)
              
              // Also update progress line manually for extra responsiveness if needed,
              // though tl.to is usually better.
            },
          },
        })

        // Animate the progress line separately or as part of the main timeline
        tl.to(progressLineRef.current, {
          width: "100%",
          ease: "none",
          duration: steps.length - 1
        }, 0)

        // Animate content for each step
        steps.forEach((_, i) => {
          if (i === 0) return // First step is default state

          tl.to(`.step-content-${i-1}`, { opacity: 0, y: -20, duration: 0.5 }, i)
            .fromTo(`.step-content-${i}`, 
              { opacity: 0, y: 20 }, 
              { opacity: 1, y: 0, duration: 0.5 }, 
              i + 0.2
            )
            .to(`.step-image-${i-1}`, { opacity: 0, scale: 1.1, duration: 0.5 }, i)
            .fromTo(`.step-image-${i}`,
              { opacity: 0, scale: 0.9 },
              { opacity: 1, scale: 1, duration: 0.5 },
              i + 0.2
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
      {/* Background Image Overlay */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="relative w-full h-full">
          {steps.map((step, idx) => (
            <div
              key={`bg-${step.id}`}
              className={`step-image-${idx} absolute inset-0 transition-opacity duration-500 ${idx === activeStep ? "opacity-100" : "opacity-0"}`}
            >
              {step.image ? (
                <Image
                  src={step.image}
                  alt={`Process Background ${idx}`}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-brand-dark flex items-center justify-center">
                  <div className="w-full h-full bg-[radial-gradient(circle_at_center,rgba(227,27,35,0.05)_0%,transparent_100%)]" />
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/80 to-transparent" />
      </div>

      <div ref={pinRef} className="min-h-screen flex flex-col justify-center relative z-10 py-24">
        <div className="max-w-[1820px] mx-auto w-full px-6 sm:px-10 lg:px-16">
          <div className="text-center mb-24">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-[2px] w-8 bg-brand-red" />
              <span className="text-sm font-bold tracking-widest uppercase text-brand-red">
                Our Work
              </span>
              <div className="h-[2px] w-8 bg-brand-red" />
            </div>
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic">Quality at Every Step</h2>
          </div>

          {/* Timeline Dots */}
          <div className="relative mb-32 max-w-5xl mx-auto">
            {/* Background Line */}
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/10 -translate-y-1/2 hidden md:block" />
            
            {/* Progress Line */}
            <div 
              ref={progressLineRef}
              className="absolute top-1/2 left-0 w-0 h-[1px] bg-brand-red -translate-y-1/2 hidden md:block z-10 shadow-[0_0_10px_rgba(227,27,35,0.5)]" 
            />

            <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative">
              {steps.map((step, idx) => (
                <button
                  key={step.id}
                  onClick={() => scrollToStep(idx)}
                  className="group relative flex flex-col items-center focus:outline-none z-20"
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
                  <div className={`absolute top-full mt-6 flex flex-col items-center transition-all duration-500 ${idx === activeStep ? "opacity-100 translate-y-0" : "opacity-40 -translate-y-2"}`}>
                    <span className="text-[10px] font-black italic text-brand-red mb-1">STEP 0{idx + 1}</span>
                    <span className="text-[11px] font-bold tracking-[0.2em] uppercase whitespace-nowrap">{step.title}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center min-h-[400px]">
            <div className="relative h-full flex flex-col justify-center order-2 lg:order-1">
              <div className="relative">
                {steps.map((step, idx) => (
                  <div 
                    key={`content-${step.id}`}
                    className={`step-content-${idx} ${idx === activeStep ? "relative z-10" : "absolute inset-0 opacity-0 pointer-events-none"} flex flex-col justify-center`}
                  >
                    <h3 className="text-2xl md:text-4xl font-black mb-6 text-brand-red uppercase italic tracking-tighter">
                      {step.title}
                    </h3>
                    <p className="text-gray-300 text-lg md:text-xl leading-relaxed max-w-xl font-medium">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="relative h-[300px] md:h-[450px] w-full rounded-sm overflow-hidden border border-white/10 shadow-2xl bg-black/20 group">
                {steps.map((step, idx) => (
                  <div
                    key={`img-${step.id}`}
                    className={`step-image-${idx} absolute inset-0 transition-all duration-1000 ${idx === activeStep ? "opacity-100 scale-100" : "opacity-0 scale-110"}`}
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
                          <span className="text-brand-red font-black text-2xl italic tracking-tighter">{idx + 1}</span>
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
    </section>
  )
}
