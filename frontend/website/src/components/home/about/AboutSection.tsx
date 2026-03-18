"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import { CheckCircle2 } from "lucide-react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export default function AboutSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        imageRef.current,
        { opacity: 0, x: -50 },
        {
          opacity: 1,
          x: 0,
          duration: 1.2,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
          },
        }
      )

      gsap.fromTo(
        contentRef.current,
        { opacity: 0, x: 50 },
        {
          opacity: 1,
          x: 0,
          duration: 1.2,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
          },
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const features = [
    "OEM-Certified Diagnostic Tools",
    "Genuine & Premium After-market Parts",
    "Comprehensive Warranty on All Repairs",
  ]

  return (
    <section ref={sectionRef} className="section-padding bg-white overflow-hidden" id="about">
      <div className="max-w-[1820px] mx-auto px-6 sm:px-10 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Image Side */}
          <div ref={imageRef} className="relative group">
            <div className="absolute -top-4 -left-4 w-24 h-24 border-t-2 border-l-2 border-brand-red z-10" />
            <div className="relative h-[400px] md:h-[500px] w-full overflow-hidden shadow-2xl">
              <Image
                src="/images/about/workshop.webp"
                alt="Workshop"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </div>

          {/* Content Side */}
          <div ref={contentRef}>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-[2px] w-8 bg-brand-red" />
              <span className="text-sm font-bold tracking-widest uppercase text-brand-red">
                About Us
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold mb-6 font-brawler leading-tight text-brand-dark">
              Technology-Driven <br />
              <span className="text-brand-red">Repair Quality</span>
            </h2>

            <p className="text-gray-600 mb-8 leading-relaxed">
              Here at Trufit, we combine years of hands-on experience with state-of-the-art tools and
              equipment to deliver you the best possible service with excellence and precision.
            </p>

            <ul className="space-y-4 mb-10">
              {features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-3 text-brand-dark font-medium">
                  <CheckCircle2 className="text-brand-red w-6 h-6" />
                  {feature}
                </li>
              ))}
            </ul>

            <button className="bg-brand-red text-white px-10 py-4 rounded-sm font-bold hover:bg-red-700 transition-all shadow-lg hover:shadow-red-900/20">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
