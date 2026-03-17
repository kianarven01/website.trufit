"use client"

import { Service } from "@/types/services"
import * as LucideIcons from "lucide-react"
import Image from "next/image"

interface ServiceCardProps {
  service: Service
}

export default function ServiceCard({ service }: ServiceCardProps) {
  const Icon = (LucideIcons as Record<string, React.ElementType>)[service.icon]

  return (
    <div className="group relative w-full bg-white border border-gray-100 rounded-sm overflow-hidden transition-all duration-300 hover:shadow-premium cursor-pointer">
      {/* image */}
      <div className="relative w-full h-56 overflow-hidden">
        <Image
          src={service.image}
          alt={service.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* overlay */}
        <div className="absolute inset-0 bg-brand-dark/20 group-hover:bg-transparent transition-colors duration-300" />

        {/* glass icon */}
        {Icon && (
          <div className="absolute top-4 left-4 glass p-3 rounded-sm border border-white/20">
            <Icon className="w-6 h-6 text-brand-blue" />
          </div>
        )}
      </div>

      {/* content */}
      <div className="p-6">
        <h3 className="text-xl font-bold mb-3 text-brand-dark group-hover:text-brand-red transition-colors duration-300">
          {service.title}
        </h3>

        <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">
          {service.description}
        </p>
        
        <div className="mt-6 flex items-center text-brand-red font-bold text-xs tracking-widest uppercase">
          Read More
          <div className="ml-2 h-[1px] w-0 group-hover:w-8 bg-brand-red transition-all duration-300" />
        </div>
      </div>
    </div>
  )
}