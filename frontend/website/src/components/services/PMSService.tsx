"use client";

import { useRef } from "react";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function PMSService() {
  const container = useRef<HTMLDivElement>(null);
  const leftContent = useRef<HTMLDivElement>(null);
  const rightImage = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        leftContent.current,
        { x: -100, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: container.current,
            start: "top 70%",
            toggleActions: "play reverse play reverse",
          },
        }
      );
      gsap.fromTo(
        rightImage.current,
        { scale: 0.9, opacity: 0, x: 100 },
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
    },
    { scope: container }
  );

  const pmsChecklist = [
    "Comprehensive 21-Point Inspection",
    "Oil & Filter replacement",
    "Tire pressure and tread checking",
    "Brake system assessment",
    "Battery and alternator testing",
    "Belt and hose durability check",
    "Coolant and fluid level monitoring",
  ];

  return (
    <section ref={container} className="py-24 md:py-40 bg-white overflow-hidden relative">
      {/* Background Decorative Aura */}
      <div className="absolute top-1/4 -right-1/4 w-[600px] h-[600px] bg-brand-blue/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-24 flex flex-col lg:flex-row items-center gap-16 md:gap-24">
        {/* Left Side: Content */}
        <div ref={leftContent} className="flex-1 order-2 lg:order-1">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-[2px] bg-brand-blue" />
            <span className="text-brand-blue font-bold text-sm md:text-sm tracking-[0.2em] uppercase">
              Essential Care
            </span>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-black text-brand-dark leading-tight uppercase tracking-tight mb-8">
            Preventive Maintenance <br />
            <span className="text-brand-blue">Service (PMS)</span>
          </h2>
          
          <p className="text-gray-600 text-lg md:text-xl font-medium leading-relaxed mb-10 max-w-xl">
            Proactive care is the heartbeat of longevity. Our comprehensive PMS program 
            detects potential issues before they become expensive repairs, 
            ensuring your vehicle remains in factory condition.
          </p>

          <ul className="space-y-4 mb-10">
            {pmsChecklist.map((item, i) => (
              <li key={i} className="flex items-start gap-4">
                <CheckCircle2 className="text-brand-red mt-1 shrink-0" size={24} />
                <span className="text-brand-dark font-semibold text-lg">{item}</span>
              </li>
            ))}
          </ul>

          <div className="bg-brand-blue/5 border-l-4 border-brand-blue p-8 rounded-r-lg max-w-xl">
            <p className="text-brand-blue font-bold italic text-lg leading-relaxed">
              "We don't just fix cars; we preserve them. Trust our certified 
              experts to keep your journey uninterrupted."
            </p>
          </div>
        </div>

        {/* Right Side: Image/Graphics */}
        <div ref={rightImage} className="flex-1 order-1 lg:order-2 w-full">
          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl skew-y-3 lg:skew-y-0 lg:rotate-2 group transition-transform duration-500 hover:rotate-0">
            <Image
              src="/images/pms-highlight.jpg"
              alt="Preventive Maintenance Service"
              fill
              className="object-cover"
            />
            {/* Absolute Badges */}
            <div className="absolute top-10 left-10 glass-dark p-6 rounded-2xl z-10">
              <span className="text-brand-red font-black text-4xl block mb-1">100%</span>
              <span className="text-white text-xs uppercase tracking-[0.3em] font-bold">Reliability Guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
