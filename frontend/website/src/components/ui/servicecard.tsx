"use client"

import { Service } from "@/types/services"
import * as LucideIcons from "lucide-react"
import Image from "next/image"

interface ServiceCardProps {
  service: Service
}

export default function ServiceCard({ service }: ServiceCardProps) {
  const Icon = (LucideIcons as Record<string, any>)[service.icon]

  return (
    <div className="relative w-full bg-gradient-to-br from-black/40 to-black/20 dark:from-white/60 dark:to-white/30 backdrop-blur-md border border-white/20 dark:border-white/40 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition duration-300 cursor-pointer">

      {/* image */}
      <div className="relative w-full h-48">
        <Image
          src={service.image}
          alt={service.title}
          fill
          className="object-cover"
        />

        {/* icon */}
        {Icon && (
          <div className="absolute bottom-3 left-3 bg-white/80 dark:bg-black/60 backdrop-blur-md p-2 rounded-full">
            <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
        )}
      </div>

      {/* text */}
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2 text-white dark:text-gray-900">
          {service.title}
        </h3>

        <p className="text-sm text-gray-200 dark:text-gray-700">
          {service.description}
        </p>
      </div>
    </div>
  )
}