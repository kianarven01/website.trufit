"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import VisionMissionValues from "./VisionMissionValues";
import AboutCTA from "./AboutCTA";

gsap.registerPlugin(ScrollTrigger);

export default function FoundationBlock() {
  const containerRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Parallax on shared background - spans both internal sections
      gsap.fromTo(
        bgRef.current,
        { y: -60 },
        {
          y: 60,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    },
    { scope: containerRef },
  );

  return (
    <div
      ref={containerRef}
      className="relative bg-brand-dark overflow-hidden transition-all duration-700"
    >
      {/* Shared Background Image with centered offset to eliminate boundary gaps */}
      <div className="absolute inset-x-0 -top-[10%] h-[120%] z-0 overflow-hidden">
        <div ref={bgRef} className="absolute inset-0 h-full w-full">
          <img
            src="/images/about/foundation.jpg"
            alt="Foundation Background"
            className="w-full h-full object-cover opacity-30"
          />
        </div>
        {/* Uniform darkening overlay */}
        <div className="absolute inset-0 bg-brand-dark/60" />

        {/* Bottom fade to footer - only at the very end of the block */}
        <div className="absolute inset-x-0 bottom-0 h-96 bg-gradient-to-t from-brand-dark via-brand-dark/20 to-transparent z-1" />
      </div>

      {/* Decorative Gradients (Moved from VisionMissionValues to cover the whole block) */}
      <div className="absolute inset-0 pointer-events-none select-none z-1">
        <div className="absolute top-1/4 -left-40 w-[600px] h-[600px] bg-brand-blue/[0.04] rounded-full blur-[130px]" />
        <div className="absolute bottom-1/4 -right-40 w-[500px] h-[500px] bg-brand-red/[0.03] rounded-full blur-[110px]" />
      </div>

      <div className="relative z-10">
        <VisionMissionValues isTransparent />
        <AboutCTA isTransparent />
      </div>
    </div>
  );
}
