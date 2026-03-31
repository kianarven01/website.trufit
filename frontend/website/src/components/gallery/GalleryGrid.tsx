"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { galleryItems, GalleryItem } from "@/data/galleryData";
import { Play, Maximize2, Car } from "lucide-react";

const categories = [
  { id: "all", name: "All Showcase" },
  { id: "service-center", name: "Service Center" },
  { id: "technologies", name: "Technologies" },
];

export default function GalleryGrid() {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredItems = activeCategory === "all" 
    ? galleryItems 
    : galleryItems.filter(item => item.category === activeCategory);

  return (
    <section className="bg-white py-24 md:py-32 relative">
      <div className="max-w-[1820px] mx-auto px-6 sm:px-10 lg:px-16">
        
        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 mb-16 md:mb-20">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-5 py-3 md:px-10 md:py-5 rounded-sm font-black transition-all uppercase tracking-[0.2em] text-[10px] md:text-xs border-2 ${
                activeCategory === category.id 
                  ? "bg-brand-dark text-white border-brand-dark" 
                  : "bg-transparent text-brand-dark border-gray-100 hover:border-brand-red hover:text-brand-red"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* The Grid */}
        <motion.div 
          layout
          className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="group relative h-[250px] sm:h-[350px] lg:h-[450px] bg-gray-50 rounded-sm overflow-hidden border border-gray-100 shadow-sm"
              >
                {/* Image Placeholder / Asset */}
                <div className="absolute inset-0 z-0">
                  {/* Since these are placeholders, we'll show a styled fallback if image fails */}
                  <div className="relative w-full h-full bg-brand-dark/5 flex flex-col items-center justify-center p-6 md:p-12 text-center overflow-hidden">
                    <div className="relative mb-3 md:mb-6">
                      <Car className="w-10 h-10 md:w-20 md:h-20 text-brand-red/10 animate-pulse" />
                      <div className="absolute inset-0 bg-brand-red/5 blur-3xl rounded-full" />
                    </div>
                    <span className="text-gray-300 font-extrabold uppercase tracking-[0.2em] md:tracking-[0.3em] text-[8px] md:text-[10px] mb-1 md:mb-2">{item.category}</span>
                    <h3 className="text-brand-dark/30 font-black text-sm md:text-2xl uppercase italic leading-tight">{item.title}</h3>
                    
                    {/* Decorative lines for "high-end" vibe even without image */}
                    <div className="absolute top-4 left-4 md:top-8 md:left-8 w-6 md:w-12 h-[1px] bg-brand-dark/10" />
                    <div className="absolute top-4 left-4 md:top-8 md:left-8 w-[1px] h-6 md:h-12 bg-brand-dark/10" />
                    <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8 w-6 md:w-12 h-[1px] bg-brand-dark/10" />
                    <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8 w-[1px] h-6 md:h-12 bg-brand-dark/10" />
                  </div>

                  {/* Real Image (when provided) */}
                  {/* <Image 
                    src={item.image} 
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  /> */}
                </div>

                {/* Overlay Content */}
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-brand-dark/95 via-brand-dark/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 p-4 md:p-10 flex flex-col justify-end">
                  <div className="transform translate-y-4 md:translate-y-8 group-hover:translate-y-0 transition-transform duration-500">
                    <span className="text-brand-red text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] block mb-1 md:mb-3">
                      {item.category.replace("-", " ")}
                    </span>
                    <h3 className="text-white text-lg md:text-3xl font-black mb-4 md:mb-6 uppercase italic font-brawler leading-tight">
                      {item.title}
                    </h3>
                    
                    <div className="flex gap-2 md:gap-4">
                      {item.isVideo && (
                        <div className="w-8 h-8 md:w-12 md:h-12 bg-brand-red text-white flex items-center justify-center rounded-full shadow-lg shadow-brand-red/30">
                          <Play size={14} fill="currentColor" className="md:w-5 md:h-5" />
                        </div>
                      )}
                      {!item.isVideo && (
                        <div className="w-8 h-8 md:w-12 md:h-12 bg-white/10 text-white flex items-center justify-center rounded-full backdrop-blur-sm border border-white/20">
                          <Maximize2 size={14} className="md:w-5 md:h-5" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Corner Accent */}
                <div className="absolute top-4 right-4 md:top-6 md:right-6 w-6 md:w-10 h-6 md:h-10 border-t border-r border-white/0 group-hover:border-brand-red/50 transition-all duration-500 delay-100" />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty State / Coming Soon */}
        {filteredItems.length === 0 && (
          <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-sm">
            <h3 className="text-gray-400 font-black uppercase tracking-widest text-xl italic mb-2">Expanding Collection</h3>
            <p className="text-gray-300 text-sm font-medium">New visual content is being prepared for this section.</p>
          </div>
        )}
      </div>
    </section>
  );
}
