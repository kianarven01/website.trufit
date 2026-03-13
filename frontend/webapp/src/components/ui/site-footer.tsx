import React, { useState } from "react";
import { FaFacebookF, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaCalendarAlt } from "react-icons/fa";

const Footer: React.FC = () => {
  return (
    <div className="overflow-x-hidden">
      <footer className="bg-slate-900 text-gray-400 select-none mt-10">
        <div className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Contact Us</h3>
            <p className="flex items-center gap-2">
              <FaMapMarkerAlt /> 1042 Vinzons Ave, P1 Brgy. Gahonon Daet, Camarines Norte
            </p>
            <p className="flex items-center gap-2"><FaPhoneAlt /> 0918-774-7788</p>
            <p className="flex items-center gap-2"><FaEnvelope /> trufitautocenterdaet@gmail.com</p>
            <div className="flex gap-3 mt-2">
              <a
                href="https://www.facebook.com/ac.trufit"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-blue-600 rounded-full hover:bg-blue-500 transition"
              >
                <FaFacebookF className="text-white" />
              </a>
            </div>
          </div>

          {/* Opening Hours */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Opening Hours</h3>
            <p>Monday - Saturday: 8am - 5pm</p>
            <p>Sunday: Closed</p>
          </div>

          {/* Services Links */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Our Services</h3>
            <ul className="space-y-1">
              <li><a href="/services#diagnostic" className="hover:text-white transition">Diagnostic Test</a></li>
              <li><a href="/services#tires" className="hover:text-white transition">Tires Replacement</a></li>
              <li><a href="/services#oil" className="hover:text-white transition">Oil Changing</a></li>
              <li><a href="/services#ac" className="hover:text-white transition">AC Repairing</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-6 py-4 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} Trufit Auto Center. All rights reserved.
        </div>
      </footer>

      {/* Floating Book Appointment Button */}
      <FloatingAppointment />
    </div>
  );
};

// Floating Appointment Modal Component
const FloatingAppointment: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Circle Button */}
      <div className="fixed bottom-20 right-4 sm:right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="w-20 h-20 bg-red-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-red-500 transition transform hover:scale-110"
        >
          <FaCalendarAlt className="text-3xl" />
        </button>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-2">
          <div className="bg-slate-900 rounded-xl p-8 w-full max-w-lg relative">
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
            >
              ✕
            </button>

            {/* Appointment Form */}
            <div className="flex flex-col text-white">
              <h3 className="text-sm uppercase tracking-wide text-red-500 mb-2">Need a hand?</h3>
              <h2 className="text-3xl font-semibold mb-8">Book an appointment now!</h2>

              <div className="space-y-6">
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full bg-white/10 border border-white/30 rounded px-4 py-3 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-red-500"
                />

                <div className="flex gap-4 flex-wrap">
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    className="flex-1 min-w-0 bg-white/10 border border-white/30 rounded px-4 py-3 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="flex-1 min-w-0 bg-white/10 border border-white/30 rounded px-4 py-3 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
                  <input
                    type="date"
                    className="flex-1 min-w-0 bg-white/10 border border-white/30 rounded px-4 py-3 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <input
                    type="time"
                    className="flex-1 min-w-0 bg-white/10 border border-white/30 rounded px-4 py-3 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <button className="w-full bg-red-600 hover:bg-red-700 transition rounded py-3 font-semibold uppercase tracking-wide">
                  Book Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Footer;