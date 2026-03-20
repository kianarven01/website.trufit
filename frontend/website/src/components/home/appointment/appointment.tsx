"use client"

import { useRef } from "react"
import AppointmentForm from "./appointmentform"
import { MapPin, Phone, Mail, Clock } from "lucide-react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"

gsap.registerPlugin(ScrollTrigger)

export default function AppointmentSection() {
  const container = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add("(min-width: 768px)", () => {
        // Left Column Content Scroll Reveal
        gsap.fromTo(".appointment-content > *",
          { opacity: 0, x: -50 },
          {
            opacity: 1,
            x: 0,
            duration: 1,
            stagger: 0.15,
            ease: "power3.out",
            scrollTrigger: {
              trigger: ".appointment-content",
              start: "top 85%",
              toggleActions: "play reverse play reverse",
            }
          }
        )

        // Contact Info Items Stagger
        gsap.fromTo(".contact-item",
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: ".contact-info",
              start: "top 90%",
              toggleActions: "play reverse play reverse",
            }
          }
        )

        // Right Column Form Reveal
        gsap.fromTo(".appointment-form-container",
          { opacity: 0, x: 50, scale: 0.95 },
          {
            opacity: 1,
            x: 0,
            scale: 1,
            duration: 1.2,
            ease: "power4.out",
            scrollTrigger: {
              trigger: ".appointment-form-container",
              start: "top 80%",
              toggleActions: "play reverse play reverse",
            }
          }
        )
      })

      return () => mm.revert()
    },
    { scope: container }
  )

  return (
    <section ref={container} className="bg-gray-100 py-16 md:py-24 overflow-hidden" id="appointment">
      <div className="max-w-[1820px] mx-auto px-6 sm:px-10 lg:px-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-start">

          {/* LEFT COLUMN */}
          <div className="space-y-6 md:space-y-8 appointment-content">
            {/* SMALL TITLE WITH LINE */}
            <div className="flex items-center gap-4 opacity-0">
              <div className="h-[2px] w-10 bg-brand-blue"></div>
              <p className="text-sm font-semibold uppercase tracking-wider text-gray-600">
                get in touch
              </p>
            </div>

            {/* MAIN TITLE */}
            <h2 className="text-4xl md:text-6xl font-bold leading-tight font-brawler text-brand-dark opacity-0">
              Schedule Your <br />
              <span className="text-brand-blue uppercase">Appointment</span>
            </h2>

            {/* SUBTITLE */}
            <p className="text-gray-600 max-w-lg opacity-0">
              Ready to experience quality auto care? Contact us today or fill
              out the form to book your next service appointment.
            </p>

            {/* CONTACT INFO */}
            <div className="space-y-4 md:space-y-6 pt-2 md:pt-4 contact-info">
              <div className="flex items-start gap-3 md:gap-4 contact-item opacity-0">
                <MapPin className="w-5 h-5 text-brand-red mt-1" />
                <a
                  href="https://maps.app.goo.gl/aPGe5t9YmpYhqZNQ8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-700 hover:underline text-sm md:text-base"
                >
                  P1, Brgy. Gahonon, Daet, Camarines Norte
                </a>
              </div>
              <div className="flex items-start gap-3 md:gap-4 contact-item opacity-0">
                <Phone className="w-5 h-5 text-brand-red mt-1" />
                <a href="tel:09187747788" className="text-gray-700 hover:underline text-sm md:text-base">
                  0918-774-7788
                </a>
              </div>
              <div className="flex items-start gap-3 md:gap-4 contact-item opacity-0">
                <Mail className="w-5 h-5 text-brand-red mt-1" />
                <a href="mailto:trufitautocenter@gmail.com" className="text-gray-700 hover:underline text-sm md:text-base">
                  trufitautocenter@gmail.com
                </a>
              </div>
              <div className="flex items-start gap-3 md:gap-4 contact-item opacity-0">
                <Clock className="w-5 h-5 text-brand-red mt-1" />
                <p className="text-gray-700 text-sm md:text-base">
                  Mon – Sat: 8:00 AM – 5:00 PM
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - GLASSMORPHISM FORM */}
          <div className="relative mt-8 md:mt-0 appointment-form-container opacity-0">
            <div className="bg-white border border-gray-100 rounded-sm shadow-premium p-6 md:p-10 transition duration-300">
              <AppointmentForm />
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}