"use client";

import { useRef } from "react";
import Image from "next/image";
import ContactHero from "./ContactHero";
import LocationSection from "./LocationSection";
import FAQSection from "./FAQSection";
import ContactCTA from "./ContactCTA";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import "./contact.css";

gsap.registerPlugin(ScrollTrigger);

export default function ContactPage() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const bgImageRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.to(bgImageRef.current, {
        yPercent: 20,
        ease: "none",
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    },
    { scope: wrapperRef }
  );

  return (
    <div id="contact-page">
      <ContactHero />
      <LocationSection />

      {/* Shared parallax background wrapper for FAQ + CTA */}
      <div ref={wrapperRef} className="relative overflow-hidden">
        {/* Single shared background image */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div ref={bgImageRef} className="absolute inset-0 -top-24 -bottom-24">
            <Image
              src="/images/contact/lounge2.jpg"
              alt="Trufit Auto Center"
              fill
              className="object-cover object-center"
            />
          </div>
          <div className="absolute inset-0 bg-black/50 z-10" />
        </div>

        <FAQSection />
        <ContactCTA />
      </div>
    </div>
  );
}
