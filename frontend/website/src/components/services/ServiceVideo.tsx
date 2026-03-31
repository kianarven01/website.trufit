"use client";

import { useRef } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export default function ServiceVideo() {
  const container = useRef<HTMLDivElement>(null);
  const videoWrapper = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        videoWrapper.current,
        { scale: 0.8, opacity: 0, y: 100 },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 1.5,
          ease: "power4.out",
          scrollTrigger: {
            trigger: container.current,
            start: "top 80%",
            toggleActions: "play reverse play reverse",
          },
        }
      );
    },
    { scope: container }
  );

  return (
    <section ref={container} className="py-24 md:py-40 bg-brand-dark overflow-hidden px-6 sm:px-10 lg:px-24">
      <div className="max-w-[1400px] mx-auto text-center mb-16 md:mb-24">
        <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-8">
          The <span className="text-brand-red">Suzuki Service</span> Standard
        </h2>
        <p className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto font-medium">
          Experience our meticulous attention to detail and professional expertise in action. 
          See how our certified technicians treat every vehicle with world-class care.
        </p>
      </div>

      <div 
        ref={videoWrapper}
        className="relative aspect-video max-w-6xl mx-auto rounded-xl overflow-hidden shadow-premium group cursor-pointer"
      >
        {/* Placeholder Thumbnail */}
        <Image
          src="/images/service-video-thumb.jpg"
          alt="Suzuki Service Process Video"
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-60"
        />

        {/* Overlay with Play Button */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-all duration-500">
          <div className="w-20 h-20 md:w-28 md:h-28 rounded-full border-2 border-white/30 flex items-center justify-center bg-white/10 backdrop-blur-md group-hover:scale-110 transition-transform duration-500">
            <Play fill="white" size={40} className="text-white ml-2" />
          </div>
        </div>

        {/* Floating Text Decorative */}
        <div className="absolute bottom-10 left-10 text-white z-10 transition-opacity duration-300">
          <span className="text-xs uppercase tracking-[0.5em] font-bold text-brand-red mb-2 block">
            Watch Full Process
          </span>
          <h3 className="text-2xl md:text-3xl font-black uppercase">
            Certified Maintenance <br/> Demonstration
          </h3>
        </div>

        {/* Grid Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>
    </section>
  );
}
