"use client";

import { useRef } from "react";
import { vehicleBrands } from "@/data/services-page";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import "./services.css";

gsap.registerPlugin(ScrollTrigger);

interface VehicleBrandsProps {
  isTransparent?: boolean;
}

export default function VehicleBrands({ isTransparent = false }: VehicleBrandsProps) {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        ".brand-item",
        { opacity: 0, y: 15 },
        {
          opacity: 1, 
          y: 0, 
          stagger: 0.02, 
          duration: 0.8, 
          ease: "power3.out",
          scrollTrigger: { 
            trigger: container.current, 
            start: "top 85%" 
          },
        }
      );
    },
    { scope: container }
  );

  return (
    <section 
      ref={container} 
      className={`relative py-20 md:py-32 overflow-hidden px-6 sm:px-10 lg:px-24 ${
        isTransparent ? "bg-transparent border-none" : "bg-brand-dark border-t border-white/5"
      }`}
    >
      <div className="max-w-[1400px] mx-auto relative z-10">
        <div className="mb-16 md:mb-24 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-[1px] bg-brand-red/50" />
            <span className="text-xs font-bold tracking-[0.4em] uppercase text-brand-red">
              Brand Compatibility
            </span>
            <div className="w-12 h-[1px] bg-brand-red/50" />
          </div>
          
          <h2 className="text-3xl md:text-5xl font-semibold text-white leading-tight uppercase tracking-tight mb-6">
            Expertise Across <span className="text-gradient-red font-bold">All Major Brands</span>
          </h2>
          
          <p className="text-gray-400 text-sm md:text-lg font-medium leading-relaxed max-w-3xl mx-auto opacity-70">
            From legendary Japanese engineering to European luxury and high-performance 
            electric vehicles. We provide specialized care for every major manufacturer.
          </p>
        </div>

        {/* Responsive Layout: Flex-Wrap for Mobile (Compact), Grid for Desktop */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-6 md:grid md:grid-cols-4 lg:grid-cols-6 md:gap-x-12 md:gap-y-16">
          {vehicleBrands.map((brand, i) => (
            <div 
              key={i}
              className="brand-item flex items-center justify-center text-center py-1 px-2 md:py-2 md:px-0"
            >
              <span className="text-white font-bold text-[10px] sm:text-xs md:text-sm uppercase tracking-[0.2em] md:tracking-[0.3em] cursor-default whitespace-nowrap">
                {brand}
              </span>
            </div>
          ))}
        </div>

        {/* Minimalist CTA */}
        <div className="mt-20 md:mt-32 text-center">
          <p className="text-gray-600 font-bold text-[10px] tracking-[0.3em] uppercase">
            Don&apos;t see your brand? 
            <a href="/contact" className="ml-3 text-white/50 hover:text-brand-red border-b border-white/10 hover:border-brand-red transition-all pb-1">
              Contact Us
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
