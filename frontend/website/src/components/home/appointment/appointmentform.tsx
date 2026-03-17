"use client"

import React, { useState, forwardRef } from "react"
import { services } from "@/data/services"
import { Appointment } from "@/types/appointment"
import DatePicker from "react-datepicker"
import { Calendar, ChevronDown } from "lucide-react"
import "react-datepicker/dist/react-datepicker.css"

// --- custom date input ---
const CustomDateInput = forwardRef(({ value, onClick, placeholder }: any, ref) => (
  <div className="relative">
    <input
      type="text"
      onClick={onClick}
      value={value}
      placeholder={placeholder}
      readOnly
      ref={ref}
      className="
        peer w-full bg-white/30 backdrop-blur-sm border border-white/40 rounded-xl
        px-4 pt-6 pb-2 placeholder-gray-400 text-gray-900
        shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
        transition duration-300 pr-10
      "
    />
    <label className="
      absolute left-4 top-2 text-gray-700 text-sm transition-all
      peer-focus:top-1 peer-focus:text-blue-500 peer-focus:text-sm
    ">
      Date & Time
    </label>
    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-700 pointer-events-none" />
  </div>
))
CustomDateInput.displayName = "CustomDateInput"

// --- main form ---
export default function AppointmentForm() {
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleDateChange = (date: Date | null) => {
    if (date) setForm({ ...form, date: date.toISOString() })
  }

  const inputClass = `
    peer w-full bg-white/30 backdrop-blur-sm border border-white/40 rounded-xl
    px-4 pt-6 pb-2 placeholder-gray-400 text-gray-900
    shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
    transition duration-300
  `

  const labelClass = `
    absolute left-4 top-2 text-gray-700 text-sm transition-all
    peer-focus:top-1 peer-focus:text-blue-500 peer-focus:text-sm
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
          <option value="" disabled hidden>Select a service</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
          <option value="other">Other</option>
        </select>
        <label className={labelClass}>Service Needed</label>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-700 pointer-events-none" />
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
            ${form.service !== "other" ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-white/30 text-gray-900"}
            backdrop-blur-sm border border-white/40 rounded-xl
            px-4 pt-6 pb-2
            shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
            transition duration-300
          `}
        />
        <label className={`
          absolute left-4 top-2 text-sm transition-all
          ${form.service !== "other" ? "text-gray-400" : "text-gray-700 peer-focus:text-blue-500"}
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
          className="w-full bg-black text-white py-3 rounded-xl hover:opacity-90 transition"
        >
          Book Appointment
        </button>
      </div>

    </form>
  )
}