"use client";

import { useRef, useEffect, useMemo } from "react";
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Desktop Bento Logic (8-item repeating pattern)
  const getBentoClass = (index: number) => {
    const i = index % 8;
    if (i === 0) return "col-span-2 md:col-span-2 md:row-span-1";
    if (i === 3) return "col-span-2 md:col-span-2";
    return "col-span-1 row-span-1";
  };

  // Mobile Gapless Bento Logic: 
  // We want to ensure each "column" in our 3-row, grid-flow-col layout is exactly 3 rows high.
  const mobileBentoGroups = useMemo(() => {
    const duplicated = [...vehicleBrands, ...vehicleBrands, ...vehicleBrands]; // Triple for endless feel
    let groups: { name: string; rowSpan: string; colSpan: string }[] = [];
    
    // Balanced patterns that fill 3 rows exactly
    const patterns = [
      [{ rs: 2, cs: 1 }, { rs: 1, cs: 1 }], // Col 1: 2+1
      [{ rs: 1, cs: 1 }, { rs: 1, cs: 1 }, { rs: 1, cs: 1 }], // Col 2: 1+1+1
      [{ rs: 1, cs: 1 }, { rs: 2, cs: 1 }], // Col 3: 1+2
      [{ rs: 3, cs: 1 }], // Col 4: 3
    ];

    let patternIdx = 0;
    let brandIdx = 0;

    while (brandIdx < duplicated.length) {
      const currentPattern = patterns[patternIdx % patterns.length];
      for (const p of currentPattern) {
        if (brandIdx < duplicated.length) {
          groups.push({
            name: duplicated[brandIdx],
            rowSpan: p.rs === 1 ? "row-span-1" : p.rs === 2 ? "row-span-2" : "row-span-3",
            colSpan: p.cs === 1 ? "w-[120px]" : "w-[240px]",
          });
          brandIdx++;
        }
      }
      patternIdx++;
    }
    return groups;
  }, [vehicleBrands]);

  useGSAP(
    () => {
      if (window.innerWidth >= 1024) {
        gsap.fromTo(
          ".brand-card",
          { opacity: 0, y: 20 },
          {
            opacity: 1, y: 0, stagger: 0.03, duration: 0.8, ease: "power2.out",
            scrollTrigger: { trigger: container.current, start: "top 80%" },
          }
        );
      }
    },
    { scope: container }
  );

  // Seamless "Endless" Manual Loop logic
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;
      
      // If reached near the end, jump back to the middle
      if (scrollLeft + clientWidth >= scrollWidth - 10) {
        scrollContainer.scrollLeft = scrollWidth / 3;
      }
      // If reached near the start, jump to the middle
      if (scrollLeft <= 5) {
        scrollContainer.scrollLeft = scrollWidth / 3;
      }
    };

    // Initial position in the middle set of duplicates
    scrollContainer.scrollLeft = scrollContainer.scrollWidth / 3;
    
    scrollContainer.addEventListener("scroll", handleScroll);
    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section 
      ref={container} 
      className={`relative py-16 md:py-24 overflow-hidden px-6 sm:px-10 lg:px-24 ${
        isTransparent ? "bg-transparent border-none" : "bg-brand-dark border-t border-white/5"
      }`}
    >
      <div className="max-w-[1400px] mx-auto relative z-10">
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-[2px] bg-brand-red" />
            <span className="text-brand-red font-bold text-[10px] md:text-xs tracking-[0.3em] uppercase">
              Brand Compatibility
            </span>
            <div className="w-12 h-[2px] bg-brand-red" />
          </div>
          
          <h2 className="text-3xl md:text-5xl font-semibold text-white leading-tight uppercase tracking-tight mb-4">
            Expertise Across <span className="text-gradient-red font-bold">All Major Brands</span>
          </h2>
          
          <p className="text-gray-400 text-sm md:text-base font-medium leading-relaxed max-w-2xl mx-auto">
            From legendary Japanese engineering to European luxury and the latest 
            high-performance electrics/hybrids.
          </p>
        </div>

        {/* MOBILE: Gapless 3-Row Endless Bento Grid */}
        <div className="lg:hidden relative">
          <div className="absolute left-0 top-0 bottom-0 w-16 z-20 bg-gradient-to-r from-brand-dark via-brand-dark/50 to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 z-20 bg-gradient-to-l from-brand-dark via-brand-dark/50 to-transparent pointer-events-none" />
          
          <div 
            ref={scrollContainerRef}
            className="grid grid-rows-3 grid-flow-col gap-1 overflow-x-auto no-scrollbar snap-x snap-proximity"
          >
            {mobileBentoGroups.map((item, i) => (
              <div 
                key={i}
                className={`snap-start flex-shrink-0 flex items-center justify-center text-center p-3 bg-white/5 border border-white/10 rounded-sm hover:bg-brand-red/20 transition-all duration-300 ${item.rowSpan} ${item.colSpan}`}
              >
                <span className="text-white font-bold text-[10px] uppercase tracking-tighter leading-tight">
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* DESKTOP: Compact Bento Grid */}
        <div className="hidden lg:grid grid-cols-6 gap-2 auto-rows-[60px]">
          {vehicleBrands.map((brand, i) => (
            <div 
              key={i}
              className={`brand-card group relative flex items-center justify-center p-3 bg-white/5 border border-white/10 rounded-sm hover:bg-brand-red hover:border-brand-red transition-all duration-300 cursor-default ${getBentoClass(i)}`}
            >
              <span className="relative z-10 text-gray-400 group-hover:text-white font-bold text-xs uppercase tracking-tighter transition-colors duration-300">
                {brand}
              </span>
              
              <div className="absolute inset-0 bg-brand-red/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 font-bold text-[10px] tracking-[0.2em] uppercase">
            Don&apos;t see your brand? <a href="/contact" className="text-white hover:text-brand-red underline underline-offset-4 decoration-brand-red/50 transition-colors">Contact us</a>
          </p>
        </div>
      </div>
    </section>
  );
}
