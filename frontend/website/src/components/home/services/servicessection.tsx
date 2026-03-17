"use client"

import ServiceCard from "@/components/ui/servicecard"
import { services } from "@/data/home-services"

export default function ServicesSection() {
  return (
    <section className="py-24 bg-white">
      <div className="px-6 sm:px-10 lg:px-16 mx-auto max-w-[1400px]">
        {/* subheader and heading */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-[2px] bg-brand-blue" />
            <span className="text-brand-blue font-bold text-xs tracking-[0.2em] uppercase">
              What We Do
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-brand-dark">
            Our Services
          </h2>
          <p className="mt-6 text-gray-500 max-w-2xl leading-relaxed">
            Comprehensive automotive repair powered by state of <br className="hidden md:block" />
            the art tools and decades of expertise
          </p>
        </div>

        {/* services grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map(service => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>
    </section>
  )
}