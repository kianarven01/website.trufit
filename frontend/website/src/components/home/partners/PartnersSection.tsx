"use client";

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from "@gsap/react";

const PARTNERS = [
  { name: 'Frontrunner', logo: '/images/partners/frontrunner.webp' },
  { name: 'Splitfire', logo: '/images/partners/splitfire.webp' }, 
  { name: 'Total Hitch', logo: '/images/partners/totalhitch.webp' },
  { name: 'Tough Dog', logo: '/images/partners/toughdog.webp' },
  { name: 'Trail Gecko', logo: '/images/partners/trailgecko.webp' },
  { name: 'Valvoline', logo: '/images/partners/valvoline.webp' },
  { name: 'Wurth', logo: '/images/partners/wurth.webp' },
];
 
interface PartnersSectionProps {
  isTransparent?: boolean;
}

export default function PartnersSection({ isTransparent = false }: PartnersSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null); // Added for the observer
  const sliderRef = useRef<HTMLDivElement>(null);
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const [shouldStart, setShouldStart] = useState(false);

  // Intersection Observer for Reveal Animation
  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 85%",
        toggleActions: "play none none reverse",
      }
    });

    // Header Reveal
    tl.to(".partners-header > *", {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: "power3.out",
    })
    // Slider Reveal
    .to(".partners-slider", {
      opacity: 1,
      x: 0,
      duration: 0.8,
      ease: "power2.out",
    }, "-=0.4");

  }, { scope: sectionRef });

  // Infinite Slider Logic
  useEffect(() => {
    const timer = setTimeout(() => setShouldStart(true), 1500); 
    if (imagesLoaded >= PARTNERS.length * 3) setShouldStart(true);
    return () => clearTimeout(timer);
  }, [imagesLoaded]);

  useGSAP(() => {
    if (!shouldStart) return;

    const slider = sliderRef.current;
    if (!slider) return;

    gsap.killTweensOf(slider);

    const totalWidth = slider.scrollWidth / 3;

    gsap.to(slider, {
      x: -totalWidth,
      duration: 25,
      ease: "none",
      repeat: -1,
      modifiers: {
        x: gsap.utils.unitize((x) => parseFloat(x) % totalWidth)
      }
    });
  }, { dependencies: [shouldStart], scope: sectionRef });

  return (
    <section 
      ref={sectionRef} 
      className={`w-full py-10 md:py-16 overflow-hidden ${isTransparent ? 'bg-transparent text-white' : 'bg-white border-y border-gray-100'}`}
    >
      {/* HEADER SECTION - Keeps vertical state */}
      <div className="flex flex-col items-center mb-8 md:mb-12 partners-header">
        <h3 className={`text-center text-sm font-bold tracking-widest uppercase opacity-0 translate-y-12 ${isTransparent ? 'text-white/60' : 'text-gray-400'}`}>
          Our Trusted Partners
        </h3>
        {/* Dash */}
        <div className={`mt-2 h-[2px] w-8 rounded-full opacity-0 translate-y-12 ${isTransparent ? 'bg-white/20' : 'bg-gray-200'}`}></div>
      </div>
      
      {/* Slider Wrapper - Initial state changed to translate-x for Right-to-Left reveal */}
      <div className="relative flex w-full overflow-hidden partners-slider opacity-0 translate-x-24">
        <div 
          ref={sliderRef} 
          className="flex flex-nowrap items-center whitespace-nowrap"
        >
          {[...PARTNERS, ...PARTNERS, ...PARTNERS].map((partner, index) => (
            <div 
              key={index} 
              className={`w-[180px] md:w-[260px] h-[110px] md:h-[140px] flex items-center justify-center px-4 md:px-8 flex-shrink-0 transition-transform ${
                isTransparent 
                  ? 'bg-white rounded-sm mx-3 shadow-lg' 
                  : ''
              }`}
            >
              <img
                src={partner.logo}
                alt={partner.name}
                onLoad={() => setImagesLoaded(prev => prev + 1)}
                onError={() => setImagesLoaded(prev => prev + 1)}
                className="h-14 md:h-20 w-auto object-contain pointer-events-none"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}