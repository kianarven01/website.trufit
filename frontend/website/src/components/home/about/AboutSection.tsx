"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link"
import {
  CheckCircle2,
  Award,
  Star,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Car
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

const images: string[] = [
  "", // Workshop Placeholder
  "", // Diagnostics Placeholder
  "", // Equipment Placeholder
];

// Custom F1 Car SVG Component
const F1CarIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 40" className={className} fill="currentColor">
    {/* Aerodynamic Body */}
    <path d="M5,28 L15,22 L40,18 L70,18 L90,22 L98,28 Z" />
    {/* Front Wing */}
    <path d="M0,28 L12,28 L12,32 L0,32 Z" />
    {/* Rear Wing Structure */}
    <path d="M85,15 L98,15 L98,18 L85,18 Z" />
    <path d="M92,15 L92,25" stroke="currentColor" strokeWidth="2" />
    {/* Cockpit / Halo */}
    <path d="M45,18 C45,12 60,12 60,18" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="M50,18 L50,14 L58,14 L58,18 Z" />
    {/* Wheels with detail */}
    <rect x="18" y="26" width="14" height="10" rx="2" fill="#111" />
    <rect x="72" y="26" width="16" height="12" rx="2" fill="#111" />
    {/* Floor / Diffuser area */}
    <path d="M25,30 L75,30 L75,33 L25,33 Z" opacity="0.5" />
  </svg>
);

