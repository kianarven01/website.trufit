"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { CheckCircle2, Award, Users, Wrench } from "lucide-react"
import { motion, useInView, useAnimation } from "framer-motion"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

interface StatProps {
  icon: React.ReactNode
  value: string
  label: string
}

const StatItem = ({ icon, value, label }: StatProps) => {
  return (
    <div className="flex flex-col items-center p-4 border-r border-gray-100 last:border-0">
      <div className="text-brand-red mb-2">{icon}</div>
      <span className="text-2xl md:text-3xl font-black text-brand-dark">{value}</span>
      <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 text-center">{label}</span>
    </div>
  )
}

export default function AboutSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  
  const stats = [
    { icon: <Award size={24} />, value: "15+", label: "Years Excellence" },
    { icon: <Users size={24} />, value: "5k+", label: "Happy Clients" },
    { icon: <Wrench size={24} />, value: "12+", label: "Master Techs" },
  ]

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        imageRef.current,
        { opacity: 0, x: -60, scale: 0.95 },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 1.5,
          ease: "power4.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
          },
        }
      )

      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
          },
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const features = [
    { title: "OEM-Certified Diagnostic Tools", desc: "Dealership-level precision for all makes." },
    { title: "Genuine & Premium Parts", desc: "We never compromise on your car's integrity." },
    { title: "Transparency Guarantee", desc: "Full reports and photos of every repair." },
  ]

  return (
    <section ref={sectionRef} className="section-padding bg-white overflow-hidden relative" id="about">
      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gray-50/50 -skew-x-12 translate-x-1/2 pointer-events-none" />

      <div className="max-w-[1820px] mx-auto px-6 sm:px-10 lg:px-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24 items-center">
          
          {/* Visual Side */}
          <div ref={imageRef} className="relative">
            {/* Main Image Container */}
            <div className="relative h-[450px] md:h-[600px] w-full shadow-2xl overflow-hidden rounded-sm group">
              <Image
                src="/images/about/workshop.webp"
                alt="Trufit Workshop"
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/40 to-transparent" />
            </div>

            {/* Experience Badge */}
            <div className="absolute -bottom-8 -right-8 md:bottom-12 md:-right-12 bg-brand-red text-white p-8 md:p-10 rounded-sm shadow-2xl flex flex-col items-center justify-center animate-bounce-slow">
              <span className="text-4xl md:text-5xl font-black leading-none">15+</span>
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest mt-2 text-center">Years of<br/>Expertise</span>
            </div>

            {/* Accent Border */}
            <div className="absolute -top-6 -left-6 w-32 h-32 border-t-4 border-l-4 border-brand-red opacity-20" />
          </div>

          {/* Content Side */}
          <div ref={contentRef}>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-[2px] w-12 bg-brand-red" />
              <span className="text-sm font-extrabold tracking-[0.3em] uppercase text-brand-red">
                Trufit Legacy
              </span>
            </div>

            <h2 className="text-4xl md:text-6xl font-black mb-8 font-brawler leading-[1.1] text-brand-dark">
              Precision Engineering <br />
              <span className="text-brand-red underline decoration-brand-red/10 underline-offset-8">Meets Personal Care.</span>
            </h2>

            <p className="text-gray-600 text-lg md:text-xl mb-10 leading-relaxed max-w-2xl">
              At Trufit, we believe your vehicle deserves the same precision as a race car, with the care you'd give your own family. We bridge the gap between technical mastery and honest service.
            </p>

            {/* Benefits List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
              {features.map((feature, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="shrink-0 mt-1">
                    <CheckCircle2 className="text-brand-red w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-dark uppercase text-xs tracking-wider mb-1">{feature.title}</h4>
                    <p className="text-gray-500 text-sm leading-snug">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Performance Stats Row */}
            <div className="grid grid-cols-3 bg-gray-50 rounded-sm mb-12 border border-gray-100">
              {stats.map((stat, idx) => (
                <StatItem key={idx} {...stat} />
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-6">
              <button className="bg-brand-red text-white px-10 py-5 rounded-sm font-bold hover:bg-brand-dark transition-all shadow-xl hover:shadow-brand-red/20 uppercase tracking-widest text-sm">
                Meet the Team
              </button>
              <button className="border-2 border-brand-dark text-brand-dark px-10 py-5 rounded-sm font-bold hover:bg-brand-dark hover:text-white transition-all uppercase tracking-widest text-sm">
                Our Facilities
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
