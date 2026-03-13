// src/components/sections/ServicesSection.tsx
"use client"

import ServiceCard from "@/components/ui/servicecard"
import { services } from "@/data/services"

export default function ServicesSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="px-6 sm:px-10 md:px-16 lg:px-24 xl:px-32 mx-auto max-w-[1400px]">
        <h2 className="text-3xl font-bold text-center mb-16">Our Services</h2>

        {/* grid with equal-height cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 auto-rows-fr">
          {services.map(service => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>
    </section>
  )
}