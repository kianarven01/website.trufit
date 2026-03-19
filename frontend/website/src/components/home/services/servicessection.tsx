"use client";

import { useRef, useState } from "react";
import ServiceCard from "@/components/ui/servicecard";
import { services } from "@/data/home-services";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { motion, AnimatePresence, Variants } from "framer-motion";

gsap.registerPlugin(ScrollTrigger);

export default function ServicesSection() {
  const container = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  // Refs for background shapes
  const aura1Ref = useRef<HTMLDivElement>(null);
  const aura2Ref = useRef<HTMLDivElement>(null);
  const accent1Ref = useRef<HTMLDivElement>(null);
  const accent2Ref = useRef<HTMLDivElement>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // 1. FLOATING IDLE ANIMATIONS
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px)", () => {
        [aura1Ref, aura2Ref, accent1Ref, accent2Ref].forEach((ref, i) => {
          gsap.to(ref.current, {
            x: i % 2 === 0 ? 40 : -40,
            y: i < 2 ? 60 : -60,
            scale: 1.1,
            duration: 6 + i,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          });
        });
      });
      return () => mm.revert();
    },
    { scope: container },
  );

  // 2. SCROLL-BASED REVEAL & PARALLAX
  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // Initial state setup
      gsap.set(".section-header > *, .service-card-reveal", {
        opacity: 0,
        y: 80,
      });

      mm.add("(min-width: 768px)", () => {
        // 2. Background Depth Parallax
        gsap.to(aura1Ref.current, {
          y: -120,
          scrollTrigger: {
            trigger: container.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });

        gsap.to(aura2Ref.current, {
          y: -200,
          scrollTrigger: {
            trigger: container.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.5,
          },
        });

        // Content "Magnetic" Reveal
        gsap.fromTo(
          innerRef.current,
          { y: 150 },
          {
            y: -150,
            ease: "none",
            scrollTrigger: {
              trigger: container.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );

        // Section Header & Cards Entrance
        gsap.to(".section-header > *", {
          y: 0,
          opacity: 1,
          stagger: 0.15,
          duration: 1.2,
          ease: "power4.out",
          scrollTrigger: {
            trigger: ".section-header",
            start: "top 90%",
            toggleActions: "play reverse play reverse",
          },
        });

        gsap.to(".service-card-reveal", {
          y: 0,
          opacity: 1,
          stagger: 0.1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".services-grid",
            start: "top 85%",
            toggleActions: "play reverse play reverse",
          },
        });
      });

      mm.add("(max-width: 767px)", () => {
        gsap.set(".section-header > *, .service-card-reveal", {
          opacity: 1,
          y: 0,
        });
      });

      return () => mm.revert();
    },
    { scope: container },
  );

  const handleDragEnd = (event: any, info: any) => {
    const swipeThreshold = 50;
    if (info.offset.x > swipeThreshold) {
      setDirection(-1);
      setCurrentIndex((prev) => (prev === 0 ? services.length - 1 : prev - 1));
    } else if (info.offset.x < -swipeThreshold) {
      setDirection(1);
      setCurrentIndex((prev) => (prev === services.length - 1 ? 0 : prev + 1));
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
    <section
      ref={container}
      id="services"
      className="py-24 md:py-40 bg-white overflow-hidden relative z-10 
                 md:[mask-image:linear-gradient(to_bottom,transparent_0%,black_200px,black_80%,transparent_100%)] 
                 md:[-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_200px,black_80%,transparent_100%)]"
    >
      {/* Background Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)`,
            backgroundSize: "80px 80px",
          }}
        />

        {/* Parallax Aura Shapes */}
        <div className="absolute inset-0">
          <div
            ref={aura1Ref}
            className="absolute -top-20 -left-20 w-[800px] md:w-[1000px] h-[800px] bg-brand-blue/10 rounded-full blur-[100px] md:blur-[130px]"
          />
          <div
            ref={aura2Ref}
            className="absolute top-1/4 -right-40 w-[600px] md:w-[800px] h-[600px] bg-brand-red/5 rounded-full blur-[80px] md:blur-[110px]"
          />
          <div
            ref={accent1Ref}
            className="hidden md:block absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-brand-blue/10 rounded-full blur-[100px]"
          />
          <div
            ref={accent2Ref}
            className="hidden md:block absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-brand-blue/5 rounded-full blur-[110px]"
          />
        </div>
      </div>

      <div
        ref={innerRef}
        className="relative z-10 px-6 sm:px-10 md:px-16 lg:px-24 xl:px-32 mx-auto max-w-[1820px] w-full"
        style={{ willChange: "transform" }}
      >
        <div className="mb-12 md:mb-20 section-header">
          <div className="flex items-center gap-3 mb-4 opacity-0">
            <div className="w-12 h-[2px] bg-brand-blue" />
            <span className="text-brand-blue font-bold text-sm md:text-xs tracking-[0.2em] uppercase">
              What We Do
            </span>
          </div>
          <h2 className="text-5xl md:text-6xl lg:text-8xl font-black text-brand-dark leading-tight uppercase tracking-tight opacity-0">
            Our Services
          </h2>
          <p className="mt-4 md:mt-8 text-gray-600 md:text-gray-500 max-w-2xl leading-relaxed text-base md:text-xl font-medium md:font-normal opacity-0">
            Comprehensive automotive repair powered by state of the art tools
            and decades of expertise
          </p>
        </div>

        {/* Desktop Grid View */}
        <div className="hidden md:grid services-grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {services.map((service) => (
            <div
              key={service.id}
              className="service-card-reveal opacity-0"
              style={{ willChange: "opacity, transform" }}
            >
              <ServiceCard service={service} />
            </div>
          ))}
        </div>

        {/* Mobile Swipeable Stack View */}
        <div className="md:hidden relative h-[560px] w-full flex flex-col items-center touch-pan-y">
          <div className="relative w-full h-[480px] flex items-center justify-center overflow-hidden">
            <AnimatePresence
              initial={false}
              custom={direction}
              mode="popLayout"
            >
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
                <ServiceCard service={services[currentIndex]} />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-4 flex justify-center gap-2">
            {services.map((_, idx) => (
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
