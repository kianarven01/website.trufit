"use client";

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

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
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Header Reveal (Keeps original vertical reveal)
          gsap.to(".partners-header > *", {
            opacity: 1,
            y: 0,
            duration: 1,
            stagger: 0.2,
            ease: "power3.out",
            overwrite: "auto"
          })

          // Slider Reveal (Updated to Right to Left)
          gsap.to(".partners-slider", {
            opacity: 1,
            x: 0, // Moves to center
            duration: 1,
            ease: "power2.out",
            delay: 0.4,
            overwrite: "auto"
          })
        } else {
          // Reset
          gsap.to(".partners-header > *", { opacity: 0, y: 50, duration: 0.5, overwrite: "auto" })
          gsap.to(".partners-slider", { opacity: 0, x: 100, duration: 0.5, overwrite: "auto" })
        }
      },
      { threshold: 0.15 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  // Infinite Slider Logic
  useEffect(() => {
    const timer = setTimeout(() => setShouldStart(true), 1500); 
    if (imagesLoaded >= PARTNERS.length * 3) setShouldStart(true);
    return () => clearTimeout(timer);
  }, [imagesLoaded]);

  useEffect(() => {
    if (!shouldStart) return;

    const slider = sliderRef.current;
    if (!slider) return;

    gsap.killTweensOf(slider);

    const totalWidth = slider.scrollWidth / 3;

    const ctx = gsap.context(() => {
      gsap.to(slider, {
        x: -totalWidth,
        duration: 25,
        ease: "none",
        repeat: -1,
        modifiers: {
          x: gsap.utils.unitize((x) => parseFloat(x) % totalWidth)
        }
      });
    });

    return () => ctx.revert();
  }, [shouldStart]);

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
              className="w-[140px] md:w-[200px] h-[80px] md:h-[100px] flex items-center justify-center px-4 md:px-8 flex-shrink-0"
            >
              <img
                src={partner.logo}
                alt={partner.name}
                onLoad={() => setImagesLoaded(prev => prev + 1)}
                onError={() => setImagesLoaded(prev => prev + 1)}
                className="h-10 md:h-12 w-auto object-contain pointer-events-none"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}