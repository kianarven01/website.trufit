"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  CheckCircle2,
  Award,
  Star,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

interface StatProps {
  icon: React.ReactNode;
  value: string;
  label: string;
}

const StatItem = ({ icon, value, label }: StatProps) => {
  return (
    <div className="flex flex-col items-center p-4 border-r border-gray-100 last:border-0">
      <div className="text-brand-red mb-2">{icon}</div>
      <span className="text-2xl md:text-3xl font-black text-brand-dark">
        {value}
      </span>
      <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 text-center">
        {label}
      </span>
    </div>
  );
};

const images = [
  "/images/about/workshop.webp",
  "/images/about/diagnostics.webp",
  "/images/about/equipment.webp",
];

export default function AboutSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const bgTextRef = useRef<HTMLDivElement>(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Background shape refs
  const aura1Ref = useRef<HTMLDivElement>(null);
  const aura2Ref = useRef<HTMLDivElement>(null);

  const stats = [
    { icon: <Award size={24} />, value: "25+", label: "Years Experience" },
    { icon: <Star size={24} />, value: "4.5", label: "Google Rating" },
    { icon: <ShieldCheck size={24} />, value: "100%", label: "OEM Standard" },
  ];

  // Handle auto-play
  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const handleInteraction = (newIndex: number) => {
    setIsAutoPlaying(false);
    setCurrentImage(newIndex);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const onDragEnd = (event: any, info: any) => {
    const swipeThreshold = 50;
    if (info.offset.x > swipeThreshold) {
      handleInteraction((currentImage - 1 + images.length) % images.length);
    } 
    else if (info.offset.x < -swipeThreshold) {
      handleInteraction((currentImage + 1) % images.length);
    }
  };

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      // Parallax for background text
      gsap.to(bgTextRef.current, {
        y: -150,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      });

      // Parallax inner content
      gsap.fromTo(innerRef.current,
        { y: 80 },
        {
          y: -80,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true
          }
        }
      );

      // More aggressive dynamic blueprint lines
      gsap.utils.toArray(".blueprint-line").forEach((line: any, i) => {
        gsap.to(line, {
          y: i % 2 === 0 ? -200 : -150,
          x: i % 2 === 0 ? 50 : -50,
          rotation: i % 2 === 0 ? 5 : -5,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1 // Adding a little smoothing to the scrub
          }
        });
      });

      // Simple Reveal - Fixed to work from both scroll directions
      const reveals = gsap.utils.toArray(".about-reveal");
      reveals.forEach((item: any) => {
        gsap.fromTo(item,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: item,
              start: "top 92%",
              end: "bottom 8%",
              toggleActions: "play reverse play reverse" // Key fix for both directions
            }
          }
        );
      });
    });

    return () => mm.revert();
  }, { scope: sectionRef });

  const features = [
    { title: "OEM-Certified Diagnostic Tools", desc: "Dealership-level precision for all makes." },
    { title: "Master-Level Diagnostics", desc: "Overseen by 25+ years of industry wisdom." },
    { title: "Genuine & Premium Parts", desc: "We never compromise on your car's integrity." },
    { title: "Transparency Guarantee", desc: "Full reports and photos of every repair." },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative z-0 -mt-[15vh] pt-[25vh] pb-24 md:pb-32 bg-white overflow-hidden"
      id="about"
    >
      {/* BACKGROUND ELEMENTS - High End Blueprint Aesthetic */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        
        {/* Large Outlined Text Background */}
        <div 
          ref={bgTextRef}
          className="absolute top-20 left-10 text-[15vw] font-black leading-none opacity-[0.03] text-transparent stroke-brand-dark"
          style={{ WebkitTextStroke: '1px currentColor' }}
        >
          TRUFIT<br />AUTO
        </div>

        {/* Floating Blueprint Lines */}
        <div className="blueprint-line absolute top-1/4 right-0 w-1/3 h-[1px] bg-brand-red/10 -rotate-12 translate-x-10" />
        <div className="blueprint-line absolute bottom-1/3 left-0 w-1/4 h-[1px] bg-brand-blue/10 rotate-12 -translate-x-10" />
        <div className="blueprint-line absolute top-1/2 left-1/2 w-48 h-[1px] bg-brand-dark/5 -rotate-45" />

        {/* Soft Depth Shapes */}
        <div 
          ref={aura1Ref}
          className="absolute top-1/4 -left-40 w-[800px] h-[800px] bg-brand-blue/[0.03] rounded-full blur-[130px]" 
        />
        <div 
          ref={aura2Ref}
          className="absolute bottom-1/4 -right-40 w-[600px] h-[600px] bg-brand-red/[0.02] rounded-full blur-[110px]" 
        />
      </div>

      <div ref={innerRef} className="max-w-[1820px] mx-auto px-6 sm:px-10 lg:px-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24 items-center">
          
          {/* Content Side */}
          <div className="order-1 lg:order-2">
            <div className="flex items-center gap-3 mb-6 about-reveal">
              <div className="h-[2px] w-12 bg-brand-red" />
              <span className="text-sm font-extrabold tracking-[0.3em] uppercase text-brand-red">
                About Trufit
              </span>
            </div>

            <h2 className="text-3xl md:text-5xl font-black mb-8 font-brawler leading-tight text-brand-dark about-reveal uppercase tracking-tight">
              Decades of Wisdom. <br />
              <span className="text-brand-red font-bold">Modern Precision.</span>
            </h2>

            {/* Mobile Slider */}
            <div className="lg:hidden my-10 relative group touch-pan-y about-reveal">
              <div className="relative h-[350px] w-full overflow-hidden rounded-sm border border-gray-100 bg-gray-100 shadow-xl">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentImage}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4 }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    onDragEnd={onDragEnd}
                    className="relative w-full h-full"
                  >
                    <Image
                      src={images[currentImage]}
                      alt="Trufit Service"
                      fill
                      className="object-cover pointer-events-none"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            <p className="text-gray-600 text-lg md:text-xl mb-6 leading-relaxed max-w-2xl about-reveal font-medium">
              Founded in 2021, Trufit pairs trusted techniques with dealership-level tools to keep your car running strong.
            </p>

            <p className="text-gray-500 text-base mb-12 leading-relaxed max-w-2xl about-reveal">
              With over 25 years of automotive expertise, we've built a reputation for transparency and uncompromising quality. We don't just fix cars; we restore confidence.
            </p>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-10 mb-12 about-reveal">
              {features.map((feature, idx) => (
                <div key={idx} className="flex gap-5 group">
                  <div className="shrink-0 mt-1">
                    <CheckCircle2 className="text-brand-red w-6 h-6 transition-transform group-hover:scale-110" />
                  </div>
                  <div>
                    <h4 className="font-black text-brand-dark uppercase text-xs tracking-widest mb-2">
                      {feature.title}
                    </h4>
                    <p className="text-gray-500 text-xs leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-sm mb-12 border border-gray-100 about-reveal">
              {stats.map((stat, idx) => (
                <StatItem key={idx} {...stat} />
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-6 about-reveal">
              <button className="bg-brand-red text-white px-10 py-5 rounded-sm font-black hover:bg-brand-dark transition-all uppercase tracking-[0.2em] text-xs shadow-lg shadow-brand-red/20">
                Book Appointment
              </button>
              <a
                href="https://www.google.com/maps/place/Trufit+Auto+Center"
                target="_blank"
                rel="noopener noreferrer"
                className="border-2 border-brand-dark text-brand-dark px-10 py-5 rounded-sm font-black hover:bg-brand-dark hover:text-white transition-all uppercase tracking-[0.2em] text-xs text-center"
              >
                Read Reviews
              </a>
            </div>
          </div>

          {/* Desktop Slider Section */}
          <div className="hidden lg:block relative group order-2 lg:order-1 about-reveal">
            <div className="relative h-[700px] w-full overflow-hidden rounded-sm border border-gray-100 bg-gray-50 shadow-2xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentImage}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1 }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={images[currentImage]}
                    alt={`Trufit Service ${currentImage + 1}`}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/30 via-transparent to-transparent" />
                </motion.div>
              </AnimatePresence>

              {/* Slider Controls */}
              <div className="absolute bottom-10 right-10 flex gap-3">
                <button
                  onClick={() => handleInteraction((currentImage - 1 + images.length) % images.length)}
                  className="p-4 bg-white/90 hover:bg-brand-red hover:text-white transition-all text-brand-dark rounded-sm shadow-xl"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={() => handleInteraction((currentImage + 1) % images.length)}
                  className="p-4 bg-white/90 hover:bg-brand-red hover:text-white transition-all text-brand-dark rounded-sm shadow-xl"
                >
                  <ChevronRight size={24} />
                </button>
              </div>

              {/* Slider Dots */}
              <div className="absolute bottom-10 left-10 flex gap-3 items-center">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleInteraction(idx)}
                    className={`h-1.5 transition-all duration-500 rounded-full ${idx === currentImage ? "w-12 bg-brand-red" : "w-3 bg-brand-dark/20"}`}
                  />
                ))}
              </div>
            </div>

            {/* Accent Elements */}
            <div className="absolute -top-6 -left-6 w-32 h-32 border-t-4 border-l-4 border-brand-red opacity-20 pointer-events-none" />
            <div className="absolute -bottom-6 -right-6 w-32 h-32 border-b-4 border-r-4 border-brand-blue opacity-10 pointer-events-none" />
          </div>

        </div>
      </div>
    </section>
  );
}
