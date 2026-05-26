"use client";

import { ChevronDown } from "lucide-react";

export default function CareerPage() {
  const coreValues = [
    {
      title: "Excellence",
      desc: "We strive for perfection in every repair and service.",
    },
    {
      title: "Integrity",
      desc: "Honest diagnostics and transparent pricing, always.",
    },
    {
      title: "Growth",
      desc: "Continuous learning with the latest automotive technology.",
    },
  ];

  const positions = [
    { id: 1, title: "Master Mechanic", type: "Full-Time", location: "On-site" },
    { id: 2, title: "Service Advisor", type: "Full-Time", location: "On-site" },
    { id: 3, title: "Auto Detailer", type: "Part-Time", location: "On-site" },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] text-brand-dark">
      {/* Hero Section */}
      <section className="relative h-[90vh] md:h-screen flex items-center justify-center overflow-hidden">
        {/* Static Background */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/hero/laboratory.webp"
            alt="Trufit Automotive Workshop"
            className="w-full h-full object-cover"
          />
        </div>
        {/* Overlay - adjusted to be slightly lighter for the light theme transition, but still dark enough for the white text to pop */}
        <div className="absolute inset-0 bg-black/60 z-10" />

        {/* Centered Content */}
        <div className="relative z-20 text-center px-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-[1px] w-12 bg-brand-red" />
            <span className="text-white/80 text-xs font-bold tracking-[0.4em] uppercase">
              Join Our Team
            </span>
            <div className="h-[1px] w-12 bg-brand-red" />
          </div>

          <h1
            className="font-bold text-white leading-[1.1] tracking-tight mb-6"
            style={{ fontSize: "clamp(3.5rem, 6vw, 6rem)" }}
          >
            Drive Your Career <br />
            <span className="text-gradient-red">Forward</span>
          </h1>

          <p
            className="text-white/80 max-w-2xl mx-auto leading-relaxed font-medium mb-12"
            style={{ fontSize: "clamp(1.1rem, 1.5vw, 1.35rem)" }}
          >
            Become part of a DTI 5-Star Accredited workshop. We are looking for
            passionate individuals who share our dedication to automotive
            excellence.
          </p>

          <a
            href="#open-positions"
            className="inline-block bg-brand-red text-white px-10 py-5 font-bold tracking-widest uppercase text-sm hover:bg-red-700 transition-colors shadow-premium"
          >
            View Open Positions
          </a>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
          <span className="text-white/50 text-[10px] font-bold tracking-[0.3em] uppercase">
            Scroll
          </span>
          <ChevronDown className="text-white/50 animate-bounce" size={20} />
        </div>
      </section>

      {/* Why Join Us Section - Light Mode */}
      <section className="py-24 px-6 bg-[#fafafa]">
        <div className="container mx-auto max-w-5xl text-center">
          <div className="mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 text-brand-dark">
              Why Trufit?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
              More than just a workplace, we are a family of automotive
              enthusiasts committed to providing the highest standard of service
              in the industry.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {coreValues.map((value, idx) => (
              <div
                key={idx}
                className="bg-white p-8 text-left border border-gray-100 shadow-sm hover:shadow-md hover:border-brand-red/30 transition-all rounded-xl"
              >
                <div className="h-12 w-12 bg-brand-red/10 rounded-full flex items-center justify-center mb-6">
                  <div className="h-4 w-4 bg-brand-red rounded-full" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-brand-dark">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions Section - Slightly different light shade */}
      <section
        id="open-positions"
        className="py-24 px-6 bg-white border-t border-gray-100"
      >
        <div className="container mx-auto max-w-4xl">
          <div className="flex flex-col items-center mb-16 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-[1px] w-8 bg-brand-red" />
              <span className="text-brand-red text-xs font-bold tracking-[0.3em] uppercase">
                Available Roles
              </span>
              <div className="h-[1px] w-8 bg-brand-red" />
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-brand-dark">
              Current Openings
            </h2>
          </div>

          <div className="space-y-4">
            {positions.map((pos) => (
              <div
                key={pos.id}
                className="bg-[#fafafa] border border-gray-200 rounded-xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between group hover:border-brand-red hover:shadow-md transition-all cursor-pointer"
              >
                <div>
                  <h3 className="text-2xl font-bold text-brand-dark group-hover:text-brand-red transition-colors mb-2">
                    {pos.title}
                  </h3>
                  <div className="flex gap-4 text-sm text-gray-500 font-medium">
                    <span>{pos.type}</span>
                    <span>&bull;</span>
                    <span>{pos.location}</span>
                  </div>
                </div>

                <div className="mt-6 md:mt-0">
                  <button className="border-2 border-brand-dark text-brand-dark px-8 py-3 font-bold uppercase tracking-wider text-xs hover:bg-brand-dark hover:text-white transition-colors w-full md:w-auto rounded">
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center text-gray-500">
            <p>
              Don't see a position that fits? Send your resume to{" "}
              <a
                href="mailto:[EMAIL_ADDRESS]"
                className="text-brand-red font-bold hover:underline"
              >
                trufitautocenterdaet@gmail.com
              </a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
