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
import { useModalStore } from "@/store/useModalStore";
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
  const extraImageRef = useRef<HTMLDivElement>(null);
  const bgTextRef = useRef<HTMLDivElement>(null);

  const openAppointment = useModalStore((s) => s.openAppointment);

  const handleBookPMS = () => {
    openAppointment();
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("prefillAppointment", {
          detail: { service: "pms" },
        })
      );
    }, 100);
  };

  useGSAP(
    () => {
      // Content Reveal
      const reveals = gsap.utils.toArray(".pms-reveal");
      if (reveals.length > 0 && container.current) {
        gsap.fromTo(
          reveals,
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
      }

      // Image Reveal with Parallax
      if (rightImage.current && container.current) {
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
      }

      // Parallax for background text
      if (bgTextRef.current && container.current) {
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
      }
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
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-16 xl:gap-32 items-center">
          
          {/* Content Wrapper - handles Title, Detail, List, Button order */}
          <div className="flex flex-col">
            <div className="pms-reveal section-label mb-6 order-1">
              <div className="section-label-line" />
              <span className="section-label-text">
                Essential Care
              </span>
            </div>
            
            <h2 className="pms-reveal text-3xl md:text-5xl font-semibold text-brand-dark leading-[1.1] tracking-tight uppercase mb-8 order-2">
              Preventive <br />
              <span className="text-brand-red font-semibold">Maintenance Service</span>
            </h2>

            {/* Image shown after title on mobile, but right side on desktop */}
            <div ref={rightImage} className="relative order-3 lg:hidden mb-12">
              <div className="services-image-wrap services-corner-accents">
                <div className="relative aspect-[4/5] rounded-sm overflow-hidden shadow-2xl border-[8px] md:border-[12px] border-white z-10">
                  <Image
                    src="/images/services/PMS.jpg"
                    alt="Preventive Maintenance Service"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/40 to-transparent" />
                </div>
                <div className="services-floating-badge top-8 -left-4">
                  <span className="text-brand-red font-black text-2xl block mb-1">100%</span>
                  <span className="text-white text-[7px] uppercase tracking-[0.3em] font-bold text-nowrap">Reliability Guarantee</span>
                </div>
              </div>
            </div>
            
            <p className="pms-reveal text-gray-500 text-lg md:text-xl font-medium leading-relaxed mb-12 max-w-xl order-4">
              Proactive care is the heartbeat of longevity. Our comprehensive PMS program 
              detects potential issues before they become expensive repairs, 
              ensuring your vehicle remains in factory condition.
            </p>

            {/* Enhanced Vertical Checklist */}
            <div className="space-y-4 mb-12 order-5">
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

            <div className="pms-reveal flex items-center gap-6 order-6">
              <button 
                onClick={handleBookPMS}
                className="bg-brand-dark text-white px-8 py-4 rounded-sm font-bold text-xs uppercase tracking-widest hover:bg-brand-red transition-all duration-300 flex items-center gap-3 outline-none"
              >
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

          {/* Right Side: Visual Stack (Desktop Only) */}
          <div className="hidden lg:block">
            <div ref={extraImageRef} className="relative">
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
      </div>
    </section>
  );
}
