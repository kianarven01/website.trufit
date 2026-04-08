"use client";

import { useRef, useState } from "react";
import ServiceCard from "@/components/ui/servicecard";
import { specializedServices } from "@/data/services-page";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import "./services.css";

gsap.registerPlugin(ScrollTrigger);

export default function GeneralServices() {
  const container = useRef<HTMLDivElement>(null);
  const bgTextRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  useGSAP(
    () => {
      const cards = gsap.utils.toArray(".service-card-reveal");
      
      cards.forEach((card: any) => {
        gsap.fromTo(
          card,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 92%",
              toggleActions: "play reverse play reverse",
            },
          }
        );
      });

      // Parallax for background text
      gsap.to(bgTextRef.current, {
        y: -60,
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

  const handleDragEnd = (event: any, info: any) => {
    const swipeThreshold = 50;
    if (info.offset.x > swipeThreshold) {
      setDirection(-1);
      setCurrentIndex((prev) => (prev === 0 ? specializedServices.length - 1 : prev - 1));
    } else if (info.offset.x < -swipeThreshold) {
      setDirection(1);
      setCurrentIndex((prev) => (prev === specializedServices.length - 1 ? 0 : prev + 1));
    }
  };

  const variants: Variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 150 : -150,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: "spring", stiffness: 400, damping: 40 },
        opacity: { duration: 0.2 },
      },
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 150 : -150,
      opacity: 0,
      scale: 0.95,
      transition: {
        x: { type: "spring", stiffness: 400, damping: 40 },
        opacity: { duration: 0.2 },
      },
    }),
  };

  return (
    <section ref={container} className="py-24 md:py-40 bg-white overflow-hidden px-6 sm:px-10 lg:px-24 relative">
      {/* Background Decoration Text */}
      <div 
        ref={bgTextRef}
        className="services-bg-text top-[10%] right-[-10%] left-auto opacity-[0.02]"
      >
        SOLUTIONS
      </div>

      <div className="max-w-[1700px] mx-auto relative z-10">
        <div className="mb-20 md:mb-32">
          <div className="services-chapter-label mb-6">
            <div className="services-chapter-label-line" />
            <span className="services-chapter-label-text">
              Full Spectrum
            </span>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-end">
            <div>
              <h2 className="text-4xl md:text-6xl font-semibold text-brand-dark leading-[1.1] tracking-tight uppercase mb-0">
                Specialized <br />
                <span className="text-gradient-red font-semibold">& Allied</span> Services
              </h2>
            </div>
            <div>
              <p className="text-gray-500 text-lg md:text-xl font-medium leading-relaxed max-w-xl">
                From European luxury to heavy-duty American trucks, our facility is equipped 
                to handle every automotive challenge with surgical precision.
              </p>
            </div>
          </div>
        </div>

        {/* Desktop Grid View */}
        <div className="hidden md:grid services-grid grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-16">
          {specializedServices.map((service) => (
            <div key={service.id} className="service-card-reveal">
              <ServiceCard service={service} />
            </div>
          ))}
        </div>

        {/* Mobile Swipeable Stack View */}
        <div className="md:hidden relative h-[560px] w-full flex flex-col items-center touch-pan-y">
          <div className="relative w-full h-[480px] flex items-center justify-center overflow-hidden">
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragEnd={handleDragEnd}
                style={{ willChange: "transform, opacity" }}
                className="absolute w-full max-w-[340px] cursor-grab active:cursor-grabbing px-4"
              >
                <ServiceCard service={specializedServices[currentIndex]} />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-4 flex justify-center gap-2">
            {specializedServices.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 transition-all duration-300 rounded-full ${idx === currentIndex ? "w-8 bg-brand-red" : "w-1.5 bg-gray-200"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
