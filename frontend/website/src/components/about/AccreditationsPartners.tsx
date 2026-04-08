"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

const ACCREDITATIONS = [
  {
    name: "Suzuki",
    logo: "/images/accreditations/suzuki.webp",
    realImage: "/images/about/accreditation_real/suzuki.jpg",
    title: "AUTHORIZED",
    subtitle: "SERVICE STATION",
  },
  {
    name: "DTI",
    logo: "/images/accreditations/dti.webp",
    realImage: "/images/about/accreditation_real/dti.jpg",
    title: "5 STAR",
    subtitle: "ACCREDITED",
  },
  {
    name: "Bagwis",
    logo: "/images/accreditations/bagwis.webp",
    realImage: "/images/about/accreditation_real/bagwis.jpg",
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

  useGSAP(() => {
    // Header Reveal
    gsap.fromTo(".accred-header-item", 
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".accred-header",
          start: "top 85%",
          toggleActions: "play none none reverse",
        }
      }
    );

    // Accreditations Reveal
    gsap.fromTo(".accred-item", 
      { opacity: 0, y: 60 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".accred-grid",
          start: "top 85%",
          toggleActions: "play reverse play reverse",
        }
      }
    );

    // Partners Reveal
    gsap.fromTo(".partner-reveal", 
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".partner-section",
          start: "top 92%",
          toggleActions: "play reverse play reverse",
        }
      }
    );
  }, { scope: sectionRef });

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
            <div className="accred-header-item flex items-center justify-center gap-3 mb-4">
              <div className="h-[2px] w-8 bg-brand-red" />
              <span className="text-sm font-semibold tracking-[0.3em] uppercase text-brand-red">
                Trust & Authenticity
              </span>
              <div className="h-[2px] w-8 bg-brand-red" />
            </div>
            <h2 className="accred-header-item text-3xl md:text-5xl font-semibold text-brand-dark uppercase tracking-tight">
              Accreditations & Partners
            </h2>
            <p className="accred-header-item max-w-2xl mt-6 text-gray-500 font-medium leading-relaxed">
              Our commitment to quality is backed by official certifications and
              long-standing partnerships with global industry leaders.
            </p>
          </div>
        </div>

        {/* Accreditations — AUTHENTICITY CARDS */}
        <div className="accred-grid grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 mb-20 md:mb-28">
          {ACCREDITATIONS.map((acc, idx) => (
            <div
              key={idx}
              className="accred-item group bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-2 transition-[box-shadow,transform] duration-500"
            >
              {/* Photo for REAL evidence */}
              <div className="relative aspect-[4/3] bg-gray-900 overflow-hidden">
                <Image 
                  src={acc.realImage}
                  alt={`${acc.name} Accreditation`}
                  fill
                  priority
                  className="object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                />
                
                {/* Overlay with small logo to confirm what it is */}
                <div className="absolute bottom-4 right-4 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-sm border border-white/10">
                  <img
                    src={acc.logo}
                    alt=""
                    className="h-5 w-auto object-contain brightness-0 invert opacity-70"
                  />
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
                  <span className="text-brand-dark font-semibold text-base md:text-lg uppercase tracking-wider leading-tight">
                    {acc.title}
                  </span>
                  <span className="text-brand-red/70 text-[10px] md:text-xs font-semibold uppercase tracking-[0.2em] mt-1 leading-tight">
                    {acc.subtitle}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Partners — Static Grid with cleaner spacing */}
        <div className="partner-section">
          <div className="partner-reveal flex flex-col items-center mb-12">
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
                className="partner-reveal partner-logo flex-shrink-0 w-[70vw] sm:w-[40vw] lg:w-full snap-center flex items-center justify-center h-[100px] md:h-[140px]"
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
