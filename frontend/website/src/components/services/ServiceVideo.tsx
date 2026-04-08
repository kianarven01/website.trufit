"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import "./services.css";

gsap.registerPlugin(ScrollTrigger);

export default function ServiceVideo() {
  const container = useRef<HTMLDivElement>(null);
  const videoWrapper = useRef<HTMLDivElement>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  useGSAP(
    () => {
      gsap.fromTo(
        videoWrapper.current,
        { scale: 0.95, opacity: 0, y: 60 },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: "power3.out",
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

  useEffect(() => {
  const handleVisibility = () => {
    if (document.hidden && videoRef.current) {
      videoRef.current.pause();
    }
  };

  document.addEventListener("visibilitychange", handleVisibility);
  return () => document.removeEventListener("visibilitychange", handleVisibility);
}, []);

  return (
    <section ref={container} className="py-24 md:py-32 bg-gray-50 overflow-hidden px-6 sm:px-10 lg:px-24 border-y border-gray-100">
      <div className="max-w-[1400px] mx-auto text-center mb-16 md:mb-20">
        <div className="services-chapter-label justify-center mb-6">
          <div className="services-chapter-label-line" />
          <span className="services-chapter-label-text">
            Experience Trufit
          </span>
          <div className="services-chapter-label-line" />
        </div>

        <h2 className="text-3xl md:text-5xl font-semibold text-brand-dark uppercase tracking-tight mb-8">
          The <span className="text-brand-red">Suzuki Service</span> Standard
        </h2>
        <p className="text-gray-500 text-lg md:text-xl max-w-3xl mx-auto font-medium leading-relaxed">
          Experience our meticulous attention to detail and professional expertise in action. 
          See how our certified technicians treat every vehicle with world-class care.
        </p>
      </div>

      <div 
        ref={videoWrapper}
        onClick={() => {
          if (!isPlaying && videoRef.current) {
            videoRef.current.play();
          }
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className="relative aspect-video max-w-5xl mx-auto rounded-sm overflow-hidden shadow-2xl shadow-brand-dark/10 group cursor-pointer border border-gray-200"
      >

        {/* Video Element*/}
        <video
        ref={videoRef}
          src="/videos/service.mp4"
          controls={isPlaying && isHovering}
          controlsList="nodownload noremoteplayback"
          disablePictureInPicture
          onContextMenu={(e) => e.preventDefault()}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          className="absolute inset-0 w-full h-full object-cover z-20"
        />
        
        {/* Placeholder Thumbnail */}
        <Image
          src="/images/service-video-thumb.jpg"
          alt="Suzuki Service Process Video"
          fill
          className={`object-cover transition-transform duration-700 group-hover:scale-105 ${
            isPlaying ? "opacity-0" : "opacity-60"
          }`}
        />

        {!isPlaying && (
        <>
          {/* Overlay with Play Button */}
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-all duration-500">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-white/20 flex items-center justify-center bg-white/5 backdrop-blur-md group-hover:scale-110 transition-transform duration-500">
              <Play fill="white" size={32} className="text-white ml-1.5" />
            </div>
          </div>

          {/* Floating Text Decorative */}
          <div className="absolute bottom-10 left-10 text-white z-30 transition-opacity duration-300">
            <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-white mb-2 block border-l-2 border-brand-red pl-3">
              Watch Full Process
            </span>
            <h3 className="text-xl md:text-2xl font-semibold uppercase tracking-tight">
              Certified Maintenance <br/> Demonstration
            </h3>
          </div>
        </>
        )}
      </div>
    </section>
  );
}
