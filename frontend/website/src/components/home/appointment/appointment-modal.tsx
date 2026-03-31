"use client"

import { useEffect, useState, useRef, useLayoutEffect } from "react"
import { X, MapPin, Phone, Mail, Clock } from "lucide-react"
import AppointmentForm from "./appointmentform"
import gsap from "gsap"

interface AppointmentModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AppointmentModal({ isOpen, onClose }: AppointmentModalProps) {
  const [promoData, setPromoData] = useState<any>(null)
  const [visible, setVisible] = useState(false)

  const leftRef = useRef<HTMLDivElement>(null)
  const rightRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClaim = (e: any) => {
      setPromoData(e.detail)
      handleClose()
      setTimeout(() => window.dispatchEvent(new Event("openAppointment")), 0)
    }

    window.addEventListener("claimOffer", handleClaim)
    return () => window.removeEventListener("claimOffer", handleClaim)
  }, [])

  useEffect(() => {
    if (isOpen) setVisible(true)
  }, [isOpen])

  useLayoutEffect(() => {
    if (visible && isOpen) {
      gsap.fromTo(leftRef.current, { opacity: 0, x: -50 }, { opacity: 1, x: 0, duration: 0.8, ease: "power3.out" })
      gsap.fromTo(rightRef.current, { opacity: 0, x: 50, scale: 0.95 }, { opacity: 1, x: 0, scale: 1, duration: 0.8, ease: "power3.out", delay: 0.1 })
      gsap.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power1.out" })
    }
  }, [visible, isOpen])

  const handleClose = () => {
    if (!leftRef.current || !rightRef.current || !containerRef.current) return

    gsap.to(leftRef.current, { opacity: 0, x: -50, duration: 0.3, ease: "power1.in" })
    gsap.to(rightRef.current, { opacity: 0, x: 50, scale: 0.95, duration: 0.3, ease: "power1.in" })
    gsap.to(containerRef.current, {
      opacity: 0,
      duration: 0.3,
      ease: "power1.in",
      onComplete: () => setVisible(false)
    })

    onClose()
  }

  if (!visible) return null

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[1000] flex items-start md:items-top justify-center bg-black/25 backdrop-blur-[2px] p-0 md:p-10 overflow-y-auto"
    >
      <div className="relative w-full h-full md:h-auto md:w-auto max-w-full md:max-w-4xl rounded-none md:rounded-xl shadow-2xl overflow-y-auto grid grid-cols-1 md:grid-cols-2 bg-brand-dark
                      scrollbar-none">

        {/* CLOSE BUTTON */}
        <button
          onClick={handleClose}
          className="fixed top-4 right-4 md:absolute md:top-3 md:right-3 text-white hover:text-gray-300 z-30"
        >
          <X size={28} />
        </button>

        {/* LEFT COLUMN */}
        <div ref={leftRef} className="flex flex-col justify-start gap-4 p-6 md:p-10 text-white">
          <div className="flex items-center gap-2">
            <div className="h-[2px] w-10 bg-brand-blue"></div>
            <p className="text-sm font-semibold uppercase tracking-wider text-white/60">get in touch</p>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold font-brawler">
            Schedule Your <br />
            <span className="text-brand-blue uppercase">Appointment</span>
          </h2>

          <p className="text-gray-300 max-w-md">
            Ready to experience quality auto care? Contact us today or fill out the form to book your next service appointment.
          </p>

          <div className="space-y-2 mt-4 text-gray-200">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-brand-blue mt-1" />
              <a href="https://maps.app.goo.gl/aPGe5t9YmpYhqZNQ8" target="_blank" rel="noopener noreferrer" className="hover:underline">
                P1, Brgy. Gahonon, Daet, Camarines Norte
              </a>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-brand-blue mt-1" />
              <a href="tel:09187747788" className="hover:underline">0918-774-7788</a>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-brand-blue mt-1" />
              <a href="mailto:trufitautocenter@gmail.com" className="hover:underline">trufitautocenter@gmail.com</a>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-brand-blue mt-1" />
              <p>Mon – Sat: 8:00 AM – 5:00 PM</p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div ref={rightRef} className="relative p-6 md:p-10">
          <AppointmentForm initialData={promoData} />
        </div>
      </div>
    </div>
  )
}