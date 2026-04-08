"use client"

import { useRef, useEffect, useState } from "react" // Added useState
import Image from "next/image"
import AppointmentForm from "./appointmentform"
import { MapPin, Phone, Mail, Clock } from "lucide-react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"

gsap.registerPlugin(ScrollTrigger)

export default function AppointmentSection() {
  const container = useRef<HTMLDivElement>(null)
  const backgroundImage = "" // Add your image path here
  
  // State to hold promo data
  const [promoData, setPromoData] = useState<any>(null);

  useEffect(() => {
    // Listener for the Promo Popup event
    const handleClaim = (e: any) => {
      setPromoData(e.detail);
    };

    window.addEventListener("claimOffer", handleClaim);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Left Column Content Scroll Reveal
          gsap.to(".appointment-content > *", {
            opacity: 1,
            x: 0,
            duration: 1,
            stagger: 0.15,
            ease: "power3.out",
            overwrite: "auto"
          })

          // Contact Info Items Stagger
          gsap.to(".contact-item", {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.out",
            delay: 0.4,
            overwrite: "auto"
          })

          // Right Column Form Reveal
          gsap.to(".appointment-form-container", {
            opacity: 1,
            x: 0,
            scale: 1,
            duration: 1.2,
            ease: "power4.out",
            delay: 0.2,
            overwrite: "auto"
          })
        } else {
          // Reverse
          gsap.to(".appointment-content > *", { opacity: 0, x: -50, duration: 0.5, overwrite: "auto" })
          gsap.to(".contact-item", { opacity: 0, y: 20, duration: 0.5, overwrite: "auto" })
          gsap.to(".appointment-form-container", { opacity: 0, x: 50, scale: 0.95, duration: 0.5, overwrite: "auto" })
        }
      },
      { threshold: 0.15 }
    )

    if (container.current) {
      observer.observe(container.current)
    }

    return () => {
      observer.disconnect();
      window.removeEventListener("claimOffer", handleClaim);
    }
  }, [])

  return (
    <section ref={container} className="relative bg-brand-dark py-16 md:py-24 overflow-hidden" id="appointment">
      {/* BACKGROUND IMAGE & OVERLAY */}
      <div className="absolute inset-0 z-0 opacity-20">
        {backgroundImage ? (
          <Image src={backgroundImage} fill alt="Appointment Background" className="object-cover" />
        ) : (
          <div className="w-full h-full bg-brand-dark flex items-center justify-center">
             <div className="w-full h-full bg-[radial-gradient(circle_at_center,rgba(227,27,35,0.05)_0%,transparent_100%)]" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/80 to-transparent" />
      </div>

      <div className="relative z-10 max-w-[1820px] mx-auto px-6 sm:px-10 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">

          {/* LEFT COLUMN */}
          <div className="space-y-6 md:space-y-8 appointment-content">
            {/* SMALL TITLE WITH LINE */}
            <div className="flex items-center gap-4 opacity-0 -translate-x-12">
              <div className="h-[2px] w-10 bg-brand-red"></div>
              <p className="text-sm font-semibold uppercase tracking-wider text-white/60">
                get in touch
              </p>
            </div>

            {/* MAIN TITLE */}
            <h2 className="text-4xl md:text-6xl font-semibold leading-tight text-white opacity-0 -translate-x-12">
              Schedule Your <br />
              <span className="text-brand-red uppercase">Appointment</span>
            </h2>

            {/* SUBTITLE */}
            <p className="text-gray-300 max-w-lg opacity-0 -translate-x-12">
              Ready to experience quality auto care? Contact us today or fill
              out the form to book your next service appointment.
            </p>

            {/* CONTACT INFO */}
            <div className="space-y-4 md:space-y-6 pt-2 md:pt-4 contact-info">
              <div className="flex items-start gap-3 md:gap-4 contact-item opacity-0 translate-y-6">
                <MapPin className="w-5 h-5 text-brand-red mt-1" />
                <a
                  href="https://maps.app.goo.gl/aPGe5t9YmpYhqZNQ8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-200 hover:underline text-sm md:text-base"
                >
                  P1, Brgy. Gahonon, Daet, Camarines Norte
                </a>
              </div>
              <div className="flex items-start gap-3 md:gap-4 contact-item opacity-0 translate-y-6">
                <Phone className="w-5 h-5 text-brand-red mt-1" />
                <a href="tel:09187747788" className="text-gray-200 hover:underline text-sm md:text-base">
                  0918-774-7788
                </a>
              </div>
              <div className="flex items-start gap-3 md:gap-4 contact-item opacity-0 translate-y-6">
                <Mail className="w-5 h-5 text-brand-red mt-1" />
                <a href="mailto:trufitautocenter@gmail.com" className="text-gray-200 hover:underline text-sm md:text-base">
                  trufitautocenter@gmail.com
                </a>
              </div>
              <div className="flex items-start gap-3 md:gap-4 contact-item opacity-0 translate-y-6">
                <Clock className="w-5 h-5 text-brand-red mt-1" />
                <p className="text-gray-200 text-sm md:text-base">
                  Mon – Sat: 8:00 AM – 5:00 PM
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - GLASSMORPHISM FORM */}
          <div className="relative mt-12 lg:mt-0 appointment-form-container opacity-0 translate-x-12 scale-95">
            <div className="bg-[rgba(255,255,255,0.06)] backdrop-blur-[31px] border border-[rgba(255,255,255,0.1)] rounded-sm shadow-premium p-6 md:p-10 transition duration-300">
              {/* Passed promoData to the form */}
              <AppointmentForm initialData={promoData} />
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}