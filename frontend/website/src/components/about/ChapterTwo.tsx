"use client";

import { useRef } from "react";
import Image from "next/image";
import { Camera, Heart, Shield, Truck } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useState } from "react";
import ImageModal from "../ui/ImageModal";

gsap.registerPlugin(ScrollTrigger);

const overlandCards = [
  {
    title: "Adventure Ready",
    caption:
      "Equipping vehicles for the toughest terrains — ensuring every journey is backed by performance and reliability.",
    icon: <Truck size={20} />,
    image: "/images/about/overland_contents/adventure_ready.webp",
  },
  {
    title: "Custom Builds",
    caption:
      "Tailored off-road solutions for explorers, from suspension upgrades to full overland rig preparations.",
    icon: <Shield size={20} />,
    image: "/images/about/overland_contents/custom_builds.webp",
  },
  {
    title: "Expert Support",
    caption:
      "Our team brings mechanical excellence to the trail, offering support for off-road enthusiasts across the region.",
    icon: <Heart size={20} />,
    image: "/images/about/overland_contents/expert_support.webp",
  },
  {
    title: "Overland Community",
    caption:
      "Beyond the workshop, we foster a community of explorers who share a passion for the great outdoors and rugged discovery.",
    icon: <Camera size={20} />,
    image: "/images/about/overland_contents/overland_community.webp",
  },
];

export default function ChapterTwo() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const imagesForModal = overlandCards.map((card) => card.image);

  const openLightbox = (index: number) => {
    setActiveImageIdx(index);
    setModalOpen(true);
  };

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // Parallax on background
      gsap.to(bgRef.current, {
        y: 160,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });

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
          },
        );
      });

      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      className="relative text-white overflow-hidden bg-brand-dark"
      id="beyond-workshop"
    >
      {/* Background Image with Overlay */}
      <div ref={bgRef} className="absolute inset-x-0 -top-[20%] h-[140%] z-0">
        <img
          src="/images/about/overland.webp"
          alt="Overland Background"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-brand-dark/60" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-dark/10 via-60% to-brand-dark" />
      </div>
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-red/[0.06] rounded-full blur-[150px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-red/[0.04] rounded-full blur-[130px] translate-y-1/3 -translate-x-1/4" />
        <div
          className="absolute top-20 right-10 text-[10vw] font-semibold leading-none opacity-[0.02] text-transparent"
          style={{ WebkitTextStroke: "1px white" }}
        >
          ADVENTURE
        </div>
      </div>

      {/* Header Section */}
      <div className="relative z-10 pt-20 md:pt-32 pb-12 md:pb-16 max-w-[1820px] mx-auto px-6 sm:px-10 lg:px-16">
        <div className="ch2-reveal section-label">
          <div className="section-label-line" />
          <span className="section-label-text">Overland</span>
        </div>

        <h2 className="ch2-reveal text-3xl md:text-5xl lg:text-6xl font-semibold leading-tight uppercase tracking-tight mb-6">
          Beyond The <span className="text-brand-red">Workshop</span>
        </h2>

        <p className="ch2-reveal text-white/60 text-base md:text-lg max-w-2xl leading-relaxed font-medium mb-4">
          Through Overland, Trufit Auto Center extends its reach into the wild.
          We don&apos;t just fix cars for the road; we prepare them for the
          journey where the road ends.
        </p>

        <p className="ch2-reveal text-white/40 text-sm md:text-base max-w-2xl leading-relaxed mb-8">
          Whether it&apos;s custom rigs, trail support, or community
          expeditions, our team is dedicated to the overland lifestyle. We
          believe that mechanical excellence shouldn&apos;t be limited by
          asphalt.
        </p>

        <a
          href="https://www.facebook.com/cnoverland/"
          target="_blank"
          rel="noopener noreferrer"
          className="ch2-reveal inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-sm transition-all duration-300 group border border-white/10"
        >
          <span className="font-bold text-sm uppercase tracking-wider">
            Follow Overland on Facebook
          </span>
          <Camera
            size={18}
            className="text-brand-red group-hover:scale-110 transition-transform"
          />
        </a>
      </div>

      {/* Simplified Grid Gallery */}
      <div className="relative z-10 max-w-[1820px] mx-auto px-6 sm:px-10 lg:px-16 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {overlandCards.map((card, idx) => (
            <div
              key={idx}
              className="ch2-reveal relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-sm overflow-hidden group h-[300px] lg:h-[400px] cursor-pointer"
              onClick={() => openLightbox(idx)}
            >
              {/* Photo */}
              <Image
                src={card.image}
                alt={card.title}
                fill
                className="object-cover object-center opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700"
                sizes="(max-width: 1024px) 100vw, 50vw"
                quality={90}
              />

              {/* Caption Overlay */}
              <div className="horizontal-gallery-card-caption">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-brand-red">{card.icon}</div>
                  <h4 className="text-white font-semibold text-sm uppercase tracking-wider">
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

      <ImageModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        images={imagesForModal}
        currentIndex={activeImageIdx}
      />
    </section>
  );
}
