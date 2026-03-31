"use client";

import { useRef, useState } from "react";
import ServiceCard from "@/components/ui/servicecard";
import { specializedServices } from "@/data/services-page";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { motion, AnimatePresence, Variants } from "framer-motion";

gsap.registerPlugin(ScrollTrigger);

export default function GeneralServices() {
  const container = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  useGSAP(
    () => {
      const cards = gsap.utils.toArray(".service-card-reveal");
      
      cards.forEach((card: any) => {
        gsap.fromTo(
          card,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 90%",
              toggleActions: "play reverse play reverse",
            },
          }
        );
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
    <section ref={container} className="py-24 md:py-40 bg-gray-50 overflow-hidden px-6 sm:px-10 lg:px-24">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-16 md:mb-24 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-[2px] bg-brand-red" />
            <span className="text-brand-red font-bold text-sm md:text-sm tracking-[0.2em] uppercase">
              Full Spectrum
            </span>
            <div className="w-12 h-[2px] bg-brand-red" />
          </div>
          
          <h2 className="text-5xl md:text-6xl font-black text-brand-dark leading-tight uppercase tracking-tight mb-8">
            Specialized <span className="text-brand-red">& Allied</span> Services
          </h2>
          
          <p className="text-gray-600 text-lg md:text-xl font-medium leading-relaxed max-w-3xl mx-auto">
            From European luxury to heavy-duty American trucks, our facility is equipped 
            to handle every automotive challenge with surgical precision.
          </p>
        </div>

        {/* Desktop Grid View */}
        <div className="hidden md:grid services-grid grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
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
                className={`h-1.5 transition-all duration-300 rounded-full ${idx === currentIndex ? "w-8 bg-brand-red" : "w-2 bg-gray-300"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