export default function AboutSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const bgTextRef = useRef<HTMLDivElement>(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isOpen, setIsOpen] = useState(false)

  // Background shape refs
  const aura1Ref = useRef<HTMLDivElement>(null);
  const aura2Ref = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<HTMLDivElement>(null);
  const carRef = useRef<HTMLDivElement>(null);
  const activePathRef = useRef<HTMLDivElement>(null);

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

      // Dynamic Diagnostic Graphs Animation
      gsap.utils.toArray(".diagnostic-graph").forEach((graph: any, i) => {
        gsap.to(graph, {
          x: i % 2 === 0 ? -100 : 100, // Move horizontally
          y: i % 2 === 0 ? -120 : -80, // Move vertically
          scaleX: 1.1,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.5
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
              toggleActions: "play reverse play reverse"
            }
          }
        );
      });

      // Synchronized F1 Car & Path Timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "top top",
          scrub: 1, // Reduced scrub for tighter sync
        }
      });

      tl.fromTo(carRef.current,
        { x: "0vw", opacity: 0 },
        { x: "100vw", opacity: 1, ease: "none" },
        0
      );

      tl.fromTo(activePathRef.current,
        { width: "0%" },
        { width: "100%", ease: "none" },
        0
      );

      // High-frequency vibration for an F1 engine feel
      gsap.to(carRef.current, {
        y: "+=1.5",
        repeat: -1,
        yoyo: true,
        duration: 0.05,
        ease: "sine.inOut"
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
        
        {/* Car Passing Animation Divider */}
        <div className="absolute top-0 left-0 w-full h-24 flex items-center overflow-hidden">
          {/* Main Road Line */}
          <div className="absolute w-full h-[1px] bg-gray-100" />
          
          {/* Active Path Filled by Car */}
          <div 
            ref={activePathRef}
            className="absolute h-[2px] bg-gradient-to-r from-transparent via-brand-red to-brand-red shadow-[0_0_10px_rgba(227,27,35,0.3)]"
          />

          {/* Styled Car Silhouette */}
          <div 
            ref={carRef}
            className="absolute flex flex-col items-center -ml-[50px] origin-center"
            style={{ left: '0%' }}
          >
            <div className="relative">
              {/* F1 Car Custom SVG - Flipped to face right */}
              <F1CarIcon className="w-[100px] h-[40px] text-brand-red -scale-x-100" />
              
              {/* Speed Lines / Aero Vortex Trails Behind */}
              <div className="absolute -left-12 top-1/2 -translate-y-1/2 w-12 h-[2px] bg-gradient-to-l from-brand-red/60 to-transparent" />
              <div className="absolute -left-8 top-1/3 -translate-y-1/2 w-8 h-[1px] bg-gradient-to-l from-brand-red/40 to-transparent" />
              <div className="absolute -left-8 bottom-1/3 w-8 h-[1px] bg-gradient-to-l from-brand-red/40 to-transparent" />
              
              {/* Aero "Heat" Distortion Glow */}
              <div className="absolute inset-0 bg-brand-red/10 blur-xl rounded-full scale-150 -z-10" />
            </div>
          </div>
        </div>

        {/* Large Outlined Text Background */}
        
        {/* Large Outlined Text Background */}
        <div 
          ref={bgTextRef}
          className="absolute top-20 left-10 text-[15vw] font-black leading-none opacity-[0.03] text-transparent stroke-brand-dark"
          style={{ WebkitTextStroke: '1px currentColor' }}
        >
          TRUFIT<br />AUTO
        </div>

        {/* Dynamic Diagnostic Graphs (Stock/Telemetry Style) */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* Blue "Performance" Graph - Smooth and Rising */}
          <svg 
            className="diagnostic-graph absolute top-1/4 -left-20 w-[120%] h-64 opacity-[0.05] text-brand-blue"
            viewBox="0 0 1000 200"
            preserveAspectRatio="none"
          >
            <path 
              d="M0,150 Q100,140 200,160 T400,120 T600,140 T800,80 T1000,100" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeDasharray="5,5"
            />
            <circle cx="200" cy="160" r="3" fill="currentColor" />
            <circle cx="600" cy="140" r="3" fill="currentColor" />
            <circle cx="800" cy="80" r="3" fill="currentColor" />
          </svg>

          {/* Red "Diagnostic" Graph - More Jagged and Technical */}
          <svg 
            className="diagnostic-graph absolute bottom-1/4 -right-20 w-[120%] h-48 opacity-[0.04] text-brand-red"
            viewBox="0 0 1000 200"
            preserveAspectRatio="none"
          >
            <path 
              d="M0,100 L50,80 L100,120 L150,90 L200,110 L250,70 L300,130 L350,100 L400,110 L450,80 L500,120 L550,90 L600,100 L650,60 L700,120 L750,90 L800,110 L850,70 L900,100 L950,120 L1000,80" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5"
            />
            {/* Adding "Data Points" along the jagged path */}
            {[100, 300, 500, 650, 850].map((x, i) => (
              <rect key={i} x={x} y="90" width="4" height="4" fill="currentColor" className="opacity-50" />
            ))}
          </svg>
        </div>

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
              <div className="h-[2px] w-12 bg-brand-blue" />
              <span className="text-sm font-extrabold tracking-[0.3em] uppercase text-brand-blue">
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
                    {images[currentImage] ? (
                      <Image
                        src={images[currentImage]}
                        alt="Trufit Service"
                        fill
                        className="object-cover pointer-events-none"
                      />
                    ) : (
                      <div className="w-full h-full bg-brand-dark/5 flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-gray-200">
                        <Car className="w-16 h-16 text-gray-200 mb-4" />
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Real Service Image Coming Soon</p>
                      </div>
                    )}
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
              <Link
                href="/#appointment"
                onClick={(e) => {
                  const el = document.getElementById("appointment");
                  if (el) {
                    e.preventDefault();
                    el.scrollIntoView(); // instant jump
                  }
                  setIsOpen(false);
                }}
                className="bg-brand-blue text-white px-10 py-5 rounded-sm font-black hover:bg-brand-dark transition-all uppercase tracking-[0.2em] text-xs shadow-lg shadow-brand-blue/20 inline-block"
              >
                Book Appointment
              </Link>
              <a
                href="https://www.google.com/maps/place/Trufit+Auto+Center/@14.1237854,122.9405256,17z/data=!4m8!3m7!1s0x3398affd09d7236b:0xcfccafc73d343d48!8m2!3d14.1237854!4d122.9431005!9m1!1b1!16s%2Fg%2F11fl9dschh?entry=ttu&g_ep=EgoyMDI2MDMyNC4wIKXMDSoASAFQAw%3D%3D"
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
                  {images[currentImage] ? (
                    <Image
                      src={images[currentImage]}
                      alt={`Trufit Service ${currentImage + 1}`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-brand-dark to-brand-dark flex flex-col items-center justify-center p-12 text-center">
                      <div className="relative mb-8">
                        <Car className="w-24 h-24 text-brand-red/10" />
                        <div className="absolute inset-0 bg-brand-red/5 blur-3xl rounded-full" />
                      </div>
                      <h3 className="text-white/20 font-black text-2xl mb-2 tracking-tighter uppercase italic">Trufit Excellence</h3>
                      <p className="text-white/10 font-bold uppercase tracking-[0.3em] text-[10px]">Image Gallery Under Construction</p>
                      
                      {/* Decorative elements to make it look "designed" even without image */}
                      <div className="absolute top-10 left-10 w-20 h-[1px] bg-white/5" />
                      <div className="absolute top-10 left-10 w-[1px] h-20 bg-white/5" />
                      <div className="absolute bottom-10 right-10 w-20 h-[1px] bg-white/5" />
                      <div className="absolute bottom-10 right-10 w-[1px] h-20 bg-white/5" />
                    </div>
                  )}
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
