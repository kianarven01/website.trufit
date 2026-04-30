"use client";

import React, { useState } from "react";
import { services } from "@/data/services";
import { ChevronDown, Send, CheckCircle } from "lucide-react";

export default function ContactForm() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    service: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm({ ...form, [e.target.name]: e.target.value });

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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        throw new Error("Failed to send message: " + res.statusText);
      }

      setSending(false);
      setSubmitted(true);
    } catch (error) {
      console.error(error);
      alert("Failed to send message. Please try again or email us directly at trufitautocenter@gmail.com.");
      setSending(false);
      return;
    }
    
    // Reset after 4 seconds
    setTimeout(() => {
      setSubmitted(false);
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        service: "",
        message: "",
      });
    }, 4000);
  };

  if (submitted) {
    return (
      <div className="contact-toast flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
          <CheckCircle className="text-green-400" size={32} />
        </div>
        <h3 className="text-white text-xl font-bold mb-2">Message Sent!</h3>
        <p className="text-white/50 text-sm max-w-xs">
          Thank you for reaching out. We&apos;ll get back to you within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2" id="contact-form">
      {/* FIRST NAME */}
      <div className="relative">
        <input
          type="text"
          name="firstName"
          placeholder=""
          value={form.firstName}
          onChange={handleChange}
          required
          className="contact-input-light"
        />
        <span className="contact-float-label">First Name</span>
      </div>

      {/* LAST NAME */}
      <div className="relative">
        <input
          type="text"
          name="lastName"
          placeholder=""
          value={form.lastName}
          onChange={handleChange}
          required
          className="contact-input-light"
        />
        <span className="contact-float-label">Last Name</span>
      </div>

      {/* EMAIL */}
      <div className="relative">
        <input
          type="email"
          name="email"
          placeholder=""
          value={form.email}
          onChange={handleChange}
          required
          className="contact-input-light"
        />
        <span className="contact-float-label">Email</span>
      </div>

      {/* PHONE */}
      <div className="relative">
        <input
          type="tel"
          name="phone"
          placeholder=""
          value={form.phone}
          onChange={handlePhoneChange}
          required
          className="contact-input-light"
        />
        <span className="contact-float-label">Phone Number</span>
      </div>

      {/* SERVICE */}
      <div className="relative md:col-span-2">
        <select
          name="service"
          value={form.service}
          onChange={handleChange}
          required
          className="contact-input-light appearance-none pr-10"
        >
          <option value="" disabled hidden className="text-gray-900">
            Select a service
          </option>
          {services.map((s) => (
            <option key={s.id} value={s.id} className="text-gray-900">
              {s.name}
            </option>
          ))}
          <option value="general" className="text-gray-900">General Inquiry</option>
          <option value="feedback" className="text-gray-900">Feedback</option>
          <option value="other" className="text-gray-900">Other</option>
        </select>
        <span className="contact-float-label">Subject</span>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 pointer-events-none" />
      </div>

      {/* MESSAGE */}
      <div className="relative md:col-span-2">
        <textarea
          name="message"
          placeholder="How can we help you?"
          value={form.message}
          onChange={handleChange}
          required
          className="contact-input-light resize-none h-28"
        />
        <span className="contact-float-label">Message</span>
      </div>

      {/* SUBMIT */}
      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={sending}
          className={`w-full py-4 rounded-sm font-bold text-sm uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 font-barlow ${
            sending
              ? "bg-brand-red/50 text-white/50 cursor-wait"
              : "bg-brand-red text-white hover:bg-red-700 shadow-lg hover:shadow-brand-red/30"
          }`}
        >
          {sending ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send size={16} />
              Send Message
            </>
          )}
        </button>
      </div>

      {/* PRIVACY NOTE */}
      <div className="md:col-span-2">
        <p className="text-white/30 text-[11px] text-center leading-relaxed font-barlow">
          By submitting this form, you agree to our{" "}
          <span className="text-brand-red/60 hover:text-brand-red cursor-pointer transition-colors">
            Terms of Service
          </span>{" "}
          and{" "}
          <span className="text-brand-red/60 hover:text-brand-red cursor-pointer transition-colors">
            Privacy Policy
          </span>
          .
        </p>
      </div>
    </form>
  );
}
