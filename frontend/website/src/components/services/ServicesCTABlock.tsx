"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import VehicleBrands from "./VehicleBrands";
import AppointmentSection from "@/components/home/appointment/appointment";

gsap.registerPlugin(ScrollTrigger);

export default function ServicesCTABlock() {
  const containerRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Shared parallax background
      gsap.fromTo(
        bgRef.current,
        { y: -80 },
        {
          y: 80,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="relative bg-brand-dark overflow-hidden transition-all duration-700"
    >
      {/* Shared Background Image */}
      <div className="absolute inset-x-0 -top-[10%] h-[120%] z-0 overflow-hidden">
        <div ref={bgRef} className="absolute inset-0 h-full w-full">
          <Image
            src="/images/services/brands.jpg"
            alt="Brands Background"
            fill
            className="object-cover opacity-25"
          />
        </div>
        
        {/* Darkening overlay */}
        <div className="absolute inset-0 bg-brand-dark/70" />

        {/* Bottom fade to footer */}
        <div className="absolute inset-x-0 bottom-0 h-96 bg-gradient-to-t from-brand-dark via-brand-dark/20 to-transparent z-1" />
      </div>

      {/* Internal Sections with Transparency */}
      <div className="relative z-10">
        <VehicleBrands isTransparent />
        <AppointmentSection isTransparent />
      </div>
    </div>
  );
}
