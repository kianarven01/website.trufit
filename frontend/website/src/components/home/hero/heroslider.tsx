"use client"

import { useState, useEffect, useRef } from "react"
import { slides } from "@/data/slides"
import HeroSlide from "./heroslide"
import gsap from "gsap"

export default function HeroSlider() {
  const [index, setIndex] = useState(0)
  const [nextIndex, setNextIndex] = useState<number | null>(null)
  const [progress, setProgress] = useState(0)
  const [isCompleting, setIsCompleting] = useState(false)
  
  const slideCount = slides.length
  const intervalTime = 6000
  const containerRef = useRef<HTMLDivElement>(null)

  const triggerTransition = (newTarget: number) => {
    if (nextIndex !== null || newTarget === index) return
    setNextIndex(newTarget)
    setProgress(0)
    setIsCompleting(false)
  }

  // 1. Progress Bar Logic
  useEffect(() => {
    if (nextIndex !== null || isCompleting) return;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + (100 / (intervalTime / 16));
        return next >= 100 ? 100 : next;
      });
    }, 16);

    return () => clearInterval(timer);
  }, [index, nextIndex, isCompleting]);

  // 2. Start Completion Phase (The "Ping")
  useEffect(() => {
    if (progress >= 100 && nextIndex === null && !isCompleting) {
      setIsCompleting(true);
    }
  }, [progress, nextIndex, isCompleting]);

  // 3. Trigger Transition after Ping Delay
  useEffect(() => {
    if (isCompleting) {
      const timer = setTimeout(() => {
        triggerTransition((index + 1) % slideCount);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isCompleting, index, slideCount]);

  // 4. GSAP Animation Logic
  useEffect(() => {
    if (nextIndex === null) return;

    const timer = setTimeout(() => {
      const incoming = containerRef.current?.querySelector(".incoming-slide");
      if (!incoming) {
        setIndex(nextIndex);
        setNextIndex(null);
        return;
      }

      const ctx = gsap.context(() => {
        const tl = gsap.timeline({
          onComplete: () => {
            // Swap immediately without delay to prevent "double overlay" darkening
            setIndex(nextIndex);
            setNextIndex(null);
            setProgress(0);
            setIsCompleting(false);
          }
        });

        tl.fromTo(incoming, 
          { clipPath: "polygon(0% 0%, 0% 0%, 0% 0%)", webkitClipPath: "polygon(0% 0%, 0% 0%, 0% 0%)" },
          { 
            clipPath: "polygon(0% 0%, 200% 0%, 0% 200%)", 
            webkitClipPath: "polygon(0% 0%, 200% 0%, 0% 200%)",
            duration: 1.5, 
            ease: "expo.inOut" 
          }
        );
        tl.to({}, { duration: 1.5 });
      }, containerRef);

      return () => ctx.revert();
    }, 30);

    return () => clearTimeout(timer);
  }, [nextIndex]);

  // Handlers
  const handleClick = (i: number) => triggerTransition(i);

  const touchStartX = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => (touchStartX.current = e.touches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) => {
    const distance = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(distance) > 50) {
      triggerTransition(distance > 0 ? (index + 1) % slideCount : (index - 1 + slideCount) % slideCount);
    }
  };

  return (
    <section
      ref={containerRef}
      className="relative h-[600px] md:h-screen w-full overflow-hidden -mt-[112px] md:-mt-[120px]"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Base Layer */}
      <div className="absolute inset-0">
        <HeroSlide key={`base-${index}`} slide={slides[index]} isActive={false} />
      </div>

      {/* Transition Layer */}
      {nextIndex !== null && (
        <div 
          className="incoming-slide absolute inset-0 z-20"
          style={{ 
            clipPath: "polygon(0% 0%, 0% 0%, 0% 0%)", 
            WebkitClipPath: "polygon(0% 0%, 0% 0%, 0% 0%)" 
          }}
        >
          <HeroSlide key={`incoming-${nextIndex}`} slide={slides[nextIndex]} isActive={true} />
        </div>
      )}

      {/* Progress Bars */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-[1820px] px-6 sm:px-10 lg:px-16 flex gap-2 z-20">
        {slides.map((_, i) => (
          <div
            key={i}
            onClick={() => handleClick(i)}
            className="flex-1 h-2 md:h-3 bg-white/30 cursor-pointer relative overflow-hidden"
          >
            <div
              className={`h-full bg-white transition-all ${i === index && isCompleting ? 'opacity-50' : 'opacity-100'}`}
              style={{
                width: i === index ? `${progress}%` : '0%',
                transition: i === index && progress < 100 ? 'width 16ms linear' : 'none'
              }}
            />
            {i === index && isCompleting && <div className="absolute inset-0 bg-white/80 animate-ping" />}
          </div>
        ))}
      </div>
    </section>
  )
}
