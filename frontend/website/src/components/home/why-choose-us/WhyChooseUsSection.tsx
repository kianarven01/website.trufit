"use client"

import { useRef, useEffect } from "react"
import { ShieldCheck, Leaf, Award, Heart } from "lucide-react"
import gsap from "gsap"

const features = [
  {
    icon: <ShieldCheck className="w-10 h-10 text-brand-red" />,
    title: "DTI Certified",
    description: "DTI 5-star accreditation, a distinction that guarantees you world-class technical expertise, fair pricing, and a commitment to consumer rights that sets the gold standard for automotive service.",
  },
  {
    icon: <Leaf className="w-10 h-10 text-brand-red" />,
    title: "ECO Friendly",
    description: "We prioritize sustainable shop practices and precision diagnostics to maximize your vehicle's efficiency, ensuring a smaller carbon footprint and a cleaner road ahead.",
  },
  {
    icon: <Award className="w-10 h-10 text-brand-red" />,
    title: "Quality Guarantee",
    description: "We back every repair with a quality guarantee and a comprehensive warranty, giving you the peace of mind that we stand firmly behind our craftsmanship and the premium parts we install.",
  },
  {
    icon: <Heart className="w-10 h-10 text-brand-red" />,
    title: "Customer First",
    description: "We place your needs at the heart of every service, ensuring transparent communication and personalized solutions that make your safety and satisfaction our absolute priority.",
  },
]

export default function WhyChooseUsSection() {
  const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Section Header Reveal
          gsap.to(".why-header > *", {
            opacity: 1,
            y: 0,
            duration: 1,
            stagger: 0.2,
            ease: "power3.out",
            overwrite: "auto"
          })

          // Features Grid Reveal
          gsap.to(".why-feature", {
            opacity: 1,
            y: 0,
            duration: 1,
            stagger: 0.15,
            ease: "power2.out",
            delay: 0.4,
            overwrite: "auto"
          })
        } else {
          // Reverss
          gsap.to(".why-header > *", { opacity: 0, y: 50, duration: 0.5, overwrite: "auto" })
          gsap.to(".why-feature", { opacity: 0, y: 60, duration: 0.5, overwrite: "auto" })
        }
      },
      { threshold: 0.15 }
    )

    if (container.current) {
      observer.observe(container.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={container} className="section-padding bg-white overflow-hidden" id="why-choose-us">
      <div className="max-w-[1820px] mx-auto px-6 sm:px-10 lg:px-16">
        <div className="text-center mb-20 why-header">
          <div className="flex items-center justify-center gap-2 mb-4 opacity-0 translate-y-12">
            <div className="h-[2px] w-8 bg-brand-red" />
            <span className="text-xs font-semibold tracking-[0.3em] uppercase text-brand-red">
              Why Choose Us
            </span>
            <div className="h-[2px] w-8 bg-brand-red" />
          </div>
          <h2 className="text-3xl md:text-5xl font-semibold text-brand-dark opacity-0 translate-y-12">Built on Trust & Precision</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 why-grid">
          {features.map((feature, idx) => (
            <div key={idx} className="why-feature flex flex-col items-center text-center group opacity-0 translate-y-12">
              <div className="mb-6 p-4 rounded-full bg-red-50 transition-transform duration-300 group-hover:scale-110">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-4 text-brand-dark">{feature.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
