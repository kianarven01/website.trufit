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
            <div className="h-[2px] w-12 bg-brand-red" />
            <span className="text-sm font-semibold tracking-[0.3em] uppercase text-brand-red">
              Experience Trufit
            </span>
            <div className="h-[2px] w-12 bg-brand-red" />
          </div>

          <h2 className="text-3xl md:text-5xl font-semibold text-brand-dark mb-6 uppercase tracking-tight video-reveal">
            Take a <span className="text-brand-red">Video Tour</span>
          </h2>

          <p className="text-gray-500 text-lg max-w-2xl mx-auto video-reveal font-medium">
            Explore our state-of-the-art facility and see our expert team in action through this virtual walkthrough.
          </p>
        </div>

        {/* Video Player Container */}
        <div className="video-reveal max-w-5xl mx-auto flex flex-col items-center">
          <div className="relative group w-full aspect-video bg-brand-dark rounded-sm overflow-hidden shadow-2xl shadow-brand-dark/20 border border-gray-200">
            {/* HTML5 Video Showcase */}
            <video
              className="absolute inset-0 w-full h-full object-cover outline-none"
              src="/images/gallery/video_showcase.mp4"
              controls
              controlsList="nodownload"
              playsInline
              preload="metadata"
            />
          </div>

          {/* Credits / Caption Below Video */}
          <div className="mt-8 text-center px-4 w-full border-t border-gray-200 pt-6 flex flex-col gap-1">
            <p className="text-sm text-gray-400 font-semibold uppercase tracking-[0.2em]">
              Media recorded at <span className="text-brand-dark">Trufit Auto Center Facility</span>
            </p>
            <p className="text-xs text-brand-red font-semibold uppercase tracking-[0.2em]">
              by CNTV
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
