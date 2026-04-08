"use client"

import React, { useEffect, useState, forwardRef } from "react"
import { services } from "@/data/services"
import { Appointment } from "@/types/appointment"
import DatePicker from "react-datepicker"
import { Calendar, ChevronDown } from "lucide-react"
import "react-datepicker/dist/react-datepicker.css"

// --- custom date input ---
const CustomDateInput = forwardRef<HTMLInputElement, { value?: string; onClick?: () => void; placeholder?: string }>(({ value, onClick, placeholder }, ref) => (
  <div className="relative">
    <input
      type="text"
      onClick={onClick}
      value={value}
      placeholder={placeholder}
      readOnly
      ref={ref}
      className="
        peer w-full bg-white/10 border border-white/20 rounded-sm
        px-4 pt-6 pb-2 placeholder-white/40 text-white
        focus:outline-none focus:ring-1 focus:ring-brand-blue
        transition duration-300 pr-10
      "
    />
    <label className="
      absolute left-4 top-2 text-white/60 text-[10px] uppercase font-bold tracking-wider transition-all
      peer-focus:text-brand-blue
    ">
      Date & Time
    </label>
    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60 pointer-events-none" />
  </div>
))
CustomDateInput.displayName = "CustomDateInput"

// --- main form ---
interface AppointmentFormProps {
  initialData?: any;
}

export default function AppointmentForm({ initialData }: AppointmentFormProps = {}) {
  const [form, setForm] = useState<Appointment>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    date: "",
    service: "",
    message: ""
  })

  const [otherService, setOtherService] = useState("")

  useEffect(() => {
    const handleClaim = (e: any) => {
      const { vehicle, price } = e.detail;
      
      setForm(prev => ({
        ...prev,
        service: "oil-change", 
        message: `Claiming Promo Offer: ₱${price.toLocaleString()} for ${vehicle}.`
      }));
      
      // Clear otherService so the specify input stays hidden/clean
      setOtherService("");
    };

    window.addEventListener("claimOffer", handleClaim);
    return () => window.removeEventListener("claimOffer", handleClaim);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleDateChange = (date: Date | null) => {
    if (date) setForm({ ...form, date: date.toISOString() })
  }

  const inputClass = `
    peer w-full bg-white/10 border border-white/20 rounded-sm
    px-4 pt-6 pb-2 placeholder-white/40 text-white
    focus:outline-none focus:ring-1 focus:ring-brand-blue
    transition duration-300
  `

  const labelClass = `
    absolute left-4 top-2 text-white/60 text-[10px] uppercase font-bold tracking-wider transition-all
    peer-focus:text-brand-blue
  `

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const finalService = form.service === "other" ? otherService : form.service
    const res = await fetch("/api/appointment", {
      method: "POST",
      body: JSON.stringify({ ...form, service: finalService }),
    })

    if (res.ok) {
      alert("appointment sent ♡")

      window.dispatchEvent(new Event("appointmentSuccess")) // ✨ close modal
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        date: "",
        service: "",
        message: ""
      })
      setOtherService("")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">

      {/* FIRST NAME */}
      <div className="relative">
        <input type="text" name="firstName" placeholder="John" value={form.firstName} onChange={handleChange} required className={inputClass} />
        <label className={labelClass}>First Name</label>
      </div>

      {/* LAST NAME */}
      <div className="relative">
        <input type="text" name="lastName" placeholder="Doe" value={form.lastName} onChange={handleChange} required className={inputClass} />
        <label className={labelClass}>Last Name</label>
      </div>

      {/* EMAIL */}
      <div className="relative">
        <input type="email" name="email" placeholder="john@example.com" value={form.email} onChange={handleChange} required className={inputClass} />
        <label className={labelClass}>Email</label>
      </div>

      {/* PHONE */}
      <div className="relative">
        <input type="tel" name="phone" placeholder="09XX-XXX-XXXX" value={form.phone} onChange={handleChange} required className={inputClass} />
        <label className={labelClass}>Phone</label>
      </div>

      {/* DATE */}
      <div>
        <DatePicker
          selected={form.date ? new Date(form.date) : null}
          onChange={handleDateChange}
          showTimeSelect
          dateFormat="MMMM d, yyyy h:mm aa"
          placeholderText="Select date & time"
          customInput={<CustomDateInput />}
        />
      </div>

      {/* SERVICE */}
      <div className="relative">
        <select
          name="service"
          value={form.service}
          onChange={handleChange}
          required
          className={`${inputClass} appearance-none pr-10`}
        >
          <option value="" disabled hidden className="text-gray-900">Select a service</option>
          {services.map((s) => (
            <option key={s.id} value={s.id} className="text-gray-900">{s.name}</option>
          ))}
          <option value="other" className="text-gray-900">Other</option>
        </select>
        <label className={labelClass}>Service Needed</label>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60 pointer-events-none" />
      </div>

      {/* OTHER SERVICE INPUT */}
      <div className="relative md:col-span-2">
        <input
          type="text"
          placeholder="Specify service"
          value={otherService}
          onChange={(e) => setOtherService(e.target.value)}
          required={form.service === "other"}
          disabled={form.service !== "other"}
          className={`
            peer w-full
            ${form.service !== "other" ? "bg-white/5 text-white/30 cursor-not-allowed border-white/10" : "bg-white/15 text-white border-white/30"}
            border rounded-sm
            px-4 pt-6 pb-2
            focus:outline-none focus:ring-1 focus:ring-brand-blue
            transition duration-300
          `}
        />
        <label className={`
          absolute left-4 top-2 text-[10px] uppercase font-bold tracking-wider transition-all
          ${form.service !== "other" ? "text-white/30" : "text-white/60 peer-focus:text-brand-blue"}
        `}>
          Specify Service
        </label>
      </div>

      {/* MESSAGE */}
      <div className="relative md:col-span-2">
        <textarea
          name="message"
          placeholder="Your message"
          value={form.message}
          onChange={handleChange}
          className={`${inputClass} resize-none h-24`}
        />
        <label className={labelClass}>Additional Message</label>
      </div>

      {/* BUTTON */}
      <div className="md:col-span-2">
        <button
          type="submit"
          className="w-full bg-brand-red text-white py-4 rounded-sm font-bold hover:bg-red-700 transition shadow-lg hover:shadow-red-900/20"
        >
          Book Appointment
        </button>
      </div>

    </form>
  )
}