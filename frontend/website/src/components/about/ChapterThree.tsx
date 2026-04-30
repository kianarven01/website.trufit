"use client";

import { useRef } from "react";
import Image from "next/image";
import { Camera, Trophy, Users, Flame } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

const triathlonImages = [
  { 
    label: "Race Day", 
    sublabel: "Triathlon event photo", 
    className: "grid-item-1",
    src: "/images/about/triathlon/race_day.jpg" 
  },
  { 
    label: "Team Prep", 
    sublabel: "Pre-race preparation", 
    className: "grid-item-2",
    src: "/images/about/triathlon/team_prep.jpg" 
  },
  { 
    label: "On Course", 
    sublabel: "In-action shot", 
    className: "grid-item-3",
    src: "/images/about/triathlon/on_course.jpg" 
  },
  { 
    label: "Finish Line", 
    sublabel: "Victory moment", 
    className: "grid-item-4",
    src: "/images/about/triathlon/finish_line.jpg" 
  },
];

export default function ChapterThree() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const reveals = gsap.utils.toArray<HTMLElement>(".ch3-reveal");
    reveals.forEach((item, i) => {
      gsap.fromTo(
        item,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          delay: i * 0.05,
          ease: "power3.out",
          scrollTrigger: {
            trigger: item,
            start: "top 90%",
            end: "bottom 10%",
            toggleActions: "play reverse play reverse",
          },
        }
      );
    });

    // Staggered grid items reveal
    const gridItems = gsap.utils.toArray<HTMLElement>(".tri-grid-item");
    gridItems.forEach((item, i) => {
      gsap.fromTo(
        item,
        { opacity: 0, y: 60, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          delay: i * 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "40% bottom",
            toggleActions: "play none none reverse",
          },
        }
      );
    });
  }, { scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      className="relative bg-white overflow-hidden py-20 md:py-32"
      id="racing-spirit"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <div
          className="absolute bottom-10 left-10 text-[12vw] font-semibold leading-none opacity-[0.02] text-transparent"
          style={{ WebkitTextStroke: "1px #0A0A0A" }}
        >
          RACE
        </div>
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-brand-red/[0.02] rounded-full blur-[120px]" />
      </div>

      <div className="max-w-[1820px] mx-auto px-6 sm:px-10 lg:px-16 relative z-10">
        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-end mb-12 md:mb-16">
          <div>
            <div className="ch3-reveal section-label">
              <div className="section-label-line" />
              <span className="section-label-text">Sports & Fitness</span>
            </div>

            <h2 className="ch3-reveal text-3xl md:text-5xl lg:text-6xl font-semibold leading-tight uppercase tracking-tight mb-6 text-brand-dark">
              Triathlon <span className="text-brand-red">Team</span>
            </h2>

            <p className="ch3-reveal text-gray-600 text-base md:text-lg leading-relaxed font-medium max-w-xl">
              The same discipline that makes us precise mechanics fuels our passion
              for sport. The Trufit team actively participates in local triathlon
              events — swimming, cycling, and running alongside the community we serve.
            </p>
          </div>

          <div className="hidden lg:block">
            <p className="ch3-reveal text-gray-500 text-sm leading-relaxed max-w-md">
              Triathlon demands endurance, precision, and teamwork — the same values
              we bring to every vehicle in our workshop. It&apos;s more than competition;
              it&apos;s a philosophy of pushing limits and never settling for less.
            </p>

            {/* Sport Stats */}
            <div className="ch3-reveal flex gap-8 mt-8">
              <div className="flex items-center gap-3">
                <Trophy className="text-brand-red" size={20} />
                <div>
                  <p className="text-brand-dark font-semibold text-lg">Active</p>
                  <p className="text-gray-400 text-[10px] uppercase tracking-widest font-bold">Competitors</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Flame className="text-brand-red" size={20} />
                <div>
                  <p className="text-brand-dark font-semibold text-lg">Local</p>
                  <p className="text-gray-400 text-[10px] uppercase tracking-widest font-bold">Triathlon Events</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="text-brand-red" size={20} />
                <div>
                  <p className="text-brand-dark font-semibold text-lg">Team</p>
                  <p className="text-gray-400 text-[10px] uppercase tracking-widest font-bold">Spirit Driven</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Staggered Image Grid */}
        <div className="staggered-grid">
          {triathlonImages.map((img, idx) => (
            <div
              key={idx}
              className={`tri-grid-item ${img.className} relative rounded-sm overflow-hidden shadow-lg group`}
            >
              <Image 
                src={img.src}
                alt={img.label}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />

              {/* Caption Overlay */}
              <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-brand-dark/80 to-transparent z-20">
                <p className="text-white font-semibold text-[10px] uppercase tracking-widest mb-1">{img.label}</p>
                <p className="text-white/60 text-[8px] uppercase tracking-widest font-medium">{img.sublabel}</p>
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-brand-red/0 hover:bg-brand-red/10 transition-colors duration-500 z-10" />
            </div>
          ))}
        </div>

        {/* Mobile sport stats */}
        <div className="lg:hidden mt-10">
          <p className="ch3-reveal text-gray-500 text-sm leading-relaxed mb-6">
            Triathlon demands endurance, precision, and teamwork — the same values
            we bring to every vehicle we service. It&apos;s a philosophy of pushing
            limits and never settling for less.
          </p>
          <div className="ch3-reveal flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <Trophy className="text-brand-red" size={18} />
              <span className="text-brand-dark font-semibold text-sm">Active Competitors</span>
            </div>
            <div className="flex items-center gap-2">
              <Flame className="text-brand-red" size={18} />
              <span className="text-brand-dark font-semibold text-sm">Local Events</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="text-brand-red" size={18} />
              <span className="text-brand-dark font-semibold text-sm">Team Spirit</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
