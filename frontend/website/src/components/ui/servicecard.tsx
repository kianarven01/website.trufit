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
    <div className="group relative w-full bg-white md:bg-transparent md:glass border border-gray-100 md:border-white/60 rounded-sm overflow-hidden transition-all duration-500 hover:shadow-premium hover:-translate-y-2 cursor-pointer shadow-lg md:shadow-[0_15px_50px_-12px_rgba(0,0,0,0.1)]">
      {/* internal background glow - Hidden on mobile for performance */}
      <div className="hidden md:block absolute -bottom-10 -right-10 w-32 h-32 bg-brand-blue/10 rounded-full blur-2xl group-hover:bg-brand-red/20 transition-colors duration-700" />
      
      <div className="relative w-full h-56 md:h-60 overflow-hidden border-b border-white/20">
        {service.image ? (
          <Image
            src={service.image}
            alt={service.title}
            fill
            className="object-cover transition-transform duration-1000 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-brand-dark flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
            {/* Subtle brand glow in placeholder */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(227,27,35,0.05)_0%,transparent_70%)]" />
            
            {Icon && (
              <Icon className="w-12 h-12 text-white/5 mb-4 relative z-10" />
            )}
            <div className="relative z-10">
              <span className="block text-white/10 font-black text-lg tracking-tighter uppercase italic mb-1">Trufit Quality</span>
              <span className="block text-white/5 font-bold uppercase tracking-[0.2em] text-[9px]">Documentation Pending</span>
            </div>
            
            {/* Corner accents */}
            <div className="absolute top-4 left-4 w-8 h-[1px] bg-white/5" />
            <div className="absolute top-4 left-4 w-[1px] h-8 bg-white/5" />
          </div>
        )}
        
        {/* gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/95 via-brand-dark/30 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />

        {/* Floating icon badge */}
        {Icon && (
          <div className="absolute bottom-4 left-4 bg-white/90 md:bg-transparent md:glass p-3 md:p-4 rounded-sm border border-white/50 shadow-xl transition-all duration-500 group-hover:scale-110 group-hover:bg-brand-red group-hover:border-brand-red">
            <Icon className="w-5 h-5 md:w-6 md:h-6 text-brand-blue md:text-white group-hover:text-white" />
          </div>
        )}
      </div>

      {/* content section */}
      <div className="p-6 md:p-8 relative z-10">
        <h3 className="text-lg md:text-xl font-black mb-2 md:mb-3 text-brand-dark group-hover:text-brand-red transition-colors duration-300 uppercase tracking-tight">
          {service.title}
        </h3>

        <p className="text-xs md:text-sm text-gray-600 leading-relaxed line-clamp-2 font-medium">
          {service.description}
        </p>
        
        <div className="mt-6 md:mt-8 flex items-center text-brand-red font-extrabold text-[10px] md:text-[11px] tracking-[0.3em] uppercase">
          Explore Service
          <div className="ml-3 md:ml-4 h-[2px] w-8 md:w-10 bg-brand-red/25 group-hover:w-16 md:group-hover:w-20 group-hover:bg-brand-red transition-all duration-700 ease-out" />
        </div>
      </div>
    </div>
  )
}
