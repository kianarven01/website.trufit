"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import PartnersSection from "@/components/home/partners/PartnersSection";
import AppointmentSection from "@/components/home/appointment/appointment";

gsap.registerPlugin(ScrollTrigger);

export default function HomeCTABlock() {
  const containerRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Linear vertical parallax background only (no 3D tilt/zoom)
      if (bgRef.current && containerRef.current) {
        gsap.fromTo(
          bgRef.current,
          { y: -120 },
          {
            y: 120,
            ease: "none",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      }
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="relative bg-brand-dark overflow-hidden transition-all duration-700"
    >
      {/* Shared Parallax Background Image */}
      <div className="absolute inset-x-0 -top-[15%] h-[130%] z-0">
        <div ref={bgRef} className="absolute inset-0 h-full w-full">
          <Image
            src="/images/home/appointment_partners_image_bg.jpg"
            alt="Partners & Appointment Background"
            fill
            className="object-cover opacity-30 scale-110" // dimming based on Services section
          />
        </div>
        
        {/* Darkening overlay */}
        <div className="absolute inset-0 bg-brand-dark/70" />

        {/* Bottom fade to footer */}
        <div className="absolute inset-x-0 bottom-0 h-96 bg-gradient-to-t from-brand-dark via-brand-dark/20 to-transparent z-1" />
      </div>

      {/* Internal Sections with Transparency */}
      <div className="relative z-10 w-full pt-10">
        <AppointmentSection isTransparent />
        <PartnersSection isTransparent />
      </div>
    </div>
  );
}
