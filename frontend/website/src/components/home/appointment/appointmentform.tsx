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
        focus:outline-none focus:ring-1 focus:ring-brand-red
        transition duration-300 pr-10
      "
    />
    <label className="
      absolute left-4 top-2 text-white/60 text-[10px] uppercase font-semibold tracking-wider transition-all
      peer-focus:text-brand-red
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
  const [sending, setSending] = useState(false)

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

    const handlePrefill = (e: any) => {
      const { service, message } = e.detail;
      setForm(prev => ({
        ...prev,
        service: service || prev.service,
        message: message || prev.message
      }));
      if (service !== "other") setOtherService("");
    };

    window.addEventListener("claimOffer", handleClaim);
    window.addEventListener("prefillAppointment", handlePrefill);
    return () => {
      window.removeEventListener("claimOffer", handleClaim);
      window.removeEventListener("prefillAppointment", handlePrefill);
    };
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm({ ...form, [e.target.name]: e.target.value })

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 11) val = val.substring(0, 11);
    let formatted = val;
    if (val.length > 7) {
      formatted = `${val.substring(0, 4)}-${val.substring(4, 7)}-${val.substring(7)}`;
    } else if (val.length > 4) {
      formatted = `${val.substring(0, 4)}-${val.substring(4)}`;
    }
    setForm({ ...form, phone: formatted });
  }

  const handleDateChange = (date: Date | null) => {
    if (date) setForm({ ...form, date: date.toISOString() })
  }

  const inputClass = `
    peer w-full bg-white/10 border border-white/20 rounded-sm
    px-4 pt-6 pb-2 placeholder-white/40 text-white
    focus:outline-none focus:ring-1 focus:ring-brand-red
    transition duration-300
  `

  const labelClass = `
    absolute left-4 top-2 text-white/60 text-[10px] uppercase font-semibold tracking-wider transition-all
    peer-focus:text-brand-red
  `

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    const finalService = form.service === "other" ? otherService : form.service
    
    try {
      const res = await fetch("/api/appointment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...form, service: finalService }),
      })

      if (!res.ok) {
        throw new Error("Failed to send appointment request")
      }

      alert("Appointment request sent successfully! We'll contact you soon.")

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
    } catch (error) {
      console.error(error)
      alert("Failed to send request. Please try again or call us directly.")
    } finally {
      setSending(false)
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
        <input type="tel" name="phone" placeholder="09XX-XXX-XXXX" value={form.phone} onChange={handlePhoneChange} required className={inputClass} />
        <label className={labelClass}>Phone</label>
      </div>

      {/* DATE */}
      <div className="w-full relative">
        <DatePicker
          selected={form.date ? new Date(form.date) : null}
          onChange={handleDateChange}
          showTimeSelect
          dateFormat="MMMM d, yyyy h:mm aa"
          placeholderText="Select date & time"
          customInput={<CustomDateInput />}
          wrapperClassName="w-full"
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
            focus:outline-none focus:ring-1 focus:ring-brand-red
            transition duration-300
          `}
        />
        <label className={`
          absolute left-4 top-2 text-[10px] uppercase font-semibold tracking-wider transition-all
          ${form.service !== "other" ? "text-white/30" : "text-white/60 peer-focus:text-brand-red"}
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
          disabled={sending}
          className={`w-full text-white py-4 rounded-sm font-semibold transition flex justify-center items-center gap-2 shadow-lg ${
            sending 
              ? "bg-brand-red/50 cursor-wait" 
              : "bg-brand-red hover:bg-red-700 hover:shadow-red-900/20"
          }`}
        >
          {sending ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Sending...
            </>
          ) : (
            "Book Appointment"
          )}
        </button>
      </div>

    </form>
  )
}