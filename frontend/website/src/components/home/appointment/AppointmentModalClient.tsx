"use client"
import { useModalStore } from "@/store/useModalStore"

export default function AppointmentModalClient() {
  const openAppointment = useModalStore((s) => s.openAppointment)
  const isAppointmentOpen = useModalStore((s) => s.isAppointmentOpen)
  const closeAppointment = useModalStore((s) => s.closeAppointment)

  return (
    <>
      <button
        onClick={openAppointment}
        className="bg-brand-red text-white px-12 py-5 rounded-sm font-black hover:bg-white hover:text-brand-dark transition-all uppercase tracking-[0.2em] text-xs shadow-xl shadow-brand-red/20"
      >
        Book Appointment
      </button>
    </>
  )
}