"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useModalStore } from "@/store/useModalStore";

gsap.registerPlugin(ScrollTrigger);

export default function GalleryCTA() {
  const containerRef = useRef<HTMLDivElement>(null);
  const openAppointment = useModalStore((s) => s.openAppointment);

  useGSAP(() => {
    gsap.to(".cta-parallax-bg", {
      yPercent: 30,
      ease: "none",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="bg-brand-dark py-24 md:py-32 relative overflow-hidden">
      {/* Parallax Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="cta-parallax-bg absolute top-[-20%] left-0 w-full h-[140%]">
          <Image 
              src="/images/gallery/laboratory.webp"
              alt="Trufit Automotive Facility"
              fill
              className="object-cover opacity-40"
              sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/80 via-brand-dark/40 to-brand-dark" />
      </div>

      <div className="max-w-[1820px] mx-auto px-6 sm:px-10 lg:px-16 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-semibold text-white mb-8 uppercase tracking-tight">Ready to see the <br className="md:hidden" /> <span className="text-brand-red">Trufit difference?</span></h2>
          <p className="text-white/60 mb-12 max-w-2xl mx-auto font-medium">Experience professional-grade automotive care with the technologies you've seen here. Book your appointment today.</p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button 
              onClick={openAppointment}
              className="bg-brand-red text-white px-12 py-5 rounded-sm font-semibold hover:bg-white hover:text-brand-dark transition-all uppercase tracking-[0.2em] text-xs shadow-xl shadow-brand-red/20 outline-none"
            >
              Book Appointment
            </button>
             <Link 
              href="/contact"
              className="border-2 border-white/20 text-white px-12 py-5 rounded-sm font-semibold hover:bg-white hover:text-brand-dark transition-all uppercase tracking-[0.2em] text-xs backdrop-blur-sm"
            >
              Contact Us
            </Link>
          </div>
      </div>
    </section>
  );
}
