"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import gsap from "gsap";

const ACCREDITATIONS = [
  {
    name: "Suzuki",
    logo: "/images/accreditations/suzuki.webp",
    title: "AUTHORIZED",
    subtitle: "SERVICE STATION",
  },
  {
    name: "DTI",
    logo: "/images/accreditations/dti.webp",
    title: "5 STAR",
    subtitle: "ACCREDITED",
  },
  {
    name: "Bagwis",
    logo: "/images/accreditations/bagwis.webp",
    title: "BRONZE BAGWIS",
    subtitle: "SEAL OF EXCELLENCE",
  },
];

const PARTNERS = [
  { name: "Wurth", logo: "/images/partners/wurth.webp" },
  { name: "Valvoline", logo: "/images/partners/valvoline.webp" },
  { name: "Frontrunner", logo: "/images/partners/frontrunner.webp" },
  { name: "Trail Gecko", logo: "/images/partners/trailgecko.webp" },
  { name: "Total Hitch", logo: "/images/partners/totalhitch.webp" },
  { name: "Tough Dog", logo: "/images/partners/toughdog.webp" },
  { name: "Splitfire", logo: "/images/partners/splitfire.webp" },
];

export default function AccreditationsPartners() {
  const sectionRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          gsap.to(".accred-header > *", {
            opacity: 1,
            y: 0,
            duration: 1,
            stagger: 0.15,
            ease: "power3.out",
            overwrite: "auto",
          });
          gsap.to(".accred-item", {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "power3.out",
            delay: 0.3,
            overwrite: "auto",
          });
          gsap.to(".partner-section", {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            delay: 0.5,
            overwrite: "auto",
          });
          gsap.to(".partner-logo", {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.08,
            ease: "power3.out",
            delay: 0.7,
            overwrite: "auto",
          });
        } else {
          gsap.to(".accred-header > *", { opacity: 0, y: 40, duration: 0.5, overwrite: "auto" });
          gsap.to(".accred-item", { opacity: 0, y: 20, duration: 0.4, overwrite: "auto" });
          gsap.to(".partner-section", { opacity: 0, y: 20, duration: 0.4, overwrite: "auto" });
          gsap.to(".partner-logo", { opacity: 0, y: 15, duration: 0.3, overwrite: "auto" });
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative bg-gray-50 overflow-hidden py-16 md:py-24 border-t border-gray-100"
      id="accreditations"
    >
      <div className="max-w-[1820px] mx-auto px-6 sm:px-10 lg:px-16">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16 accred-header">
          <div className="flex items-center justify-center gap-3 mb-4 opacity-0 translate-y-10">
            <div className="h-[2px] w-8 bg-brand-blue" />
            <span className="text-sm font-bold tracking-[0.3em] uppercase text-brand-blue">
              Accreditations & Partners
            </span>
            <div className="h-[2px] w-8 bg-brand-blue" />
          </div>
          <h2 className="text-2xl md:text-4xl font-black text-brand-dark uppercase tracking-tight opacity-0 translate-y-10">
            Trusted By Industry Leaders
          </h2>
        </div>

        {/* Accreditations — No dark background */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12 md:gap-20 lg:gap-28 mb-16 md:mb-20">
          {ACCREDITATIONS.map((acc, idx) => (
            <div
              key={idx}
              className="accred-item flex items-center gap-4 opacity-0 translate-y-5"
            >
              <img
                src={acc.logo}
                alt={acc.name}
                className="object-contain h-10 md:h-14 w-auto flex-shrink-0"
              />
              <div className="flex flex-col">
                <span className="text-brand-dark font-black text-sm md:text-base uppercase tracking-wider leading-tight">
                  {acc.title}
                </span>
                <span className="text-gray-400 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] leading-tight">
                  {acc.subtitle}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Partners — Static Grid */}
        <div className="partner-section opacity-0 translate-y-5">
          <div className="text-center mb-8 md:mb-10">
            <div className="flex items-center justify-center gap-3">
              <div className="h-[1px] w-12 bg-gray-200" />
              <span className="text-xs font-bold tracking-[0.3em] uppercase text-gray-400">
                Our Trusted Partners
              </span>
              <div className="h-[1px] w-12 bg-gray-200" />
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-6 md:gap-8 items-center justify-items-center max-w-5xl mx-auto">
            {PARTNERS.map((partner, idx) => (
              <div
                key={idx}
                className="partner-logo flex items-center justify-center h-[60px] md:h-[80px] opacity-0 translate-y-4"
              >
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="h-10 md:h-12 w-auto object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
