"use client";

import { useRef } from "react";
import ServiceCard from "@/components/ui/servicecard";
import { specializedServices } from "@/data/services-page";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export default function GeneralServices() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const cards = gsap.utils.toArray(".service-card-reveal");
      
      cards.forEach((card: any) => {
        gsap.fromTo(
          card,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 90%",
              toggleActions: "play none none none",
            },
          }
        );
      });
    },
    { scope: container }
  );

  return (
    <section ref={container} className="py-24 md:py-40 bg-gray-50 overflow-hidden px-6 sm:px-10 lg:px-24">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-16 md:mb-24 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-[2px] bg-brand-red" />
            <span className="text-brand-red font-bold text-sm md:text-sm tracking-[0.2em] uppercase">
              Full Spectrum
            </span>
            <div className="w-12 h-[2px] bg-brand-red" />
          </div>
          
          <h2 className="text-5xl md:text-6xl font-black text-brand-dark leading-tight uppercase tracking-tight mb-8">
            Specialized <span className="text-brand-red">& Allied</span> Services
          </h2>
          
          <p className="text-gray-600 text-lg md:text-xl font-medium leading-relaxed max-w-3xl mx-auto">
            From European luxury to heavy-duty American trucks, our facility is equipped 
            to handle every automotive challenge with surgical precision.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {specializedServices.map((service) => (
            <div key={service.id} className="service-card-reveal">
              <ServiceCard service={service} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
