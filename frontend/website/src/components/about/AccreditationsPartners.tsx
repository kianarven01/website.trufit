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
          gsap.to(".accred-header [class*='opacity-0']", {
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
          gsap.to(".accred-header [class*='opacity-0']", { opacity: 0, y: 40, duration: 0.5, overwrite: "auto" });
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
      className="relative bg-[#f8f9fa] overflow-hidden py-24 md:py-32 border-t-[1px] border-gray-200/60"
      id="accreditations"
    >
      <div className="max-w-[1820px] mx-auto px-6 sm:px-10 lg:px-16">
        {/* Section Header with more distinction */}
        <div className="text-center mb-16 md:mb-24 accred-header">
          <div className="inline-flex flex-col items-center">
            <div className="flex items-center justify-center gap-3 mb-4 opacity-0 translate-y-10">
              <div className="h-[2px] w-8 bg-brand-blue" />
              <span className="text-sm font-bold tracking-[0.3em] uppercase text-brand-blue">
                Trust & Authenticity
              </span>
              <div className="h-[2px] w-8 bg-brand-blue" />
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-brand-dark uppercase tracking-tight opacity-0 translate-y-10">
              Accreditations & Partners
            </h2>
            <p className="max-w-2xl mt-6 text-gray-500 font-medium leading-relaxed opacity-0 translate-y-10">
              Our commitment to quality is backed by official certifications and 
              long-standing partnerships with global industry leaders.
            </p>
          </div>
        </div>

        {/* Accreditations — AUTHENTICITY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 mb-20 md:mb-28">
          {ACCREDITATIONS.map((acc, idx) => (
            <div
              key={idx}
              className="accred-item group bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 opacity-0 translate-y-5"
            >
              {/* Photo Placeholder for REAL evidence */}
              <div className="relative aspect-[4/3] bg-gray-900 overflow-hidden">
                <div className="absolute inset-0 opacity-40 group-hover:scale-110 transition-transform duration-700">
                  {/* Subtle pattern or gradient for the placeholder */}
                  <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900" />
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4 border border-white/20 backdrop-blur-sm">
                   <svg className="w-8 h-8 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span className="text-white/50 text-xs font-bold uppercase tracking-widest leading-tight">
                    Photo of Physical<br/>Accreditation / Seal
                  </span>
                </div>
                {/* Overlay with small logo to confirm what it is */}
                <div className="absolute bottom-4 right-4 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-sm border border-white/10">
                   <img src={acc.logo} alt="" className="h-5 w-auto object-contain brightness-0 invert opacity-70" />
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-6 md:p-8 flex items-center gap-5">
                <div className="w-14 h-14 flex-shrink-0 bg-gray-50 rounded-lg p-2 flex items-center justify-center border border-gray-100 group-hover:bg-white transition-colors duration-300">
                  <img
                    src={acc.logo}
                    alt={acc.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-brand-dark font-black text-base md:text-lg uppercase tracking-wider leading-tight">
                    {acc.title}
                  </span>
                  <span className="text-brand-blue/70 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] mt-1 leading-tight">
                    {acc.subtitle}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Partners — Static Grid with cleaner spacing */}
        <div className="partner-section opacity-0 translate-y-5">
          <div className="flex flex-col items-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="h-[1px] w-6 bg-gray-300" />
              <span className="text-[10px] md:text-xs font-bold tracking-[0.4em] uppercase text-gray-400">
                Official Supply Partners
              </span>
              <div className="h-[1px] w-6 bg-gray-300" />
            </div>
          </div>

          <div className="flex lg:grid lg:grid-cols-3 flex-nowrap lg:flex-wrap overflow-x-auto lg:overflow-x-visible snap-x snap-mandatory lg:snap-none gap-x-8 lg:gap-x-12 gap-y-16 items-center lg:justify-items-center max-w-5xl mx-auto px-6 pb-10 lg:pb-0 no-scrollbar">
            {PARTNERS.map((partner, idx) => (
              <div
                key={idx}
                className="partner-logo flex-shrink-0 w-[70vw] sm:w-[40vw] lg:w-full snap-center flex items-center justify-center h-[100px] md:h-[140px] opacity-0 translate-y-4"
              >
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="h-12 md:h-20 w-auto object-contain transition-all duration-500 cursor-default"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
