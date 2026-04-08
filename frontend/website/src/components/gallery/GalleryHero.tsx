"use client";

import { useRef } from "react";
import Image from "next/image";
import { Image as ImageIcon } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

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

    gsap.to(".parallax-bg", {
      yPercent: 30,
      ease: "none",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });
  }, { scope: containerRef });

  return (
    <section 
      ref={containerRef}
      className="relative pt-[200px] md:pt-[240px] pb-20 bg-brand-dark overflow-hidden -mt-[112px] md:-mt-[120px] min-h-[70vh] flex items-center"
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="parallax-bg absolute top-[-20%] left-0 w-full h-[140%]">
          <Image 
              src="/images/gallery/tools.jpg"
              alt="Trufit Precision Laboratory"
              fill
              priority
              className="object-cover opacity-40"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/80 via-brand-dark/40 to-brand-dark" />
      </div>



      <div className="max-w-[1820px] mx-auto px-6 sm:px-10 lg:px-16 relative z-10 w-full">
        <div className="flex flex-col md:flex-row items-end justify-between gap-8 text-shadow-lg">
          <div ref={textRef} className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6 hero-reveal">
              <div className="h-[2px] w-12 bg-brand-red" />
              <span className="text-sm font-semibold tracking-[0.3em] uppercase text-brand-red">
                Visual Showcase
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-semibold text-white mb-6 uppercase tracking-tight hero-reveal leading-none">
              Witness Our <br />
              <span className="text-brand-red">Precision</span>
            </h1>

            <p className="text-white/80 text-lg md:text-xl max-w-xl hero-reveal font-medium leading-relaxed">
              Explore our state-of-the-art facility and the advanced diagnostic 
              technologies that set Trufit Auto Center apart.
            </p>
          </div>


        </div>
      </div>

      {/* Decorative line */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </section>
  );
}
