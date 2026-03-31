"use client";

import { useRef } from "react";
import { MapPin, ExternalLink, Navigation } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export default function LocationSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reveals = gsap.utils.toArray<HTMLElement>(".location-reveal");
      reveals.forEach((item, i) => {
        gsap.fromTo(
          item,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            delay: i * 0.12,
            ease: "power3.out",
            scrollTrigger: {
              trigger: item,
              start: "top 90%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });

      // Map slide in from left
      gsap.fromTo(
        ".map-animate",
        { opacity: 0, x: -50 },
        {
          opacity: 1,
          x: 0,
          duration: 1.1,
          ease: "power4.out",
          scrollTrigger: {
            trigger: ".map-animate",
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="location-section py-16 md:py-24 lg:py-32"
      id="location"
    >
      <div className="max-w-[1820px] mx-auto px-6 sm:px-10 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* LEFT: Map */}
          <div className="map-animate">
            <div className="map-container">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3551.81314385491!2d122.94052557463601!3d14.12379058857341!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3398affd09d7236b%3A0xcfccafc73d343d48!2sTrufit%20Auto%20Center!5e1!3m2!1sen!2sph!4v1774915041783!5m2!1sen!2sph"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Trufit Auto Center Location"
              />

              {/* Badge overlay */}
              <div className="map-pin-badge">
                <div className="w-8 h-8 rounded-full bg-brand-red/10 flex items-center justify-center">
                  <MapPin className="text-brand-red" size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">Trufit Auto Center</p>
                  <p className="text-[10px] text-gray-500">Daet, Camarines Norte</p>
                </div>
              </div>
            </div>

            {/* Open in Google Maps link */}
            <a
              href="https://www.google.com/maps/place/Trufit+Auto+Center/@14.1237854,122.9431005,17z/data=!3m1!4b1!4m6!3m5!1s0x3398affd09d7236b:0xcfccafc73d343d48!8m2!3d14.1237854!4d122.9431005!16s%2Fg%2F11fl9dschh?entry=ttu"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 text-sm text-gray-500 hover:text-brand-blue transition-colors group"
            >
              <Navigation size={14} className="group-hover:text-brand-blue transition-colors" />
              Open Google Maps
              <ExternalLink size={12} />
            </a>
          </div>

          {/* RIGHT: Location Details */}
          <div className="space-y-6">
            {/* Label */}
            <div className="location-reveal flex items-center gap-3">
              <div className="h-[2px] w-10 bg-brand-blue" />
              <span className="text-brand-blue text-xs font-bold tracking-[0.3em] uppercase">
                Our Location
              </span>
            </div>

            {/* Title */}
            <h2 className="location-reveal text-3xl md:text-5xl font-black text-gray-900 font-brawler leading-tight tracking-tight">
              Visit Our{" "}
              <span className="text-brand-blue">Shop</span>
            </h2>

            {/* Description */}
            <p className="location-reveal text-gray-500 text-base md:text-lg leading-relaxed max-w-lg">
              We&apos;re located in Daet, Camarines Norte — serving the Bicol region with 
              trusted automotive care. Drop by anytime during business hours or schedule 
              an appointment for priority service.
            </p>

            {/* Address Details */}
            <div className="location-reveal space-y-5 pt-4">
              <div>
                <h3 className="text-gray-900 font-bold text-sm uppercase tracking-wider mb-2">
                  Headquarters
                </h3>
                <div className="space-y-1 text-gray-500 text-sm leading-relaxed">
                  <p className="font-semibold text-gray-700">Trufit Auto Center</p>
                  <p>P1, Brgy. Gahonon</p>
                  <p>Daet, Camarines Norte</p>
                  <p>Philippines</p>
                </div>
              </div>

              <div className="h-px w-full bg-gray-200" />

              <div>
                <h3 className="text-gray-900 font-bold text-sm uppercase tracking-wider mb-2">
                  Business Hours
                </h3>
                <div className="space-y-1 text-gray-500 text-sm">
                  <div className="flex justify-between max-w-xs">
                    <span>Monday – Saturday</span>
                    <span className="font-semibold text-gray-700">8:00 AM – 5:00 PM</span>
                  </div>
                  <div className="flex justify-between max-w-xs">
                    <span>Sunday</span>
                    <span className="font-semibold text-brand-red">Closed</span>
                  </div>
                </div>
              </div>

              <div className="h-px w-full bg-gray-200" />

              <div>
                <h3 className="text-gray-900 font-bold text-sm uppercase tracking-wider mb-2">
                  Contact
                </h3>
                <div className="space-y-1 text-sm">
                  <a
                    href="tel:09187747788"
                    className="block text-gray-500 hover:text-brand-blue transition-colors"
                  >
                    0918-774-7788
                  </a>
                  <a
                    href="mailto:trufitautocenter@gmail.com"
                    className="block text-gray-500 hover:text-brand-blue transition-colors"
                  >
                    trufitautocenter@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
