"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronRight, Image as ImageIcon } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function GalleryHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline();
    
    tl.fromTo(
      ".hero-reveal",
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, stagger: 0.2, ease: "power3.out" }
    );
  }, { scope: containerRef });

  return (
    <section 
      ref={containerRef}
      className="relative pt-[200px] md:pt-[240px] pb-20 bg-brand-dark overflow-hidden -mt-[112px] md:-mt-[120px]"
    >
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_30%,rgba(227,27,35,0.2),transparent_70%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_70%,rgba(227,27,35,0.1),transparent_70%)]" />
      </div>

      <div className="max-w-[1820px] mx-auto px-6 sm:px-10 lg:px-16 relative z-10">
        <div className="flex flex-col md:flex-row items-end justify-between gap-8">
          <div ref={textRef} className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6 hero-reveal">
              <div className="h-[2px] w-12 bg-brand-red" />
              <span className="text-sm font-semibold tracking-[0.3em] uppercase text-brand-red">
                Visual Showcase
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-semibold text-white mb-6 uppercase tracking-tight hero-reveal leading-none">
              Witness Our <br />
              <span className="text-brand-red">Precision</span>
            </h1>

            <p className="text-white/60 text-lg md:text-xl max-w-xl hero-reveal font-medium leading-relaxed">
              Explore our state-of-the-art facility and the advanced diagnostic 
              technologies that set Trufit Auto Center apart.
            </p>
          </div>

          <div className="hidden lg:flex flex-col items-end hero-reveal">
            <div className="flex items-center gap-4 text-white/20 mb-2">
              <ImageIcon size={48} strokeWidth={1} />
              <div className="text-right">
                <span className="block text-4xl font-semibold leading-none uppercase">GLLRY</span>
                <span className="text-[10px] uppercase tracking-[0.5em] font-semibold">Showcase v1.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative line */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </section>
  );
}
