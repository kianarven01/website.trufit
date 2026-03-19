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
  Monitor,
  Settings,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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
  const contentRef = useRef<HTMLDivElement>(null);
  const [currentImage, setCurrentImage] = useState(0);

  const stats = [
    { icon: <Award size={24} />, value: "25+", label: "Years Experience" },
    { icon: <Star size={24} />, value: "4.5", label: "Google Rating" },
    { icon: <ShieldCheck size={24} />, value: "100%", label: "OEM Standard" },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
          },
        },
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const features = [
    {
      title: "OEM-Certified Diagnostic Tools",
      desc: "Dealership-level precision for all makes.",
    },
    {
      title: "Master-Level Diagnostics",
      desc: "Overseen by 25+ years of industry wisdom.",
    },
    {
      title: "Genuine & Premium Parts",
      desc: "We never compromise on your car's integrity.",
    },
    {
      title: "Transparency Guarantee",
      desc: "Full reports and photos of every repair.",
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="section-padding bg-white overflow-hidden relative"
      id="about"
    >
      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gray-50/50 -skew-x-12 translate-x-1/2 pointer-events-none" />

      <div className="max-w-[1820px] mx-auto px-6 sm:px-10 lg:px-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24 items-center">
          {/* Content Side */}
          <div ref={contentRef} className="order-1 lg:order-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-[2px] w-12 bg-brand-red" />
              <span className="text-sm font-extrabold tracking-[0.3em] uppercase text-brand-red">
                About Trufit
              </span>
            </div>

            <h2 className="text-2xl md:text-4xl font-bold mb-5 font-brawler leading-snug text-brand-dark">
              With the right tools and years of experience, <br />
              <span className="text-brand-red">
                we make sure your car gets the care it deserves.
              </span>
            </h2>

            {/* Photo Slider - Sandwiched on mobile between title and text */}
            <div className="lg:hidden my-10 relative group">
              <div className="relative h-[300px] w-full overflow-hidden rounded-sm border border-gray-100 bg-gray-100">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative w-full h-full"
                  >
                    <Image
                      src={images[currentImage]}
                      alt="Trufit Service"
                      fill
                      className="object-cover"
                    />
                  </motion.div>
                </AnimatePresence>
                <div className="absolute bottom-4 left-4 flex gap-1">
                  {images.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1 rounded-full transition-all ${idx === currentImage ? "w-6 bg-brand-red" : "w-2 bg-white/50"}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <p className="text-gray-600 text-lg md:text-xl mb-6 leading-relaxed max-w-2xl">
              Founded in 2021, Trufit provides reliable, high-quality auto
              repair with a focus on doing the job right and keeping your
              vehicle running smoothly.
            </p>

            <p className="text-gray-500 text-base mb-10 leading-relaxed max-w-2xl">
              Backed with 25+ years of car wisdom and experience behind what we
              do, we pair trusted techniques with modern tools to keep your car
              running strong.
            </p>

            {/* Benefits Grid (Balanced 2x2) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10 mb-12">
              {features.map((feature, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="shrink-0 mt-1">
                    <CheckCircle2 className="text-brand-red w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-dark uppercase text-[11px] tracking-wider mb-1">
                      {feature.title}
                    </h4>
                    <p className="text-gray-500 text-xs leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Performance Stats Row */}
            <div className="grid grid-cols-3 bg-gray-50 rounded-sm mb-12 border border-gray-100">
              {stats.map((stat, idx) => (
                <StatItem key={idx} {...stat} />
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-6">
              <button className="bg-brand-red text-white px-10 py-5 rounded-sm font-bold hover:bg-brand-dark transition-all uppercase tracking-widest text-sm">
                Book an Appointment
              </button>
              <a
                href="https://www.google.com/maps/place/Trufit+Auto+Center/data=!4m2!3m1!1s0x0:0xcfccafc73d343d48?sa=X&ved=1t:2428&ictx=111"
                target="_blank"
                rel="noopener noreferrer"
                className="border-2 border-brand-dark text-brand-dark px-10 py-5 rounded-sm font-bold hover:bg-brand-dark hover:text-white transition-all uppercase tracking-widest text-sm text-center"
              >
                Read Reviews
              </a>
            </div>
          </div>

          {/* Desktop Slider Side - Hidden on Mobile */}
          <div className="hidden lg:block relative group order-2 lg:order-1">
            <div className="relative h-[650px] w-full overflow-hidden rounded-sm border border-gray-100 bg-gray-100">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentImage}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={images[currentImage]}
                    alt={`Trufit Technology ${currentImage + 1}`}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/30 to-transparent" />
                </motion.div>
              </AnimatePresence>

              {/* Slider Controls */}
              <div className="absolute bottom-6 right-6 flex gap-2">
                <button
                  onClick={() =>
                    setCurrentImage(
                      (prev) => (prev - 1 + images.length) % images.length,
                    )
                  }
                  className="p-3 bg-white/90 hover:bg-brand-red hover:text-white transition-colors text-brand-dark rounded-sm"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() =>
                    setCurrentImage((prev) => (prev + 1) % images.length)
                  }
                  className="p-3 bg-white/90 hover:bg-brand-red hover:text-white transition-colors text-brand-dark rounded-sm"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Slider Dots */}
              <div className="absolute bottom-6 left-6 flex gap-2">
                {images.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 transition-all duration-300 rounded-full ${idx === currentImage ? "w-8 bg-brand-red" : "w-2 bg-white/50"}`}
                  />
                ))}
              </div>
            </div>

            {/* Accent Border */}
            <div className="absolute -top-4 -left-4 w-24 h-24 border-t-2 border-l-2 border-brand-red opacity-30 pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
}
