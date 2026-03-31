"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export default function ServicesHero() {
  const container = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container.current,
          start: "top bottom", // Guaranteed to trigger when page loads at top
          toggleActions: "play reverse play reverse",
        },
      });

      tl.fromTo(
        subtitleRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
      )
      .fromTo(
        titleRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power4.out" },
        "-=0.5"
      )
      .fromTo(
        textRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
        "-=0.6"
      );
    },
    { scope: container }
  );

  return (
    <section
      ref={container}
      className="relative h-[80vh] md:h-[70vh] w-full flex items-center justify-center overflow-hidden bg-brand-dark -mt-[112px] md:-mt-[120px]"
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/suzuki-banner.jpg"
          alt="Suzuki Authorized Service Center"
          fill
          className="object-cover opacity-50"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/80 via-transparent to-brand-dark/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto pt-24 md:pt-32">
        <div 
          ref={subtitleRef}
          className="flex items-center justify-center gap-3 mb-6"
        >
          <div className="w-8 md:w-12 h-[2px] bg-brand-red" />
          <span className="text-brand-red font-bold text-xs md:text-base tracking-[0.3em] uppercase">
            Official Partner
          </span>
          <div className="w-8 md:w-12 h-[2px] bg-brand-red" />
        </div>
        
        <h1 
          ref={titleRef}
          className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-white leading-tight uppercase tracking-tighter"
        >
          Suzuki Authorized <br className="hidden md:block" />
          <span className="text-brand-red">Service Center</span>
        </h1>
        
        <p 
          ref={textRef}
          className="mt-8 text-gray-300 text-base md:text-xl max-w-2xl mx-auto font-medium"
        >
          World-class maintenance and repair for your Suzuki vehicle, 
          powered by genuine parts and factory-trained technicians.
        </p>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-brand-dark to-transparent z-10" />
    </section>
  );
}
