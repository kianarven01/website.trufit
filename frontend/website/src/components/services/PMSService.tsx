"use client";

import { useRef } from "react";
import Image from "next/image";
import { 
  ClipboardCheck, 
  Droplets, 
  Disc, 
  Octagon, 
  BatteryCharging, 
  Activity, 
  Thermometer,
  ArrowRight
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import "./services.css";

gsap.registerPlugin(ScrollTrigger);

const pmsChecklist = [
  { title: "21-Point Digital Inspection", icon: ClipboardCheck, desc: "Comprehensive health check for your vehicle." },
  { title: "Oil & Filter Precision Change", icon: Droplets, desc: "Premium synthetic oil and OEM filter replacement." },
  { title: "Tire & Suspension Analysis", icon: Disc, desc: "Checking pressure, tread depth, and alignment." },
  { title: "Brake Performance Testing", icon: Octagon, desc: "Ensuring maximum stopping power and safety." },
  { title: "Electrical System Diagnostic", icon: BatteryCharging, desc: "Battery, alternator, and starter motor testing." },
  { title: "Vital Fluid Replenishment", icon: Thermometer, desc: "Coolant, brake, and transmission fluid levels." },
];

export default function PMSService() {
  const container = useRef<HTMLDivElement>(null);
  const leftContent = useRef<HTMLDivElement>(null);
  const rightImage = useRef<HTMLDivElement>(null);
  const bgTextRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Content Reveal
      gsap.fromTo(
        ".pms-reveal",
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          scrollTrigger: {
            trigger: container.current,
            start: "top 80%",
            toggleActions: "play reverse play reverse",
          },
        }
      );

      // Image Reveal with Parallax
      gsap.fromTo(
        rightImage.current,
        { scale: 0.95, opacity: 0, x: 50 },
        {
          scale: 1,
          opacity: 1,
          x: 0,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: container.current,
            start: "top 70%",
          },
        }
      );

      // Parallax for background text
      gsap.to(bgTextRef.current, {
        y: -80,
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
    <section ref={container} className="py-24 md:py-40 bg-gray-50/50 overflow-hidden relative">
      {/* Background Decoration Text */}
      <div 
        ref={bgTextRef}
        className="services-bg-text top-[20%] left-[-2%] opacity-[0.02]"
      >
        PRECISION
      </div>
      
      <div className="max-w-[1700px] mx-auto px-6 sm:px-10 lg:px-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-32 items-center">
          
          {/* Left Side: Content */}
          <div ref={leftContent}>
            <div className="pms-reveal services-chapter-label mb-6">
              <div className="services-chapter-label-line" />
              <span className="services-chapter-label-text">
                Essential Care
              </span>
            </div>
            
            <h2 className="pms-reveal text-4xl md:text-6xl font-semibold text-brand-dark leading-[1.1] tracking-tight uppercase mb-8">
              Preventive <br />
              <span className="text-brand-red font-semibold">Maintenance Service</span>
            </h2>
            
            <p className="pms-reveal text-gray-500 text-lg md:text-xl font-medium leading-relaxed mb-12 max-w-xl">
              Proactive care is the heartbeat of longevity. Our comprehensive PMS program 
              detects potential issues before they become expensive repairs, 
              ensuring your vehicle remains in factory condition.
            </p>

            {/* Enhanced Vertical Checklist */}
            <div className="space-y-4 mb-12">
              {pmsChecklist.map((item, i) => (
                <div key={i} className="pms-reveal pms-checklist-item group cursor-default">
                  <div className="pms-icon-box">
                    <item.icon size={22} />
                  </div>
                  <div>
                    <h4 className="text-brand-dark font-bold uppercase text-xs tracking-widest mb-1">
                      {item.title}
                    </h4>
                    <p className="text-gray-400 text-xs font-medium">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pms-reveal flex items-center gap-6">
              <button className="bg-brand-dark text-white px-8 py-4 rounded-sm font-bold text-xs uppercase tracking-widest hover:bg-brand-red transition-all duration-300 flex items-center gap-3">
                Book PMS Now
                <ArrowRight size={16} />
              </button>
              <div className="hidden sm:block">
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 block mb-1">Total Reliability</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <div key={s} className="w-1.5 h-1.5 rounded-full bg-brand-red" />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Visual Stack */}
          <div ref={rightImage} className="relative">
            <div className="services-image-wrap services-corner-accents">
              {/* Main Image */}
              <div className="relative aspect-[4/5] rounded-sm overflow-hidden shadow-2xl border-[12px] border-white z-10">
                <Image
                  src="/images/services/PMS.jpg"
                  alt="Preventive Maintenance Service"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/40 to-transparent" />
              </div>

              {/* Floating Badge */}
              <div className="services-floating-badge top-12 -left-8 md:-left-12">
                <span className="text-brand-red font-black text-4xl block mb-1">100%</span>
                <span className="text-white text-[9px] uppercase tracking-[0.3em] font-bold">Reliability <br />Guarantee</span>
              </div>

              {/* Decorative Element */}
              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-brand-red/5 rounded-full blur-3xl -z-10" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
