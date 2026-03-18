"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import gsap from "gsap"

const steps = [
  {
    id: "consultation",
    title: "CONSULTATION",
    description:
      "We begin by understanding your concerns and performing a preliminary assessment of your vehicle's needs.",
    image: "/images/process/consultation.webp",
  },
  {
    id: "diagnostics",
    title: "DIAGNOSTICS",
    description:
      "We utilize advanced diagnostic technology to look beyond surface symptoms, performing an exhaustive digital analysis that identifies the root cause of any issue. This data-driven approach allows us to act as your technical consultants, providing a transparent, high-definition view of your vehicle's health so you can make the most strategic maintenance decisions.",
    image: "/images/process/diagnostics.webp",
  },
  {
    id: "maintenance",
    title: "PRECISE MAINTENANCE",
    description:
      "Our expert technicians perform the necessary repairs and maintenance with surgical precision using premium parts.",
    image: "/images/process/maintenance.webp",
  },
  {
    id: "quality",
    title: "QUALITY CONTROL",
    description:
      "Every vehicle undergoes a rigorous multi-point inspection to ensure all work meets our high standards.",
    image: "/images/process/quality.webp",
  },
  {
    id: "delivery",
    title: "DELIVERY",
    description:
      "We return your vehicle in peak condition, providing a detailed report of all services performed.",
    image: "/images/process/delivery.webp",
  },
]

export default function ProcessSection() {
  const [activeStep, setActiveStep] = useState(1) // Diagnostics by default
  const contentRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // animate content on step change
    gsap.fromTo(
      [contentRef.current, imageRef.current],
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" }
    )
  }, [activeStep])

  return (
    <section className="relative bg-brand-dark text-white py-24 overflow-hidden" id="process">
      {/* Background Image Overlay */}
      <div className="absolute inset-0 z-0 opacity-20">
        <Image
          src={steps[activeStep].image}
          alt="Process Background"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/80 to-transparent" />
      </div>

      <div className="max-w-[1820px] mx-auto relative z-10 px-6 sm:px-10 lg:px-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-[2px] w-8 bg-brand-red" />
            <span className="text-sm font-bold tracking-widest uppercase text-brand-red">
              Our Work
            </span>
            <div className="h-[2px] w-8 bg-brand-red" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold font-brawler">Quality at Every Step</h2>
        </div>

        {/* Timeline */}
        <div className="relative mb-20">
          <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white/20 -translate-y-1/2 hidden md:block" />
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative">
            {steps.map((step, idx) => (
              <button
                key={step.id}
                onClick={() => setActiveStep(idx)}
                className="group relative flex flex-col items-center focus:outline-none"
              >
                <div
                  className={`w-4 h-4 rounded-full border-2 transition-all duration-300 z-10 ${
                    idx === activeStep ? "bg-brand-red border-brand-red scale-125 shadow-[0_0_15px_rgba(227,27,35,0.8)]" : "bg-brand-dark border-white/40 group-hover:border-white"
                  }`}
                />
                <span
                  className={`mt-4 text-[10px] md:text-xs font-bold tracking-tighter transition-colors duration-300 ${
                    idx === activeStep ? "text-brand-red" : "text-white/40 group-hover:text-white"
                  }`}
                >
                  {step.title}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div ref={contentRef} className="order-2 lg:order-1">
            <p className="text-gray-300 text-lg leading-relaxed max-w-xl">
              {steps[activeStep].description}
            </p>
            {activeStep === 1 && (
              <div className="mt-8 text-sm text-gray-500 italic">
                NOTE: IF YOU CAN FIND LIGHTER IMAGES YOU CAN USE #002BA3 BLUE AS THE ACCENT COLOR
              </div>
            )}
          </div>

          <div ref={imageRef} className="order-1 lg:order-2">
            <div className="relative h-[300px] md:h-[400px] w-full rounded-sm overflow-hidden border border-white/10 shadow-2xl">
              <Image
                src={steps[activeStep].image}
                alt={steps[activeStep].title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-brand-red/10 mix-blend-overlay" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
