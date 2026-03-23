"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRightCircle, Play } from "lucide-react";
import { Slide } from "@/types/slide";
import gsap from "gsap";

type Props = {
  slide: Slide;
  isActive?: boolean;
};

export default function HeroSlide({ slide, isActive }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  const [firstWord, ...restWords] = slide.title.split(" ");
  const restOfTitle = restWords.join(" ");
  const serviceSlug = slide.title.replace(/\s+/g, "-").toLowerCase();

  // Common style to prevent sub-pixel rendering shifts and color "blinks"
  const consistentTextStyle: React.CSSProperties = {
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
    transformStyle: "preserve-3d",
  };

  useLayoutEffect(() => {
    // If NOT active (Base Layer), keep it locked in its final state
    if (!isActive) {
      gsap.set(
        [
          badgeRef.current,
          titleRef.current,
          subtitleRef.current,
          buttonsRef.current,
          statsRef.current,
        ],
        {
          opacity: 1,
          x: 0,
          y: 0,
          overwrite: true,
        },
      );
      return;
    }

    const ctx = gsap.context(() => {
      // Set initial states for incoming slide
      gsap.set(
        [
          badgeRef.current,
          titleRef.current,
          subtitleRef.current,
          buttonsRef.current,
          statsRef.current,
        ],
        {
          opacity: 0,
        },
      );

      const tl = gsap.timeline({
        defaults: {
          ease: "power4.out",
          duration: 1.5,
        },
        delay: 1.2,
      });

      tl.fromTo(
          badgeRef.current,
          { opacity: 0, x: -20, y: 40 },
          { opacity: 1, x: 0, y: 0 }
        )
        .fromTo(
          titleRef.current,
          { opacity: 0, y: 60 },
          { opacity: 1, y: 0 },
          "-=1.3",
        )
        .fromTo(
          subtitleRef.current,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0 },
          "-=1.4",
        )
        .fromTo(
          buttonsRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0 },
          "-=1.4",
        )
        .fromTo(
          statsRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0 },
          "-=1.4",
        );
    }, containerRef);

    return () => ctx.revert();
  }, [slide, isActive]);

  return (
    <div ref={containerRef} className="relative h-screen w-full">
      {/* background image */}
      {slide.image ? (
        <Image
          src={slide.image}
          alt={slide.title}
          fill
          priority
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-brand-dark flex items-center justify-center">
          <div className="w-full h-full bg-[radial-gradient(circle_at_center,rgba(227,27,35,0.08)_0%,transparent_70%)]" />
          <div className="absolute inset-0 opacity-20" style={{ 
            backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)`,
            backgroundSize: '100px 100px'
          }} />
        </div>
      )}

      {/* dark overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* left shadow */}
      <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-black/80 to-transparent" />

      {/* content */}
      <div className="relative z-10 flex h-full items-center">
        <div
          className="px-6 sm:px-10 md:px-16 lg:px-24 xl:px-32 text-white text-left max-w-[1820px] mx-auto w-full 
                      pt-16 md:pt-18 lg:pt-20 pb-10 md:pb-2 flex flex-col justify-center"
        >
          {/* Quality Auto Care badge */}
          <div
            ref={badgeRef}
            className="flex items-center gap-2 mb-3 md:mb-3 landscape:hidden lg:landscape:flex"
            style={{ 
                opacity: isActive ? 0 : 1,
                ...consistentTextStyle 
            }}
          >
            <div className="h-[2px] w-8 bg-brand-blue" />
            <span className="text-[10px] md:text-sm font-bold tracking-widest uppercase text-brand-blue">
              Quality Auto Care
            </span>
          </div>

          {/* title */}
          <h1
            ref={titleRef}
            className="font-brawler text-3xl sm:text-4xl md:text-8xl font-bold mb-3 md:mb-3 leading-tight uppercase landscape:text-2xl lg:landscape:text-8xl"
            style={{ 
                opacity: isActive ? 0 : 1,
                ...consistentTextStyle, 
                fontSize: "clamp(2.5rem, 5vw, 4rem)"
            }}
          >
            <span className="text-brand-red">{firstWord}</span> {restOfTitle}
          </h1>

          {/* subtitle */}
          <p
            ref={subtitleRef}
            className="text-[11px] sm:text-sm md:text-xl mb-4 md:mb-5 max-w-2xl text-gray-300 font-light leading-relaxed landscape:hidden lg:landscape:block"
            style={{ 
                opacity: isActive ? 0 : 1,
                ...consistentTextStyle, 
                fontSize: "clamp(0.9rem, 1.2vw, 1.25rem)"
            }}
          >
            {slide.subtitle}
          </p>

          {/* buttons */}
          <div
            ref={buttonsRef}
            className="flex flex-wrap gap-2 md:gap-4 mb-6 md:mb-6 landscape:mb-4 md:landscape:mb-6"
            style={{ 
                opacity: isActive ? 0 : 1,
                ...consistentTextStyle 
            }}
          >
            <Link
              href={slide.buttonLink || "/services"}
              className="group inline-flex items-center gap-2 bg-brand-blue hover:bg-blue-800 px-4 py-2 sm:px-5 sm:py-2.5 md:px-8 md:py-4 rounded-sm font-bold transition-all shadow-lg hover:shadow-blue-900/40 text-[9px] sm:text-xs md:text-base"
            >
              Our Services
              <div className="bg-white/20 p-1 rounded-full group-hover:bg-white/40 transition-colors">
                <ArrowRightCircle className="w-3 md:w-4 h-3 md:h-4" />
              </div>
            </Link>

            <Link
              href={`/services/${serviceSlug}`}
              className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 md:px-8 md:py-4 rounded-sm font-bold transition-all
                         bg-white/10 border border-white/20 text-white
                         hover:bg-brand-red hover:border-brand-red text-[9px] sm:text-xs md:text-base"
            >
              <Play className="w-3 md:w-4 h-3 md:h-4" />
              View More
            </Link>
          </div>

          {/* stats */}
          <div
            ref={statsRef}
            className="hidden sm:flex lg:flex gap-12 border-t border-white/10 pt-6 md:pt-4 landscape:hidden lg:landscape:flex max-h-[150px]"
            style={{ 
                opacity: isActive ? 0 : 1,
                ...consistentTextStyle 
            }}
          >
            <div>
              <div className="text-3xl md:text-4xl font-bold text-brand-red mb-1">
                25+
              </div>
              <div className="text-[10px] md:text-xs uppercase tracking-widest text-gray-400">
                Years Experience
              </div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-1 flex items-center">
                4.5<span className="text-brand-red text-2xl ml-1">★</span>
              </div>
              <div className="text-[10px] md:text-xs uppercase tracking-widest text-gray-400">
                Customer Ratings
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
