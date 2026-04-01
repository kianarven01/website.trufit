"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useModalStore } from "@/store/useModalStore";

gsap.registerPlugin(ScrollTrigger);

export default function AboutCTA() {
  const sectionRef = useRef<HTMLDivElement>(null);

  const openAppointment = useModalStore((s) => s.openAppointment);
  const isAppointmentOpen = useModalStore((s) => s.isAppointmentOpen);
  const closeAppointment = useModalStore((s) => s.closeAppointment);
  
  useGSAP(() => {
    const reveals = gsap.utils.toArray<HTMLElement>(".cta-reveal");
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
  }, { scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      className="about-cta py-20 md:py-28"
      id="about-cta"
    >
      <div className="max-w-3xl mx-auto px-6 sm:px-10 lg:px-16 text-center relative z-10">
        <div className="cta-reveal flex items-center justify-center gap-3 mb-6">
          <div className="h-[1px] w-12 bg-brand-red/40" />
          <span className="text-white/40 text-[10px] font-bold tracking-[0.4em] uppercase">
            Get Started
          </span>
          <div className="h-[1px] w-12 bg-brand-red/40" />
        </div>

        <h2 className="cta-reveal text-3xl md:text-5xl font-black text-white font-brawler leading-tight uppercase tracking-tight mb-6">
          Ready to Experience<br />
          <span className="text-brand-red">the Difference?</span>
        </h2>

        <p className="cta-reveal text-white/50 text-base md:text-lg leading-relaxed max-w-xl mx-auto mb-10 font-medium">
          Whether it&apos;s a routine checkup or a complex repair, your vehicle
          is in expert hands. Book your appointment today and see why Trufit
          is the name our community trusts.
        </p>

        <div className="cta-reveal flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={openAppointment}
            className="bg-brand-blue text-white px-10 py-5 rounded-sm font-black hover:bg-white hover:text-brand-dark transition-all uppercase tracking-[0.2em] text-xs text-center shadow-lg shadow-brand-blue/20"
          >
            Book Appointment
          </button>
          <Link
            href="/contact"
            className="border-2 border-white/20 text-white px-10 py-5 rounded-sm font-black hover:bg-white hover:text-brand-dark transition-all uppercase tracking-[0.2em] text-xs text-center"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </section>
  );
}
