"use client"

import { Service } from "@/types/services"
import * as LucideIcons from "lucide-react"
import Image from "next/image"

interface ServiceCardProps {
  service: Service
}

export default function ServiceCard({ service }: ServiceCardProps) {
  const Icon = (LucideIcons as unknown as Record<string, React.ElementType>)[service.icon]

  return (
    <div className="group relative w-full bg-white border border-gray-100 rounded-sm overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer">
      {/* image */}
      <div className="relative w-full h-52 overflow-hidden">
        <Image
          src={service.image}
          alt={service.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* subtle overlay */}
        <div className="absolute inset-0 bg-brand-dark/10 group-hover:bg-transparent transition-colors duration-300" />

        {/* white icon box (glass design) */}
        {Icon && (
          <div className="absolute top-0 left-0 bg-white p-4 rounded-ee-sm shadow-sm transition-transform duration-300 group-hover:scale-110 origin-top-left">
            <Icon className="w-6 h-6 text-brand-blue" />
          </div>
        )}
      </div>

      {/* content */}
      <div className="p-8">
        <h3 className="text-xl font-black mb-3 text-brand-dark group-hover:text-brand-red transition-colors duration-300">
          {service.title}
        </h3>

        <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
          {service.description}
        </p>
        
        <div className="mt-6 flex items-center text-brand-red font-bold text-[10px] tracking-widest uppercase">
          Read More
          <div className="ml-2 h-[1px] w-6 bg-brand-red/30 group-hover:w-12 group-hover:bg-brand-red transition-all duration-500" />
        </div>
      </div>
    </div>
  )
}