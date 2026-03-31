"use client";

import { useRef } from "react";
import { ChevronDown, Camera } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export default function AboutHero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Parallax on background
    gsap.to(bgRef.current, {
      y: 150,
      ease: "none",
      scrollTrigger: {
        trigger: heroRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });

    // Fade out content on scroll
    gsap.to(contentRef.current, {
      y: -60,
      opacity: 0,
      ease: "none",
      scrollTrigger: {
        trigger: heroRef.current,
        start: "top top",
        end: "60% top",
        scrub: true,
      },
    });

    // Entrance animation
    const tl = gsap.timeline({ delay: 0.3 });
    tl.fromTo(
      ".hero-label",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
    );
    tl.fromTo(
      ".hero-title",
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 1, ease: "power3.out" },
      "-=0.4"
    );
    tl.fromTo(
      ".hero-subtitle",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
      "-=0.4"
    );
    tl.fromTo(
      ".hero-scroll-indicator",
      { opacity: 0 },
      { opacity: 1, duration: 0.6, ease: "power2.out" },
      "-=0.2"
    );
  }, { scope: heroRef });

  return (
    <section ref={heroRef} className="about-hero -mt-[112px] md:-mt-[120px]" id="about-hero">
      {/* Background Placeholder */}
      <div ref={bgRef} className="absolute inset-0 -top-[50px]">
        <div className="about-placeholder w-full h-[120%]">
          <Camera className="about-placeholder-icon" size={64} />
          <p className="about-placeholder-label">Hero Banner Photo</p>
          <p className="about-placeholder-sublabel">Recommended: Workshop team or shop exterior</p>
        </div>
      </div>

      {/* Dark Overlay */}
      <div className="about-hero-overlay" />

      {/* Content */}
      <div ref={contentRef} className="about-hero-content max-w-4xl mx-auto pt-[112px] md:pt-[120px]">
        <div className="hero-label flex items-center justify-center gap-3 mb-6 opacity-0">
          <div className="h-[1px] w-12 bg-brand-red" />
          <span className="text-white/70 text-xs font-bold tracking-[0.4em] uppercase">
            Our Story
          </span>
          <div className="h-[1px] w-12 bg-brand-red" />
        </div>

        <h1 className="hero-title text-4xl md:text-6xl lg:text-7xl font-black text-white font-brawler leading-[1.1] tracking-tight mb-6 opacity-0">
          More Than A<br />
          <span className="text-gradient-red">Service Center</span>
        </h1>

        <p className="hero-subtitle text-white/60 text-base md:text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed font-medium opacity-0">
          We fix cars. We rescue communities. We race to win.
          This is the Trufit story.
        </p>

        {/* Scroll Indicator */}
        <div className="hero-scroll-indicator absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-0">
          <span className="text-white/30 text-[10px] font-bold tracking-[0.3em] uppercase">
            Scroll
          </span>
          <ChevronDown className="text-white/40 scroll-indicator" size={20} />
        </div>
      </div>
    </section>
  );
}
