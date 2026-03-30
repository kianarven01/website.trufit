"use client";

import { useRef } from "react";
import { Camera, Heart, Shield, Truck } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

const rescueCards = [
  {
    title: "Emergency Response",
    caption: "When typhoons strike, the Trufit team is among the first to mobilize — deploying vehicles and manpower to reach affected communities.",
    icon: <Shield size={20} />,
  },
  {
    title: "Relief Operations",
    caption: "From distributing food packs and water to clearing debris-blocked roads, we put our mechanical expertise to work where it matters most.",
    icon: <Heart size={20} />,
  },
  {
    title: "Vehicle Recovery",
    caption: "Stranded vehicles in floodwaters and fallen trees on roadways — our team works around the clock to restore mobility to our neighbors.",
    icon: <Truck size={20} />,
  },
  {
    title: "Community Rebuilding",
    caption: "After the storm passes, our commitment continues. We help repair damaged vehicles at reduced rates and support local rebuilding efforts.",
    icon: <Heart size={20} />,
  },
];

export default function ChapterTwo() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    // Reveal animations (all sizes)
    const reveals = gsap.utils.toArray<HTMLElement>(".ch2-reveal");
    reveals.forEach((item) => {
      gsap.fromTo(
        item,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: item,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );
    });

    return () => mm.revert();
  }, { scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      className="relative bg-brand-dark text-white overflow-hidden"
      id="beyond-workshop"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-red/[0.06] rounded-full blur-[150px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-blue/[0.04] rounded-full blur-[130px] translate-y-1/3 -translate-x-1/4" />
        <div
          className="absolute top-20 right-10 text-[10vw] font-black leading-none opacity-[0.02] text-transparent"
          style={{ WebkitTextStroke: "1px white" }}
        >
          SERVE
        </div>
      </div>

      {/* Header Section */}
      <div className="relative z-10 pt-20 md:pt-32 pb-12 md:pb-16 max-w-[1820px] mx-auto px-6 sm:px-10 lg:px-16">
        <div className="ch2-reveal chapter-label">
          <div className="chapter-label-line" />
          <span className="chapter-label-text">Community & Service</span>
        </div>

        <h2 className="ch2-reveal text-3xl md:text-5xl lg:text-6xl font-black font-brawler leading-tight uppercase tracking-tight mb-6">
          Beyond The <span className="text-brand-red">Workshop</span>
        </h2>

        <p className="ch2-reveal text-white/60 text-base md:text-lg max-w-2xl leading-relaxed font-medium mb-4">
          In a province where typhoons are a way of life, Trufit Auto Center
          doesn&apos;t just wait for the storm to pass. We roll up our sleeves and
          head straight into the heart of it.
        </p>

        <p className="ch2-reveal text-white/40 text-sm md:text-base max-w-2xl leading-relaxed">
          When disaster strikes our community, our team transforms from mechanics
          to first responders. Using our fleet, our tools, and our hands, we deploy
          for rescue missions, relief operations, and vehicle recovery — because
          being part of a community means showing up when it matters most.
        </p>
      </div>

      {/* Simplified Grid Gallery */}
      <div className="relative z-10 max-w-[1820px] mx-auto px-6 sm:px-10 lg:px-16 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {rescueCards.map((card, idx) => (
            <div key={idx} className="ch2-reveal relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-sm overflow-hidden group h-[300px] lg:h-[400px]">
              {/* Photo Placeholder for authenticity */}
              <div className="about-placeholder about-placeholder-corners w-full h-full">
                <Camera className="about-placeholder-icon" size={40} />
                <p className="about-placeholder-label">{card.title} Photo</p>
                <p className="about-placeholder-sublabel">
                  Rescue / Relief documentation
                </p>
              </div>

              {/* Caption Overlay */}
              <div className="horizontal-gallery-card-caption">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-brand-red">{card.icon}</div>
                  <h4 className="text-white font-black text-sm uppercase tracking-wider">
                    {card.title}
                  </h4>
                </div>
                <p className="text-white/60 text-xs leading-relaxed">
                  {card.caption}
                </p>
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-brand-red/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-1" />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-brand-dark to-transparent pointer-events-none z-0" />
    </section>
  );
}
