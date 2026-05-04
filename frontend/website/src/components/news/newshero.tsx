// src/components/news/newshero.tsx
"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function NewsHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      
      tl.fromTo(
        ".hero-reveal",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, stagger: 0.2, ease: "power3.out" }
      );

      tl.fromTo(
        ".hero-scroll-indicator",
        { opacity: 0 },
        { opacity: 1, duration: 0.6, ease: "power2.out" },
        "-=0.2"
      );

      // Parallax Effect
      gsap.to(".hero-bg-parallax", {
        yPercent: 20,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={containerRef}
      className="relative h-[calc(100vh+112px)] md:h-[calc(100vh+120px)] bg-brand-dark overflow-hidden -mt-[112px] md:-mt-[120px] flex items-center justify-center"
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 hero-bg-parallax scale-110">
          <Image 
              src="/images/news/news_hero.webp"
              alt="Trufit News and Articles"
              fill
              priority
              className="object-cover opacity-30"
              sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/80 via-brand-dark/40 to-brand-dark" />
      </div>

      <div className="container relative z-10 w-full text-center" style={{ paddingTop: '60px' }}>
        <div ref={textRef} className="max-w-4xl mx-auto flex flex-col items-center">
          <div className="flex items-center gap-3 mb-6 hero-reveal">
            <div className="h-[2px] w-12 bg-brand-red" />
            <span className="text-xs font-semibold tracking-[0.3em] uppercase !text-white/60">
              Latest Updates
            </span>
            <div className="h-[2px] w-12 bg-brand-red" />
          </div>

          <h1 
            className="font-semibold text-white mb-6 tracking-tight hero-reveal leading-none uppercase"
            style={{ fontSize: 'clamp(2.25rem, 5vw, 5rem)' }}
          >
            News & <br />
            <span className="text-brand-red">Articles</span>
          </h1>

          <p 
            className="text-white/80 max-w-2xl hero-reveal font-medium leading-relaxed mx-auto"
            style={{ fontSize: 'clamp(0.95rem, 1.3vw, 1.35rem)' }}
          >
            Stay updated with the latest from Trufit Auto Center — from shop 
            updates and events to professional maintenance tips.
          </p>
        </div>
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
