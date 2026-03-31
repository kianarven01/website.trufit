// src/components/news/newshero.tsx
"use client";

import { useLayoutEffect, useRef } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import gsap from "gsap";

export default function NewsHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "power4.out", duration: 1.2 }
      });

      tl.fromTo(
        titleRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0 }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={containerRef}
      className="relative pt-40 pb-20 md:pt-64 md:pb-32 bg-brand-dark overflow-hidden -mt-[112px] md:-mt-[120px]"
    >
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(227,27,35,0.15)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(0,43,163,0.15)_0%,transparent_50%)]" />
      </div>

      <div className="container relative z-10">
        <h1 
          ref={titleRef}
          className="font-brawler text-5xl md:text-8xl font-bold text-white uppercase leading-tight"
        >
          Lorem <span className="text-brand-red">Ipsum Dolor</span>
        </h1>
        
        <p className="mt-6 text-gray-400 max-w-2xl text-lg font-light leading-relaxed">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
        </p>
      </div>
    </section>
  );
}
