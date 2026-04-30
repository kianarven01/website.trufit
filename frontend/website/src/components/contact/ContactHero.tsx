"use client";

import { useRef } from "react";
import Image from "next/image";
import { Phone, Mail, MapPin, Clock, Headset, MessageSquareText, Wrench } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import ContactForm from "./ContactForm";

gsap.registerPlugin(ScrollTrigger);

const supportCards = [
  {
    icon: Headset,
    title: "Service Inquiries",
    description:
      "Our team is available to answer your questions about any of our automotive services.",
    color: "text-brand-red",
    bg: "bg-brand-red/10",
  },
  {
    icon: MessageSquareText,
    title: "Feedback & Suggestions",
    description:
      "We value your feedback and are always looking to improve. Your input shapes our future.",
    color: "text-brand-red",
    bg: "bg-brand-red/10",
  },
  {
    icon: Wrench,
    title: "Parts & Availability",
    description:
      "Need specific parts or accessories? Reach out and we'll check availability for your vehicle.",
    color: "text-brand-red",
    bg: "bg-brand-red/10",
  },
];

const contactInfo = [
  {
    icon: Mail,
    label: "Email",
    value: "trufitautocenter@gmail.com",
    href: "mailto:trufitautocenter@gmail.com",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "0918-774-7788",
    href: "tel:09187747788",
  },
  {
    icon: MapPin,
    label: "Address",
    value: "P1, Brgy. Gahonon, Daet, Camarines Norte",
    href: "https://maps.app.goo.gl/aPGe5t9YmpYhqZNQ8",
  },
  {
    icon: Clock,
    label: "Hours",
    value: "Mon – Sat: 8:00 AM – 5:00 PM",
    href: null,
  },
];

export default function ContactHero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const bgImageRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Parallax effect for background image
      gsap.to(bgImageRef.current, {
        yPercent: 25,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      // Content entrance animations
      const tl = gsap.timeline({ delay: 0.2 });

      tl.fromTo(
        ".contact-hero-label",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }
      );
      tl.fromTo(
        ".contact-hero-title",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" },
        "-=0.3"
      );
      tl.fromTo(
        ".contact-hero-subtitle",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" },
        "-=0.3"
      );

      // Contact info items stagger
      gsap.fromTo(
        ".contact-info-item",
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          stagger: 0.1,
          delay: 0.8,
          ease: "power2.out",
        }
      );

      // Support cards stagger
      gsap.fromTo(
        ".support-card-animate",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.12,
          delay: 1.2,
          ease: "power3.out",
        }
      );

      gsap.fromTo(
        ".contact-form-animate",
        { opacity: 0, x: 40, scale: 0.98 },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 1.2,
          delay: 0.5,
          ease: "power3.out",
          force3D: true,
        }
      );
    },
    { scope: heroRef }
  );

  return (
    <section
      ref={heroRef}
      className="contact-hero -mt-[112px] md:-mt-[120px] pt-[140px] md:pt-[160px] pb-16 md:pb-24"
      id="contact-hero"
    >
      {/* Background with Parallax */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div ref={bgImageRef} className="absolute inset-0 -top-24 -bottom-24">
          <Image
            src="/images/contact/lounge1.jpg"
            alt="Trufit Auto Center Lounge"
            fill
            className="object-cover object-center"
            priority
            sizes="100vw"
          />
        </div>
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/75 z-10" />
      </div>

      <div className="max-w-[1820px] mx-auto px-6 sm:px-10 lg:px-16 relative z-10">
        {/* Top section: Info + Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* LEFT: Contact Info */}
          <div className="space-y-8">
            {/* Label */}
            <div className="contact-hero-label flex items-center gap-3 opacity-0">
              <div className="h-[2px] w-10 bg-brand-red" />
              <span className="text-white/60 text-xs font-bold tracking-[0.3em] uppercase font-barlow">
                Get In Touch
              </span>
            </div>

            {/* Title */}
            <h1 className="contact-hero-title text-4xl md:text-6xl lg:text-7xl font-semibold text-white leading-[1.05] tracking-tight opacity-0">
              Contact{" "}
              <span className="text-gradient-red">Us</span>
            </h1>

            {/* Subtitle */}
            <p className="contact-hero-subtitle text-white/60 text-base md:text-lg max-w-lg leading-relaxed opacity-0">
              Have a question about our services? Need to schedule a repair?{" "}
              Reach out — we&apos;re ready to help keep your vehicle running at its best.
            </p>

            {/* Contact Info items */}
            <div className="space-y-4 pt-2">
              {contactInfo.map((item, idx) => (
                <div
                  key={idx}
                  className="contact-info-item flex items-center gap-4 opacity-0"
                >
                  <div className="w-10 h-10 shrink-0 rounded-full bg-brand-red/10 flex items-center justify-center">
                    <item.icon className="text-brand-red" size={18} />
                  </div>
                  {item.href ? (
                    <a
                      href={item.href}
                      target={item.href.startsWith("http") ? "_blank" : undefined}
                      rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="text-white/80 text-sm md:text-base hover:text-white transition-colors"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <span className="text-white/80 text-sm md:text-base">{item.value}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Contact Form */}
          <div className="contact-form-animate">
            <div className="contact-form-card">
              <div className="mb-6">
                <h2 className="text-white text-xl font-semibold mb-1 tracking-tight">Send Us a Message</h2>
                <p className="text-white/40 text-sm">We&apos;ll respond within 24 hours</p>
              </div>
              <ContactForm />
            </div>
          </div>
        </div>

        {/* Support Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mt-16 md:mt-20">
          {supportCards.map((card, idx) => (
            <div key={idx} className="support-card support-card-animate opacity-0">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-9 h-9 rounded-full ${card.bg} flex items-center justify-center`}>
                  <card.icon className={card.color} size={18} />
                </div>
                <h3 className="text-white text-sm font-medium uppercase tracking-wider font-barlow">
                  {card.title}
                </h3>
              </div>
              <p className="text-white/45 text-sm leading-relaxed">{card.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
