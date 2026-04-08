"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import "./services.css";

gsap.registerPlugin(ScrollTrigger);

export default function ServicesHero() {
  const container = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const bgTextRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container.current,
          start: "top bottom",
          toggleActions: "play reverse play reverse",
        },
      });

      tl.fromTo(
        subtitleRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" }
      )
      .fromTo(
        titleRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: "power3.out" },
        "-=0.4"
      )
      .fromTo(
        textRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" },
        "-=0.5"
      );

      // Parallax for background text
      gsap.to(bgTextRef.current, {
        y: -100,
        ease: "none",
        scrollTrigger: {
          trigger: container.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    },
    { scope: container }
  );

  return (
    <section
      ref={container}
      className="relative min-h-[90vh] md:min-h-[85vh] w-full flex items-center justify-center overflow-hidden bg-brand-dark -mt-[112px] md:-mt-[120px]"
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/suzuki-banner.jpg"
          alt="Suzuki Authorized Service Center"
          fill
          className="object-cover opacity-40 grayscale-[20%]"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-dark via-brand-dark/40 to-brand-dark" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-6xl mx-auto pt-32 md:pt-40 pb-20">
        <div 
          ref={subtitleRef}
          className="services-chapter-label justify-center opacity-0"
        >
          <div className="services-chapter-label-line" />
          <span className="services-chapter-label-text !text-white/60">
            Official Partner
          </span>
          <div className="services-chapter-label-line" />
        </div>
        
        <h1 
          ref={titleRef}
          className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold text-white leading-[1.1] tracking-tight opacity-0"
        >
          Suzuki Authorized <br className="hidden md:block" />
          <span className="text-gradient-red font-semibold">Service Center</span>
        </h1>
        
        <p 
          ref={textRef}
          className="mt-10 text-white/50 text-base md:text-lg lg:text-xl max-w-2xl mx-auto font-medium leading-relaxed opacity-0"
        >
          World-class maintenance and repair for your Suzuki vehicle, 
          powered by genuine parts and factory-trained technicians 
          who understand your engine better than anyone else.
        </p>

        {/* Floating Accent badges could go here if needed, but keeping it clean for Hero */}
      </div>

      {/* Bottom transition */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-brand-dark to-transparent z-10" />
    </section>
  );
}
