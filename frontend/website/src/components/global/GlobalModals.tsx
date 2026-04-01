// src/components/global/GlobalModals.tsx
"use client"

import AppointmentModal from "@/components/home/appointment/appointment-modal"
import { useModalStore } from "@/store/useModalStore"

export default function GlobalModals() {
  const isOpen = useModalStore((s) => s.isAppointmentOpen)
  const close = useModalStore((s) => s.closeAppointment)

  return (
    <>
      <AppointmentModal isOpen={isOpen} onClose={close} />
    </>
  )
}