"use client";

import { useRef } from "react";
import { vehicleBrands } from "@/data/services-page";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export default function VehicleBrands() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        ".brand-name",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.05,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: container.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );
    },
    { scope: container }
  );

  return (
    <section ref={container} className="py-24 md:py-40 bg-brand-dark overflow-hidden px-6 sm:px-10 lg:px-24 border-t border-white/5">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-20 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-[2px] bg-brand-red" />
            <span className="text-brand-red font-bold text-sm md:text-sm tracking-[0.2em] uppercase">
              Brand Compatibility
            </span>
            <div className="w-12 h-[2px] bg-brand-red" />
          </div>
          
          <h2 className="text-5xl md:text-6xl font-black text-white leading-tight uppercase tracking-tight mb-8">
            Expertise Across <span className="text-brand-red">All Major Brands</span>
          </h2>
          
          <p className="text-gray-400 text-lg md:text-xl font-medium leading-relaxed max-w-3xl mx-auto">
            Our multi-brand diagnostic systems and specialized training allow us to 
            service almost any vehicle on the road today.
          </p>
        </div>

        {/* Dynamic Grid of Brands */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 md:gap-10">
          {vehicleBrands.map((brand, i) => (
            <div 
              key={i}
              className="brand-name group relative flex items-center justify-center p-6 bg-white/5 border border-white/10 rounded-sm hover:bg-brand-red hover:border-brand-red hover:-translate-y-1 transition-all duration-300 cursor-default"
            >
              <span className="text-gray-400 group-hover:text-white font-black text-lg md:text-xl uppercase tracking-tighter transition-colors duration-300">
                {brand}
              </span>
              
              {/* Background Glow */}
              <div className="absolute inset-0 bg-brand-red/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity pointer-events-none" />
            </div>
          ))}
        </div>

        {/* SEO Hint / CTA */}
        <div className="mt-20 text-center">
          <p className="text-gray-500 font-bold text-base tracking-widest uppercase">
            Don't see your brand? <a href="/contact" className="text-white hover:text-brand-red underline underline-offset-4 decoration-brand-red/50 transition-colors">Contact us</a> to inquire about specific model support.
          </p>
        </div>
      </div>
    </section>
  );
}
