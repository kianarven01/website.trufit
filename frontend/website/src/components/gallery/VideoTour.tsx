"use client";

import { useRef } from "react";
import { Play } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function VideoTour() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.fromTo(
      ".video-reveal",
      { opacity: 0, y: 40 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 1, 
        stagger: 0.2, 
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
        }
      }
    );
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="bg-gray-50 py-24 md:py-32 overflow-hidden border-y border-gray-100">
      <div className="max-w-[1820px] mx-auto px-6 sm:px-10 lg:px-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6 video-reveal">
            <div className="h-[2px] w-12 bg-brand-blue" />
            <span className="text-sm font-extrabold tracking-[0.3em] uppercase text-brand-blue">
              Experience Trufit
            </span>
            <div className="h-[2px] w-12 bg-brand-blue" />
          </div>

          <h2 className="text-3xl md:text-5xl font-black text-brand-dark mb-6 font-brawler uppercase tracking-tight italic video-reveal">
            Take a <span className="text-brand-red">Video Tour</span>
          </h2>

          <p className="text-gray-500 text-lg max-w-2xl mx-auto video-reveal font-medium">
            Explore our state-of-the-art facility and see our expert team in action through this virtual walkthrough.
          </p>
        </div>

        {/* Video Player Container */}
        <div className="video-reveal max-w-5xl mx-auto">
          <div className="relative group aspect-video bg-brand-dark rounded-sm overflow-hidden shadow-2xl shadow-brand-dark/20 border border-gray-200">
            {/* Placeholder / YouTube Embed */}
            {/* Replace the src with your actual YouTube video ID later */}
            <iframe
              className="absolute inset-0 w-full h-full"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0&controls=1&rel=0"
              title="Trufit Auto Center Tour"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
            
            {/* Overlay (Optional: can be removed if using iframe directly) */}
            <div className="absolute inset-0 bg-brand-dark/40 group-hover:bg-brand-dark/10 transition-all pointer-events-none flex items-center justify-center">
                <div className="w-24 h-24 bg-brand-red text-white flex items-center justify-center rounded-full scale-90 group-hover:scale-100 transition-transform shadow-xl shadow-brand-red/40">
                  <Play size={40} fill="currentColor" className="ml-1" />
                </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
