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
    <div className="group relative w-full glass border border-gray-200/60 rounded-sm overflow-hidden transition-all duration-500 hover:shadow-premium hover:-translate-y-2 cursor-pointer shadow-sm">
      {/* background glow (inside card) */}
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-brand-blue/10 rounded-full blur-2xl group-hover:bg-brand-red/20 transition-colors duration-700" />
      
      {/* image section */}
      <div className="relative w-full h-56 overflow-hidden border-b border-white/10">
        <Image
          src={service.image}
          alt={service.title}
          fill
          className="object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        
        {/* gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/90 via-brand-dark/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />

        {/* Floating icon badge */}
        {Icon && (
          <div className="absolute bottom-4 left-4 glass p-4 rounded-sm border border-white/40 shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:bg-brand-red group-hover:border-brand-red">
            <Icon className="w-6 h-6 text-white" />
          </div>
        )}
      </div>

      {/* content section */}
      <div className="p-8 relative z-10">
        <h3 className="text-xl font-black mb-3 text-brand-dark group-hover:text-brand-red transition-colors duration-300 uppercase tracking-tight">
          {service.title}
        </h3>

        <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 font-medium">
          {service.description}
        </p>
        
        <div className="mt-8 flex items-center text-brand-red font-extrabold text-[10px] tracking-[0.2em] uppercase">
          Explore Service
          <div className="ml-3 h-[2px] w-8 bg-brand-red/20 group-hover:w-16 group-hover:bg-brand-red transition-all duration-700 ease-out" />
        </div>
      </div>
    </div>
  )
}
