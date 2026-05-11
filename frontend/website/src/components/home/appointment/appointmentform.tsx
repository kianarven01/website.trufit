"use client"

import React, { useEffect, useState, forwardRef } from "react"
import { services } from "@/data/services"
import { Appointment } from "@/types/appointment"
import DatePicker from "react-datepicker"
import { Calendar, ChevronDown, X } from "lucide-react"
import "react-datepicker/dist/react-datepicker.css"
import { toast } from "sonner"

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
    date: null,
    service: "",
    vehicleMake: "",
    vehicleModel: "",
    vehicleYear: "",
    message: "",
    website_url: ""
  })

  const [otherService, setOtherService] = useState("")
  const [otherVehicleMake, setOtherVehicleMake] = useState("")
  const [sending, setSending] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [serviceOpen, setServiceOpen] = useState(false)
  const [selectedServices, setSelectedServices] = useState<string[]>([])

  // Generate years from current year down to 1990
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1990 + 1 }, (_, i) => currentYear - i);

  const toggleService = (id: string) => {
    setSelectedServices(prev => {
      const updated = prev.includes(id)
        ? prev.filter(s => s !== id)
        : [...prev, id]

      // close dropdown when "other" is selected
      if (id === "other" && !prev.includes("other")) {
        setServiceOpen(false)
      }

      return updated
    })
  }

  const removeService = (id: string) => {
    setSelectedServices(prev => prev.filter(s => s !== id))
  }
  // Common vehicle makes in the Philippines
  const commonMakes = [
    "Toyota", "Mitsubishi", "Nissan", "Honda", "Ford", 
    "Suzuki", "Isuzu", "Hyundai", "Kia", "Mazda", 
    "Chevrolet", "Subaru", "Geely", "MG", "Changan"
  ];

  // auto clear other
  useEffect(() => {
    if (!selectedServices.includes("other")) {
      setOtherService("")
    }
  }, [selectedServices])

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

  const capitalize = (str: string) =>
    str.replace(/\b\w/g, (c) => c.toUpperCase())

  const sentenceCase = (str: string) =>
  str
    .toLowerCase()
    .replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase())

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
    if (!date) {
      setForm({ ...form, date: null })
      return
    }

    const prev = form.date
    const selected = new Date(date)

    const isSameDay =
      prev &&
      new Date(prev).toDateString() === selected.toDateString()

    // 👉 ONLY set default time if user changed the DAY
    if (!isSameDay) {
      const now = new Date()
      const isToday =
        selected.toDateString() === now.toDateString()

      if (isToday) {
        const nextInterval = Math.ceil(now.getMinutes() / 5) * 5
        selected.setHours(now.getHours(), nextInterval, 0, 0)
      } else {
        selected.setHours(8, 0, 0, 0)
      }
    }

    // 👉 if same day → user is changing time → KEEP it
    setForm(prevState => ({
      ...prevState,
      date: selected
    }))
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
  const [dateError, setDateError] = useState(false)
  const [serviceError, setServiceError] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    let valid = true

    if (!form.date) {
      setDateError(true)
      valid = false
    }

    if (selectedServices.length === 0) {
      setServiceError(true)
      valid = false
    }

    if (!valid) return

    setDateError(false)
    setServiceError(false)
    setShowTermsModal(true)
  }

  const handleConfirmSubmit = async () => {
    setShowTermsModal(false)
    setSending(true)
    let finalService = ""

    if (selectedServices.includes("other")) {
      finalService = otherService || "Other"
    } else if (selectedServices.length > 0) {
      finalService = selectedServices
        .map(id => services.find(s => s.id === id)?.name || id)
        .join(", ")
    } else {
      finalService =
        form.service === "other"
          ? otherService
          : services.find(s => s.id === form.service)?.name || form.service
    }
    const finalVehicleMake = form.vehicleMake === "other" ? otherVehicleMake : form.vehicleMake
    
    try {
      const res = await fetch("/api/appointment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...form, service: finalService, vehicleMake: finalVehicleMake }),
      })

      if (!res.ok) {
        throw new Error("Failed to send appointment request")
      }

      toast.success("Appointment request sent successfully! We'll contact you soon.")

      window.dispatchEvent(new Event("appointmentSuccess")) // ✨ close modal
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        date: null,
        service: "",
        vehicleMake: "",
        vehicleModel: "",
        vehicleYear: "",
        message: "",
        website_url: ""
      })
      setOtherService("")
      setOtherVehicleMake("")
      setSelectedServices([])
    } catch (error) {
      console.error(error)
      toast.error("Failed to send request. Please try again or call us directly.")
    } finally {
      setSending(false)
    }
  }

  // 1. Helper to filter allowed times
  const filterPassedTime = (time: Date) => {
    const currentDate = new Date();
    const selectedDate = new Date(time);

    // If they picked today, hide times in the past
    if (currentDate.toDateString() === selectedDate.toDateString()) {
      return currentDate.getTime() < selectedDate.getTime();
    }
    return true;
  };

  // 2. Define the Business Hours (8:00 AM to 4:30 PM)
  const minTime = new Date(new Date().setHours(8, 0, 0));
  const maxTime = new Date(new Date().setHours(16, 30, 0));

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!serviceOpen) return

      const target = e.target as HTMLElement

      // close only if click is NOT inside dropdown or trigger
      const isInsideDropdown =
        target.closest(".service-dropdown")

      if (!isInsideDropdown) {
        setServiceOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [serviceOpen])

  useEffect(() => {
    if (selectedServices.length > 0) {
      setServiceError(false)
    }
  }, [selectedServices])

  useEffect(() => {
    if (form.date) {
      setDateError(false)
    }
  }, [form.date])

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">

      {/* HONEYPOT - Hidden from real users to catch bots */}
      <div style={{ position: "absolute", width: "0", height: "0", overflow: "hidden", opacity: 0 }}>
        <input
          type="text"
          name="website_url"
          tabIndex={-1}
          autoComplete="off"
          value={(form as any).website_url || ""}
          onChange={handleChange}
        />
      </div>

      {/* FIRST NAME */}
      <div className="relative">
        <input type="text" name="firstName" placeholder="" value={form.firstName} onChange={handleChange} required 
        onBlur={(e) =>
          setForm({ ...form, firstName: capitalize(e.target.value) })
        }
        className={inputClass} />
        <label className={labelClass}>First Name</label>
      </div>

      {/* LAST NAME */}
      <div className="relative">
        <input type="text" name="lastName" placeholder="" value={form.lastName} onChange={handleChange} required 
        onBlur={(e) =>
          setForm({ ...form, lastName: capitalize(e.target.value) })
        }
        className={inputClass} />
        <label className={labelClass}>Last Name</label>
      </div>

      {/* EMAIL */}
      <div className="relative">
        <input type="email" name="email" placeholder="" value={form.email} onChange={handleChange} required className={inputClass} />
        <label className={labelClass}>Email</label>
      </div>

      {/* PHONE */}
      <div className="relative">
        <input type="tel" name="phone" placeholder="" value={form.phone} onChange={handlePhoneChange} required className={inputClass} />
        <label className={labelClass}>Phone</label>
      </div>

      {/* SERVICE (MULTI SELECT) */}
      <div className="relative service-dropdown md:col-span-2">
        <div
          className={`${inputClass} cursor-pointer`}
          onClick={() => setServiceOpen(prev => !prev)}
        >
          <div className="flex flex-wrap gap-2 h-7 overflow-y-auto pr-2">
            {selectedServices.length === 0 ? (
              <span className="text-white/40">Select service(s)</span>
            ) : selectedServices.includes("other") ? (
              selectedServices
                .filter(id => id === "other")
                .map(id => (
                  <span
                    key={id}
                    className="flex items-center gap-2 bg-white/10 px-2 py-1 text-xs rounded-sm"
                  >
                    Other

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeService(id)
                      }}
                      className="text-white/60 hover:text-white"
                    >
                      ✕
                    </button>
                  </span>
                ))
            ) : (
              selectedServices.map(id => {
                const s = services.find(x => x.id === id)

                return (
                  <span
                    key={id}
                    className="flex items-center gap-2 bg-white/10 px-2 py-1 text-xs rounded-sm"
                  >
                    {s?.name}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeService(id)
                      }}
                      className="text-white/60 hover:text-white"
                    >
                      ✕
                    </button>
                  </span>
                )
              })
            )}
          </div>
        </div>

        <label className={labelClass}>Service Needed</label>

        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60" />

        {serviceOpen && (
          <div className="absolute z-50 mt-2 w-full bg-white border border-white/10 rounded-sm shadow-lg h-60 overflow-y-auto">
            {[...services, { id: "other", name: "Other" }].map(s => (
              <label
                key={s.id}
                className={`
                  flex gap-2 px-4 py-2 text-sm cursor-pointer transition-colors
                  ${
                    selectedServices.includes("other") && s.id !== "other"
                      ? "cursor-not-allowed pointer-events-none opacity-50"
                      : "cursor-pointer hover:bg-brand-red hover:text-white"
                  }
                `}
              >
                <input
                  type="checkbox"
                  checked={selectedServices.includes(s.id)}
                  onChange={() => toggleService(s.id)}
                  disabled={
                    selectedServices.includes("other") && s.id !== "other"
                  }
                  className={`
                    w-4 h-4 transition-colors
                    accent-brand-red

                    ${
                      selectedServices.includes("other") && s.id !== "other"
                        ? "accent-gray-500 cursor-not-allowed"
                        : "cursor-pointer"
                    }
                  `}
                />
                {s.name}
              </label>
            ))}
          </div>
        )}

        {serviceError && (
        <p className="text-red-500 text-xs mt-1">
          Please select at least one service
        </p>
      )}
      </div>

      {/* DATE */}
      <div className={`w-full relative`}>
        <DatePicker
          selected={form.date}
          onChange={handleDateChange}
          filterDate={(date) => {
            // disable Sundays
            if (date.getDay() === 0) return false

            const now = new Date()

            // if selected date is today
            const isToday =
              date.toDateString() === now.toDateString()

            if (isToday) {
              // business closing time today (4:30 PM)
              const closingTime = new Date()
              closingTime.setHours(16, 30, 0, 0)

              // if current time is already past 4:30 PM
              if (now >= closingTime) {
                return false
              }
            }

            return true
          }}
          focusSelectedMonth={false}
          selectsStart
          showTimeSelect
          timeIntervals={5}
          minDate={new Date()}
          minTime={minTime}
          maxTime={maxTime}
          filterTime={filterPassedTime}
          dateFormat="MMMM d, yyyy h:mm aa"
          placeholderText="Select date & time"
          customInput={<CustomDateInput />}
          wrapperClassName="w-full"
          calendarClassName="modern-calendar"
        />
        {dateError && (
          <p className="text-red-500 text-xs mt-1">
            Please select a date & time
          </p>
        )}
      </div>

      {/* OTHER SERVICE INPUT */}
      <div className="relative">
        <input
          type="text"
          placeholder="Specify service"
          value={otherService}
          onChange={(e) => setOtherService(e.target.value)}
          required={selectedServices.includes("other")}
          disabled={!selectedServices.includes("other")}
          onBlur={(e) => setOtherService(capitalize(e.target.value))}
          className={`
            peer w-full
            ${!selectedServices.includes("other")
              ? "bg-white/5 text-white/30 cursor-not-allowed border-white/10"
              : "bg-white/15 text-white border-white/30"}
            border rounded-sm
            px-4 pt-6 pb-2
            focus:outline-none focus:ring-1 focus:ring-brand-red
            transition duration-300
          `}
        />

        <label className={`
          absolute left-4 top-2 text-[10px] uppercase font-semibold tracking-wider transition-all
          ${!selectedServices.includes("other")
            ? "text-white/30"
            : "text-white/60 peer-focus:text-brand-red"}
        `}>
          Specify Service
        </label>
      </div>

      {/* VEHICLE MAKE */}
      <div className="relative">
        <select
          name="vehicleMake"
          value={form.vehicleMake || ""}
          onChange={handleChange}
          className={`${inputClass} appearance-none pr-10`}
        >
          <option value="" disabled hidden className="text-gray-900">Select Make</option>
          {commonMakes.map((make) => (
            <option key={make} value={make} className="text-gray-900">{make}</option>
          ))}
          <option value="other" className="text-gray-900">Other</option>
        </select>
        <label className={labelClass}>Vehicle Make</label>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60 pointer-events-none" />
      </div>

      {/* OTHER VEHICLE MAKE INPUT */}
      <div className="relative">
        <input
          type="text"
          placeholder="Specify make"
          value={otherVehicleMake}
          onChange={(e) => setOtherVehicleMake(e.target.value)}
          required={form.vehicleMake === "other"}
          disabled={form.vehicleMake !== "other"}
          onBlur={(e) => setOtherVehicleMake(capitalize(e.target.value))}
          className={`
            peer w-full
            ${form.vehicleMake !== "other" ? "bg-white/5 text-white/30 cursor-not-allowed border-white/10" : "bg-white/15 text-white border-white/30"}
            border rounded-sm
            px-4 pt-6 pb-2
            focus:outline-none focus:ring-1 focus:ring-brand-red
            transition duration-300
          `}
        />
        <label className={`
          absolute left-4 top-2 text-[10px] uppercase font-semibold tracking-wider transition-all
          ${form.vehicleMake !== "other" ? "text-white/30" : "text-white/60 peer-focus:text-brand-red"}
        `}>
          Specify Make
        </label>
      </div>

      {/* VEHICLE YEAR */}
      <div className="relative">
        <select
          name="vehicleYear"
          value={form.vehicleYear || ""}
          onChange={handleChange}
          className={`${inputClass} appearance-none pr-10`}
        >
          <option value="" disabled hidden className="text-gray-900">Select Year</option>
          {years.map((year) => (
            <option key={year} value={year} className="text-gray-900">{year}</option>
          ))}
        </select>
        <label className={labelClass}>Vehicle Year</label>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60 pointer-events-none" />
      </div>

      {/* VEHICLE MODEL */}
      <div className="relative">
        <input type="text" name="vehicleModel" placeholder="" value={form.vehicleModel || ""} onChange={handleChange} 
        onBlur={(e) =>
          setForm({ ...form, vehicleModel: capitalize(e.target.value) })
        }
        className={inputClass} />
        <label className={labelClass}>Vehicle Model</label>
      </div>

      {/* MESSAGE */}
      <div className="relative md:col-span-2">
        <textarea
          name="message"
          placeholder="Your message"
          value={form.message}
          onChange={handleChange}
          onBlur={(e) =>
            setForm({ ...form, message: sentenceCase(e.target.value) })
          }
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

    {/* TERMS MODAL */}
      {showTermsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0f1115] border border-white/10 rounded-sm p-6 md:p-8 max-w-md w-full relative shadow-2xl">
            <button
              type="button"
              onClick={() => setShowTermsModal(false)}
              className="absolute top-4 right-4 text-white/30 hover:text-brand-red transition-colors"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-white mb-3 uppercase tracking-wider font-barlow">Accept Terms</h3>
            <p className="text-white/60 text-sm mb-8 leading-relaxed font-barlow">
              By proceeding, you agree to our <a href="/terms" className="text-brand-red hover:underline" target="_blank">Terms of Service</a> and <a href="/privacy" className="text-brand-red hover:underline" target="_blank">Privacy Policy</a>. We will process your information in accordance with these terms to book your appointment.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="flex-1 py-3 border border-white/20 text-white rounded-sm font-semibold hover:bg-white/5 transition-colors font-barlow uppercase tracking-wider text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmit}
                className="flex-1 py-3 bg-brand-red text-white rounded-sm font-semibold hover:bg-red-700 transition-colors font-barlow uppercase tracking-wider text-sm shadow-lg hover:shadow-brand-red/30"
              >
                I Accept
              </button>
            </div>
          </div>
        </div>
      )}

    </form>
  )
}