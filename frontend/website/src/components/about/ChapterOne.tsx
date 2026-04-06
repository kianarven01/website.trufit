"use client";

import { useRef } from "react";
import {
  Camera,
  CheckCircle2,
  Award,
  Star,
  ShieldCheck,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

const features = [
  { title: "OEM-Certified Diagnostic Tools", desc: "Dealership-level precision for all makes and models." },
  { title: "Master-Level Diagnostics", desc: "Overseen by 25+ years of industry wisdom." },
  { title: "Genuine & Premium Parts", desc: "We never compromise on your vehicle's integrity." },
  { title: "Transparency Guarantee", desc: "Full reports and documentation on every repair." },
];

const stats = [
  { icon: <Award size={22} />, value: "25+", label: "Years Experience" },
  { icon: <Star size={22} />, value: "4.5", label: "Google Rating" },
  { icon: <ShieldCheck size={22} />, value: "100%", label: "OEM Standard" },
];

export default function ChapterOne() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const reveals = gsap.utils.toArray<HTMLElement>(".ch1-reveal");
    reveals.forEach((item) => {
      gsap.fromTo(
        item,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: item,
            start: "top 88%",
            end: "bottom 12%",
            toggleActions: "play reverse play reverse",
          },
        }
      );
    });

    // Parallax on the image
    gsap.to(".ch1-image-wrap", {
      y: -60,
      ease: "none",
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
  }, { scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      className="relative bg-white overflow-hidden py-20 md:py-32"
      id="who-we-are"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <div className="absolute top-20 left-10 text-[12vw] font-black leading-none opacity-[0.02] text-transparent"
          style={{ WebkitTextStroke: '1px #0A0A0A' }}
        >
          TRUFIT<br />AUTO
        </div>
        <div className="absolute top-1/4 -right-40 w-[600px] h-[600px] bg-brand-blue/[0.02] rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -left-40 w-[500px] h-[500px] bg-brand-red/[0.02] rounded-full blur-[100px]" />
      </div>

      <div className="max-w-[1820px] mx-auto px-6 sm:px-10 lg:px-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24 items-center">

          {/* Image Side */}
          <div className="ch1-reveal order-2 lg:order-1">
            <div className="ch1-image-wrap relative">
              {/* Main Image */}
              <div className="relative h-[400px] md:h-[550px] lg:h-[650px] w-full rounded-sm overflow-hidden shadow-2xl">
                <div className="about-placeholder about-placeholder-corners w-full h-full">
                  <Camera className="about-placeholder-icon" size={48} />
                  <p className="about-placeholder-label">Workshop Photo</p>
                  <p className="about-placeholder-sublabel">Team at work or shop interior</p>
                </div>
              </div>

              {/* Floating accent image */}
              <div className="absolute -bottom-8 -right-4 md:-right-8 w-[180px] md:w-[240px] h-[140px] md:h-[180px] rounded-sm overflow-hidden shadow-xl border-4 border-white z-10">
                <div className="about-placeholder w-full h-full" style={{ borderStyle: 'none' }}>
                  <Camera className="about-placeholder-icon" size={24} />
                  <p className="about-placeholder-label text-[7px]">Detail Shot</p>
                </div>
              </div>

              {/* Corner decorations */}
              <div className="absolute -top-4 -left-4 w-24 h-24 border-t-4 border-l-4 border-brand-red opacity-20 pointer-events-none" />
            </div>
          </div>

          {/* Content Side */}
          <div className="order-1 lg:order-2">
            <div className="ch1-reveal chapter-label">
              <div className="chapter-label-line" />
              <span className="chapter-label-text">About Trufit</span>
            </div>

            <h2 className="ch1-reveal text-3xl md:text-5xl font-black mb-4 font-brawler leading-tight text-brand-dark uppercase tracking-tight">
              Who We Are
            </h2>

            <p className="ch1-reveal text-brand-red font-bold text-sm tracking-[0.2em] uppercase mb-8">
              Founded 2019 · 25+ Years of Expertise
            </p>

            <p className="ch1-reveal text-gray-600 text-lg md:text-xl mb-6 leading-relaxed max-w-2xl font-medium">
              Trufit Auto Center was born from a simple belief: every vehicle owner
              deserves honest, world-class service without the dealership price tag.
            </p>

            <p className="ch1-reveal text-gray-500 text-base mb-10 leading-relaxed max-w-2xl">
              With over 25 years of automotive expertise, we pair trusted techniques
              with OEM-certified diagnostic tools. We don&apos;t just fix cars — we
              restore confidence. Built on a foundation of integrity, technical
              excellence, and customer satisfaction, Trufit strives to keep every
              vehicle safe, reliable, and road-ready.
            </p>

            {/* Feature Grid */}
            <div className="ch1-reveal grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8 mb-12">
              {features.map((feature, idx) => (
                <div key={idx} className="flex gap-4 group">
                  <div className="shrink-0 mt-0.5">
                    <CheckCircle2 className="text-brand-red w-5 h-5 transition-transform group-hover:scale-110" />
                  </div>
                  <div>
                    <h4 className="font-black text-brand-dark uppercase text-xs tracking-widest mb-1.5">
                      {feature.title}
                    </h4>
                    <p className="text-gray-500 text-xs leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="ch1-reveal grid grid-cols-3 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-sm border border-gray-100">
              {stats.map((stat, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center p-4 md:p-6 border-r border-gray-100 last:border-0"
                >
                  <div className="text-brand-red mb-2">{stat.icon}</div>
                  <span className="text-2xl md:text-3xl font-black text-brand-dark">
                    {stat.value}
                  </span>
                  <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 text-center">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
