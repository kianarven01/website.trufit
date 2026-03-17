"use client"

import AppointmentForm from "./appointmentform"
import { MapPin, Phone, Mail, Clock } from "lucide-react"

export default function AppointmentSection() {
  return (
    <section className="bg-gray-100 py-16 md:py-24" id="appointment">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 md:px-16 lg:px-24 xl:px-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-start"> {/* <-- changed items-end to items-start */}

          {/* LEFT COLUMN */}
          <div className="space-y-6 md:space-y-8">
            {/* SMALL TITLE WITH LINE */}
            <div className="flex items-center gap-4">
              <div className="h-[2px] w-10 bg-blue-600"></div>
              <p className="text-sm font-semibold uppercase tracking-wider text-gray-600">
                get in touch
              </p>
            </div>

            {/* MAIN TITLE */}
            <h2 className="text-3xl md:text-5xl font-bold leading-tight">
              Schedule Your <span className="text-blue-600">Appointment</span>
            </h2>

            {/* SUBTITLE */}
            <p className="text-gray-600 max-w-lg">
              Ready to experience quality auto care? Contact us today or fill
              out the form to book your next service appointment.
            </p>

            {/* CONTACT INFO */}
            <div className="space-y-4 md:space-y-6 pt-2 md:pt-4">
              <div className="flex items-start gap-3 md:gap-4">
                <MapPin className="w-5 h-5 text-red-600 mt-1" />
                <a
                  href="https://maps.app.goo.gl/aPGe5t9YmpYhqZNQ8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-700 hover:underline text-sm md:text-base"
                >
                  P1, Brgy. Gahonon, Daet, Camarines Norte
                </a>
              </div>
              <div className="flex items-start gap-3 md:gap-4">
                <Phone className="w-5 h-5 text-red-600 mt-1" />
                <a href="tel:09187747788" className="text-gray-700 hover:underline text-sm md:text-base">
                  0918-774-7788
                </a>
              </div>
              <div className="flex items-start gap-3 md:gap-4">
                <Mail className="w-5 h-5 text-red-600 mt-1" />
                <a href="mailto:trufitautocenter@gmail.com" className="text-gray-700 hover:underline text-sm md:text-base">
                  trufitautocenter@gmail.com
                </a>
              </div>
              <div className="flex items-start gap-3 md:gap-4">
                <Clock className="w-5 h-5 text-red-600 mt-1" />
                <p className="text-gray-700 text-sm md:text-base">
                  Mon – Sat: 8:00 AM – 5:00 PM
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - GLASSMORPHISM FORM */}
          <div className="relative mt-8 md:mt-0"> {/* remove flex and justify-end */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl p-6 md:p-10 hover:bg-white/20 transition duration-300">
              <AppointmentForm />
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}