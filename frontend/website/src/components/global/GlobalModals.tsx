// src/components/global/GlobalModals.tsx
"use client"

import { useEffect } from "react"
import AppointmentModal from "@/components/home/appointment/appointment-modal"
import { useModalStore } from "@/store/useModalStore"

export default function GlobalModals() {
  const isOpen = useModalStore((s) => s.isAppointmentOpen)
  const close = useModalStore((s) => s.closeAppointment)
  const openAppointment = useModalStore((s) => s.openAppointment)

  useEffect(() => {
    const checkHash = () => {
      if (typeof window !== "undefined" && window.location.hash === "#book") {
        openAppointment()
      }
    }

    // Check on initial load
    checkHash()

    // Listen for URL hash changes
    window.addEventListener("hashchange", checkHash)
    return () => window.removeEventListener("hashchange", checkHash)
  }, [openAppointment])

  return (
    <>
      <AppointmentModal />
    </>
  )
}