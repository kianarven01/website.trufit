"use client"

import { Service } from "@/types/services"
import * as LucideIcons from "lucide-react"
import Image from "next/image"

interface ServiceCardProps {
  service: Service
}

export default function ServiceCard({ service }: ServiceCardProps) {
  // 1. Check if the icon is a custom image path or a Lucide icon name
  const isImagePath = service.icon.startsWith("/");
  
  // 2. Resolve the Lucide icon only if it's NOT an image path
  const Icon = !isImagePath 
    ? (LucideIcons as unknown as Record<string, React.ElementType>)[service.icon]
    : null;

  return (
    <div className="group relative w-full bg-white border border-gray-100 rounded-sm overflow-hidden transition-all duration-500 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-2 cursor-pointer shadow-sm">
      
      <div className="hidden md:block absolute -bottom-10 -right-10 w-32 h-32 bg-brand-red/10 rounded-full blur-2xl group-hover:bg-brand-red/20 transition-colors duration-700" />
      {/* Subtle brand red accent on hover */}
      <div className="absolute top-0 left-0 w-[3px] h-0 bg-brand-red group-hover:h-full transition-all duration-500 z-20" />
      
      <div className="relative w-full h-56 md:h-64 overflow-hidden">
        {service.image ? (
          <Image
            src={service.image}
            alt={service.title}
            fill
            priority 
            unoptimized
            className="object-cover transition-transform duration-1000 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-brand-dark flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(227,27,35,0.05)_0%,transparent_70%)]" />
            
            {/* Background Placeholder Icon (Dynamic) */}
            <div className="relative w-16 h-16 mb-4 opacity-10 z-10 text-white">
              {isImagePath ? (
                <Image src={service.icon} alt="" fill className="object-contain brightness-0 invert" />
              ) : (
                Icon && <Icon className="w-full h-full" />
              )}
            </div>

            <div className="relative z-10">
              <span className="block text-white/10 font-black text-lg tracking-tighter uppercase italic mb-1">Trufit Quality</span>
              <span className="block text-white/5 font-bold uppercase tracking-[0.2em] text-[9px]">Documentation Pending</span>
            </div>
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/90 via-brand-dark/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />

        {/* Floating icon badge */}
        <div className="absolute bottom-5 left-5 bg-white p-3 md:p-4 rounded-sm shadow-xl transition-all duration-500 group-hover:bg-brand-red">
          {isImagePath ? (
            <div className="relative w-5 h-5 md:w-6 md:h-6 group-hover:brightness-0 group-hover:invert transition-all">
              <Image src={service.icon} alt={service.title} fill className="object-contain" />
            </div>
          ) : (
            Icon && <Icon className="w-5 h-5 md:w-6 md:h-6 text-brand-red group-hover:text-white transition-colors" />
          )}
        </div>
      </div>

      <div className="p-8 relative z-10">
        <h3 className="text-lg md:text-xl font-semibold mb-3 text-brand-dark group-hover:text-brand-red transition-colors duration-300 uppercase tracking-tight">
          {service.title}
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 font-medium">
          {service.description}
        </p>
        
        <div className="mt-8 flex items-center text-brand-red font-bold text-[11px] tracking-[0.25em] uppercase transition-all duration-500 group-hover:tracking-[0.35em]">
          Learn More
          <div className="ml-4 h-[2px] w-8 bg-brand-red/20 group-hover:w-16 group-hover:bg-brand-red transition-all duration-700 ease-out" />
        </div>
      </div>
    </div>
  )
}
