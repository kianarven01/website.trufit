"use client";

import { useRef } from "react";
import Link from "next/link";
import { Phone } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export default function ContactCTA() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reveals = gsap.utils.toArray<HTMLElement>(".contact-cta-reveal");
      reveals.forEach((item, i) => {
        gsap.fromTo(
          item,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            delay: i * 0.12,
            ease: "power3.out",
            scrollTrigger: {
              trigger: item,
              start: "top 92%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="contact-cta py-20 md:py-28"
      id="contact-cta"
    >
      <div className="max-w-3xl mx-auto px-6 sm:px-10 lg:px-16 text-center relative z-10">
        {/* Label */}
        <div className="contact-cta-reveal flex items-center justify-center gap-3 mb-6">
          <div className="h-[1px] w-12 bg-brand-red/40" />
          <span className="text-white/40 text-[10px] font-bold tracking-[0.4em] uppercase">
            Ready to Go?
          </span>
          <div className="h-[1px] w-12 bg-brand-red/40" />
        </div>

        {/* Title */}
        <h2 className="contact-cta-reveal text-3xl md:text-5xl font-black text-white font-brawler leading-tight uppercase tracking-tight mb-6">
          Book Your{" "}
          <span className="text-brand-red">Appointment</span>
          <br />
          Today
        </h2>

        {/* Subtitle */}
        <p className="contact-cta-reveal text-white/50 text-base md:text-lg leading-relaxed max-w-xl mx-auto mb-10 font-medium">
          Whether it&apos;s routine maintenance or a complex repair, your vehicle 
          is in expert hands. Schedule your visit and experience the Trufit difference.
        </p>

        {/* Buttons */}
        <div className="contact-cta-reveal flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/#appointment"
            className="bg-brand-blue text-white px-10 py-5 rounded-sm font-black hover:bg-white hover:text-brand-dark transition-all uppercase tracking-[0.2em] text-xs text-center shadow-lg shadow-brand-blue/20"
          >
            Book Appointment
          </Link>
          <a
            href="tel:09187747788"
            className="border-2 border-white/20 text-white px-10 py-5 rounded-sm font-black hover:bg-white hover:text-brand-dark transition-all uppercase tracking-[0.2em] text-xs text-center flex items-center justify-center gap-2"
          >
            <Phone size={14} />
            Call Us Now
          </a>
        </div>
      </div>
    </section>
  );
}
