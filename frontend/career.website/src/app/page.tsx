"use client";

import { ChevronDown, Eye, Target, Star } from "lucide-react";
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
    { id: 1, title: "Administrative Officer", type: "Full-Time", location: "On-site" },
    { id: 2, title: "HR Team Head", type: "Full-Time", location: "On-site" },
    { id: 3, title: "Purchasing Team Head", type: "Full-Time", location: "On-site" },
    { id: 4, title: "Accounting Team Head", type: "Full-Time", location: "On-site" },
    { id: 5, title: "Technical Team Head", type: "Full-Time", location: "On-site" },
    { id: 6, title: "Sales and Marketing Team Head", type: "Full-Time", location: "On-site" },
    { id: 7, title: "Warehouse Staff", type: "Full-Time", location: "On-site" },
    { id: 8, title: "Accounting Staff", type: "Full-Time", location: "On-site" },
    { id: 9, title: "Service Manager", type: "Full-Time", location: "On-site" },
    { id: 10, title:  "Service Advisor", type: "Full-Time", location: "On-site" },
    { id: 11, title: "Customer Relations Officer", type: "Full-Time", location: "On-site" },
    { id: 12, title: "Leadman", type: "Full-Time", location: "On-site" },
    { id: 13, title: "Assistant Leadman", type: "Full-Time", location: "On-site" },
    { id: 14, title: "Electrical Technician", type: "Full-Time", location: "On-site" },
    { id: 15, title: "Transmission Technician", type: "Full-Time", location: "On-site" },
    { id: 16, title: "Underchassis Technician", type: "Full-Time", location: "On-site" },
    { id: 17, title: "Aircon Technician", type: "Full-Time", location: "On-site" },
    { id: 18, title: "General Mechanic", type: "Full-Time", location: "On-site" },
    { id: 19, title: "Mechanical Helper", type: "Full-Time", location: "On-site" },

    
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

      {/* About the Company Section */}
      <section className="py-32 px-6 bg-[#0a0a0a] text-white overflow-hidden relative">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-red/5 rounded-full blur-[120px] pointer-events-none translate-x-1/3 -translate-y-1/3" />
        
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Text Content */}
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="h-[2px] w-12 bg-brand-red" />
                <span className="text-brand-red font-bold text-sm tracking-[0.2em] uppercase">
                  About Trufit Auto Center
                </span>
              </div>
              
              <h2 className="text-3xl md:text-5xl font-semibold mb-4 leading-tight uppercase tracking-tight text-white mt-4">
                Quality Service <br/>
                <span className="text-brand-red">For Every Car</span>
              </h2>
              
              <div className="mt-8">
                <p className="text-white/80 text-lg md:text-xl mb-6 leading-relaxed max-w-2xl font-medium">
                  Founded in 2019, Trufit Auto Center was established with a clear mission: to provide dependable, efficient, and honest automotive services. Backed by <strong className="text-white font-medium">25+ years of expertise</strong>, we deliver dealership-level quality with fair, transparent pricing while ensuring safety and performance on every journey.
                </p>
                <p className="text-white/60 text-base leading-relaxed max-w-2xl">
                  Beyond the workshop, our discipline extends to our <strong className="text-white font-medium">Overland Community</strong> and our local <strong className="text-white font-medium">Triathlon Team</strong>. The endurance, precision, and teamwork required to cross the finish line are the exact values we bring to every vehicle we service.
                </p>
              </div>
            </div>

            {/* Image Composition */}
            <div className="grid grid-cols-2 gap-4 mt-12 lg:mt-0">
              <div className="rounded-sm overflow-hidden shadow-xl border border-white/5 aspect-[4/3]">
                 <img src="/images/about/workshop.webp" alt="Trufit Workshop" className="w-full h-full object-cover" />
              </div>
              <div className="rounded-sm overflow-hidden shadow-xl border border-white/5 aspect-[4/3] mt-8">
                 <img src="/images/about/detailshot.webp" alt="Precision Work" className="w-full h-full object-cover" />
              </div>
              <div className="rounded-sm overflow-hidden shadow-xl border border-white/5 aspect-[4/3] -mt-8">
                 <img src="/images/about/overland.webp" alt="Overland" className="w-full h-full object-cover" />
              </div>
              <div className="rounded-sm overflow-hidden shadow-xl border border-white/5 aspect-[4/3]">
                 <img src="/images/about/triathlon.webp" alt="Triathlon" className="w-full h-full object-cover" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* What Drives Us Section */}
      <section className="relative py-32 px-6 bg-[#111111] overflow-hidden border-t border-white/5">
        {/* Background Image Overlay */}
        <div className="absolute inset-0 z-0 opacity-10">
          <img src="/images/hero/laboratory.webp" alt="Background" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/80 to-[#111111] z-10" />

        <div className="container mx-auto max-w-7xl relative z-20 text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-[2px] w-12 bg-brand-red" />
            <span className="text-brand-red text-sm font-bold tracking-[0.4em] uppercase">
              Our Foundation
            </span>
            <div className="h-[2px] w-12 bg-brand-red" />
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-20 uppercase tracking-wider">
            What Drives Us
          </h2>

          <div className="grid md:grid-cols-3 gap-8 text-left">
            {/* Vision */}
            <div className="bg-white/5 border border-white/10 p-10 rounded-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-brand-red/10 rounded-full text-brand-red">
                  <Eye size={24} />
                </div>
                <h3 className="text-2xl font-bold text-white tracking-widest uppercase">Vision</h3>
              </div>
              <p className="text-white/60 leading-relaxed text-sm">
                To be recognized as one of the most reliable and customer-focused auto service centers in the region, known for professionalism, innovation, and service excellence.
              </p>
            </div>

            {/* Mission */}
            <div className="bg-white/5 border border-white/10 p-10 rounded-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-brand-red/10 rounded-full text-brand-red">
                  <Target size={24} />
                </div>
                <h3 className="text-2xl font-bold text-white tracking-widest uppercase">Mission</h3>
              </div>
              <p className="text-white/60 leading-relaxed text-sm">
                To provide dependable, efficient, and honest automotive services that exceed customer expectations while ensuring safety and performance on every journey.
              </p>
            </div>

            {/* Core Values */}
            <div className="bg-white/5 border border-white/10 p-10 rounded-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-brand-red/10 rounded-full text-brand-red">
                  <Star size={24} />
                </div>
                <h3 className="text-2xl font-bold text-white tracking-widest uppercase">Core Values</h3>
              </div>
              <ul className="text-white/60 text-sm space-y-4">
                <li className="flex items-start gap-2"><span className="text-brand-red font-bold mt-1">&bull;</span> <span><strong className="text-white">Integrity</strong> — Honest assessments and transparent pricing.</span></li>
                <li className="flex items-start gap-2"><span className="text-brand-red font-bold mt-1">&bull;</span> <span><strong className="text-white">Quality</strong> — Premium workmanship using proper tools and materials.</span></li>
                <li className="flex items-start gap-2"><span className="text-brand-red font-bold mt-1">&bull;</span> <span><strong className="text-white">Customer Care</strong> — Building trust, one service at a time.</span></li>
                <li className="flex items-start gap-2"><span className="text-brand-red font-bold mt-1">&bull;</span> <span><strong className="text-white">Reliability</strong> — Consistent performance you can count on.</span></li>
                <li className="flex items-start gap-2"><span className="text-brand-red font-bold mt-1">&bull;</span> <span><strong className="text-white">Professionalism</strong> — Industry-leading standards and practices.</span></li>
              </ul>
            </div>
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
                href="mailto:trufitautocenterdaet@gmail.com"
                className="text-brand-red font-bold hover:underline"
              >
                trufitautocenterdaet@gmail.com
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* Official Supply Partners Section */}
      <section className="py-24 px-6 bg-[#fafafa] border-t border-gray-200">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="flex items-center justify-center gap-4 mb-16">
            <div className="h-[1px] w-12 bg-gray-300" />
            <span className="text-gray-400 text-xs font-bold tracking-[0.4em] uppercase">
              Official Supply Partners
            </span>
            <div className="h-[1px] w-12 bg-gray-300" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12 items-center justify-items-center">
            <img src="/images/partners/wurth.webp" alt="Wurth" className="h-12 md:h-16 object-contain" />
            <img src="/images/partners/valvoline.webp" alt="Valvoline" className="h-12 md:h-16 object-contain" />
            <img src="/images/partners/frontrunner.webp" alt="Front Runner" className="h-12 md:h-16 object-contain" />
            <img src="/images/partners/trailgecko.webp" alt="Trailgecko" className="h-12 md:h-16 object-contain" />
            <img src="/images/partners/totalhitch.webp" alt="Total Hitch" className="h-12 md:h-16 object-contain" />
            <img src="/images/partners/toughdog.webp" alt="Tough Dog" className="h-12 md:h-16 object-contain" />
            <img src="/images/partners/splitfire.webp" alt="Splitfire" className="h-12 md:h-16 object-contain" />
          </div>
        </div>
      </section>
    </div>
  );
}
