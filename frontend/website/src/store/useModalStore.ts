// src/store/useModalStore.ts
import { create } from "zustand"

interface ModalState {
  isAppointmentOpen: boolean
  openAppointment: () => void
  closeAppointment: () => void
}

export const useModalStore = create<ModalState>((set) => ({
  isAppointmentOpen: false,
  openAppointment: () => set({ isAppointmentOpen: true }),
  closeAppointment: () => set({ isAppointmentOpen: false }),
}))