"use client";

import { useRef } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import "./services.css";

gsap.registerPlugin(ScrollTrigger);

export default function ServicesHero() {
  const container = useRef<HTMLDivElement>(null);
  const bgImageRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      // Parallax effect for background image
      if (bgImageRef.current && container.current) {
        gsap.to(bgImageRef.current, {
          yPercent: 25,
          ease: "none",
          scrollTrigger: {
            trigger: container.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }

      if (container.current) {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: container.current,
            start: "top bottom",
            toggleActions: "play reverse play reverse",
          },
        });

        if (subtitleRef.current) {
          tl.fromTo(
            subtitleRef.current,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" }
          );
        }

        if (titleRef.current) {
          tl.fromTo(
            titleRef.current,
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.9, ease: "power3.out" },
            "-=0.4"
          );
        }

        if (textRef.current) {
          tl.fromTo(
            textRef.current,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" },
            "-=0.5"
          );
        }

        const scrollIndicator = gsap.utils.toArray(".hero-scroll-indicator");
        if (scrollIndicator.length > 0) {
          tl.fromTo(
            scrollIndicator,
            { opacity: 0 },
            { opacity: 1, duration: 0.6, ease: "power2.out" },
            "-=0.2"
          );
        }
      }
    },
    { scope: container }
  );

  return (
    <section
      ref={container}
      className="relative h-[calc(100vh+112px)] md:h-[calc(100vh+120px)] flex items-center justify-center overflow-hidden -mt-[112px] md:-mt-[120px]"
    >
      {/* Background with Parallax */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div ref={bgImageRef} className="absolute inset-0 -top-24 -bottom-24">
          <Image
            src="/images/services/entrance1.jpg"
            alt="Trufit Auto Center Entrance"
            fill
            className="object-cover object-center"
            priority
          />
        </div>
        {/* Dark overlay matching ContactHero */}
        <div className="absolute inset-0 bg-black/60 z-10" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-6xl mx-auto" style={{ paddingTop: '60px' }}>
        <div 
          ref={subtitleRef}
          className="section-label justify-center opacity-0 mb-6"
        >
          <div className="section-label-line" />
          <span className="section-label-text !text-white/60">
            Official Partner
          </span>
          <div className="section-label-line" />
        </div>
        
        <h1 
          ref={titleRef}
          className="font-semibold text-white leading-[1.1] tracking-tight opacity-0 mb-8"
          style={{ fontSize: 'clamp(2.25rem, 5vw, 5rem)' }}
        >
          Suzuki Authorized <br className="hidden md:block" />
          <span className="text-gradient-red font-semibold">Service Center</span>
        </h1>
        
        <p 
          ref={textRef}
          className="text-white/60 font-medium max-w-3xl mx-auto leading-relaxed opacity-0"
          style={{ fontSize: 'clamp(1rem, 1.3vw, 1.5rem)' }}
        >
          We set the gold standard in automotive care. As an authorized Suzuki 
          Service Center, we provide specialized maintenance that guarantees 
          reliability, safety, and peak performance.
        </p>

        {/* Floating Accent badges could go here if needed, but keeping it clean for Hero */}
      </div>

      {/* Scroll Indicator */}
      <div className="hero-scroll-indicator absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-0 z-10">
        <span className="text-white/30 text-[10px] font-bold tracking-[0.3em] uppercase">
          Scroll
        </span>
        <ChevronDown className="text-white/40 animate-bounce" size={20} />
      </div>

      {/* Bottom transition */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-brand-dark to-transparent z-10" />
    </section>
  );
}
