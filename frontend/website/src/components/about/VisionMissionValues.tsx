"use client";

import { useRef } from "react";
import { Eye, Target, Gem } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

const coreValues = [
  { title: "Integrity", desc: "Honest assessments and transparent pricing." },
  { title: "Quality", desc: "Premium workmanship using proper tools and materials." },
  { title: "Customer Care", desc: "Building trust, one service at a time." },
  { title: "Reliability", desc: "Consistent performance you can count on." },
  { title: "Professionalism", desc: "Industry-leading standards and practices." },
];

export default function VisionMissionValues({ isTransparent = false }: { isTransparent?: boolean }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const localBgRef = useRef<HTMLDivElement>(null);

  const bgRef = isTransparent ? { current: null } : localBgRef;

  useGSAP(() => {
    // Parallax on local background (if not transparent)
    if (!isTransparent && bgRef.current) {
      gsap.to(bgRef.current, {
      y: 120,
      ease: "none",
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
    }

    const cards = gsap.utils.toArray<HTMLElement>(".vmv-animate");
    cards.forEach((card, i) => {
      gsap.fromTo(
        card,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          delay: i * 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: card,
            start: "top 90%",
            end: "bottom 10%",
            toggleActions: "play reverse play reverse",
          },
        }
      );
    });

    // Value items stagger
    const values = gsap.utils.toArray<HTMLElement>(".value-item");
    values.forEach((val, i) => {
      gsap.fromTo(
        val,
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          delay: i * 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "60% bottom",
            toggleActions: "play none none reverse",
          },
        }
      );
    });
  }, { scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      className={`relative text-white overflow-hidden py-20 md:py-32 ${isTransparent ? "" : "bg-brand-dark"}`}
      id="vision-mission"
    >
      {/* Local Background (Only if not transparent) */}
      {!isTransparent && (
        <>
          <div ref={localBgRef} className="absolute inset-x-0 -top-[10%] h-[120%] z-0">
            <img 
              src="/images/about/foundation.webp" 
              alt="Foundation Background" 
              className="w-full h-full object-cover opacity-30" 
            />
            <div className="absolute inset-0 bg-brand-dark/60" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-dark/10 via-60% to-brand-dark" />
          </div>

          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-brand-dark to-transparent z-1 pointer-events-none" />

          <div className="absolute inset-0 pointer-events-none select-none z-1">
            <div className="absolute top-1/4 -left-40 w-[600px] h-[600px] bg-brand-red/[0.04] rounded-full blur-[130px]" />
            <div className="absolute bottom-1/4 -right-40 w-[500px] h-[500px] bg-brand-red/[0.03] rounded-full blur-[110px]" />
          </div>
        </>
      )}

      <div className="max-w-[1820px] mx-auto px-6 sm:px-10 lg:px-16 relative z-10">
        {/* Header */}
        <div className="text-center mb-14 md:mb-20">
          <div className="vmv-animate flex items-center justify-center gap-3 mb-4">
            <div className="h-[2px] w-8 bg-brand-red" />
            <span className="text-xs font-semibold tracking-[0.3em] uppercase text-brand-red">
              Our Foundation
            </span>
            <div className="h-[2px] w-8 bg-brand-red" />
          </div>
          <h2 className="vmv-animate text-3xl md:text-5xl font-semibold uppercase tracking-tight">
            What Drives Us
          </h2>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-16 md:mb-20">
          {/* Vision Card */}
          <div className="vmv-animate vmv-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-brand-red/10 flex items-center justify-center">
                <Eye className="text-brand-red" size={20} />
              </div>
              <h3 className="text-xl font-semibold uppercase tracking-wider">Vision</h3>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              To be recognized as one of the most reliable and customer-focused auto
              service centers in the region, known for professionalism, innovation,
              and service excellence.
            </p>
          </div>

          {/* Mission Card */}
          <div className="vmv-animate vmv-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-brand-red/10 flex items-center justify-center">
                <Target className="text-brand-red" size={20} />
              </div>
              <h3 className="text-xl font-semibold uppercase tracking-wider">Mission</h3>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              To provide dependable, efficient, and honest automotive services that
              exceed customer expectations while ensuring safety and performance on
              every journey.
            </p>
          </div>

          {/* Core Values Card */}
          <div className="vmv-animate vmv-card lg:row-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-brand-red/10 flex items-center justify-center">
                <Gem className="text-brand-red" size={20} />
              </div>
              <h3 className="text-xl font-semibold uppercase tracking-wider">Core Values</h3>
            </div>
            <div className="space-y-4">
              {coreValues.map((value, idx) => (
                <div key={idx} className="value-item flex items-start gap-3">
                  <div className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-red" />
                  <div>
                    <span className="text-white font-medium text-sm">{value.title}</span>
                    <span className="text-white/40 text-sm"> — {value.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Commitment Statement */}
        <div className="vmv-animate text-center max-w-3xl mx-auto">
          <div className="h-[1px] w-16 bg-white/10 mx-auto mb-8" />
          <p className="text-white/40 text-sm md:text-base leading-relaxed italic">
            &ldquo;Trufit Auto Center is committed to building long-term relationships
            by providing dependable service, clear communication, and solutions
            tailored to each customer&apos;s needs. We believe that every vehicle
            deserves expert care, and every customer deserves peace of mind.&rdquo;
          </p>
        </div>
      </div>
    </section>
  );
}
