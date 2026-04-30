"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { galleryItems, GalleryItem } from "@/data/galleryData";
import { Play, Maximize2, Car, ChevronLeft, ChevronRight, X } from "lucide-react";

const categories = [
  { id: "all", name: "All Showcase" },
  { id: "service-center", name: "Service Center" },
  { id: "technologies", name: "Technologies" },
];

export default function GalleryGrid() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  const ITEMS_PER_PAGE = 16;
  const gridRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedItemIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedItemIndex]);

  const categoryFilteredItems = activeCategory === "all" 
    ? galleryItems 
    : galleryItems.filter(item => item.category === activeCategory);

  const totalPages = Math.max(1, Math.ceil(categoryFilteredItems.length / ITEMS_PER_PAGE));
  const filteredItems = categoryFilteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to first page when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    if (gridRef.current) {
      const topPos = gridRef.current.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({
        top: topPos,
        behavior: "smooth"
      });
    }
  };

  const handleNextModal = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (selectedItemIndex !== null && selectedItemIndex < filteredItems.length - 1) {
      setSelectedItemIndex(selectedItemIndex + 1);
    }
  };

  const handlePrevModal = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (selectedItemIndex !== null && selectedItemIndex > 0) {
      setSelectedItemIndex(selectedItemIndex - 1);
    }
  };

  const getBentoClass = (index: number) => {
    const i = index % 8;
    // Mathematically perfect 12-unit bento repeating block. 
    // Works flawlessly creating full rectangles on 2, 3, and 4 column grids!
    if (i === 0) return "col-span-2 md:col-span-2 md:row-span-2";
    if (i === 3) return "col-span-2 md:col-span-2";
    return "col-span-1 row-span-1";
  };

  return (
    <section className="bg-white py-24 md:py-32 relative">
      <div className="max-w-[1820px] mx-auto px-6 sm:px-10 lg:px-16">
        
        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 mb-16 md:mb-20">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-5 py-3 md:px-10 md:py-5 rounded-sm font-semibold transition-all uppercase tracking-[0.2em] text-[10px] md:text-xs border-2 ${
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
          ref={gridRef}
          layout
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6 auto-rows-[200px] md:auto-rows-[250px] lg:auto-rows-[280px] grid-flow-dense"
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                onClick={() => setSelectedItemIndex(index)}
                className={`group relative bg-gray-50 rounded-sm overflow-hidden border border-gray-100 shadow-sm w-full h-full cursor-pointer ${getBentoClass(index)}`}
              >
                {/* Image Placeholder / Asset */}
                <div className="absolute inset-0 z-0">
                  {/* Since these are placeholders, we'll show a styled fallback if image fails */}
                  <div className="relative w-full h-full bg-brand-dark/5 flex flex-col items-center justify-center p-6 md:p-12 text-center overflow-hidden">
                    <div className="relative mb-3 md:mb-6">
                      <Car className="w-10 h-10 md:w-20 md:h-20 text-brand-red/10 animate-pulse" />
                      <div className="absolute inset-0 bg-brand-red/5 blur-3xl rounded-full" />
                    </div>
                    <span className="text-gray-300 font-semibold uppercase tracking-[0.2em] md:tracking-[0.3em] text-[8px] md:text-[10px] mb-1 md:mb-2">{item.category}</span>
                    <h3 className="text-brand-dark/30 font-semibold text-sm md:text-2xl uppercase leading-tight">{item.title}</h3>
                    
                    {/* Decorative lines for "high-end" vibe even without image */}
                    <div className="absolute top-4 left-4 md:top-8 md:left-8 w-6 md:w-12 h-[1px] bg-brand-dark/10" />
                    <div className="absolute top-4 left-4 md:top-8 md:left-8 w-[1px] h-6 md:h-12 bg-brand-dark/10" />
                    <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8 w-6 md:w-12 h-[1px] bg-brand-dark/10" />
                    <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8 w-[1px] h-6 md:h-12 bg-brand-dark/10" />
                  </div>

                  {/* Real Image */}
                  <Image 
                    src={item.image} 
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110 z-[1]"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>

                {/* Overlay Content */}
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-brand-dark/95 via-brand-dark/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 p-4 md:p-10 flex flex-col justify-end">
                  <div className="transform translate-y-4 md:translate-y-8 group-hover:translate-y-0 transition-transform duration-500">
                    <span className="text-brand-red text-[8px] md:text-[10px] font-semibold uppercase tracking-[0.3em] md:tracking-[0.4em] block mb-1 md:mb-3">
                      {item.category.replace("-", " ")}
                    </span>
                    <h3 className="text-white text-lg md:text-3xl font-semibold mb-4 md:mb-6 uppercase font-barlow leading-tight">
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
            <h3 className="text-gray-400 font-semibold uppercase tracking-widest text-xl mb-2">Expanding Collection</h3>
            <p className="text-gray-300 text-sm font-medium">New visual content is being prepared for this section.</p>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-16 md:mt-24 flex justify-center items-center gap-4">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center border-2 border-gray-200 rounded-sm text-brand-dark disabled:opacity-30 disabled:cursor-not-allowed hover:border-brand-red hover:text-brand-red transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i + 1)}
                  className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-sm font-semibold text-sm transition-all border-2 ${
                    currentPage === i + 1
                      ? "bg-brand-dark text-white border-brand-dark"
                      : "bg-white text-gray-500 border-gray-200 hover:border-brand-red hover:text-brand-red"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center border-2 border-gray-200 rounded-sm text-brand-dark disabled:opacity-30 disabled:cursor-not-allowed hover:border-brand-red hover:text-brand-red transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedItemIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 md:p-10"
            onClick={() => setSelectedItemIndex(null)}
          >
            {/* Close Button */}
            <button 
              className="absolute top-4 right-4 md:top-6 md:right-6 z-[10000] w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-brand-red text-white transition-all border border-white/20"
              onClick={() => setSelectedItemIndex(null)}
            >
              <X size={20} className="md:w-6 md:h-6" />
            </button>

            {/* Previous Button */}
            {selectedItemIndex > 0 && (
              <button 
                className="absolute left-2 md:left-10 z-[10000] w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-black/50 hover:bg-brand-red text-white transition-all border border-white/20 hidden md:flex"
                onClick={handlePrevModal}
              >
                <ChevronLeft size={24} />
              </button>
            )}

            {/* Active Image */}
            <AnimatePresence mode="wait">
              <motion.div 
                key={selectedItemIndex}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.2 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.8}
                onDragEnd={(e, { offset }) => {
                  if (offset.x < -50 && selectedItemIndex < filteredItems.length - 1) {
                    handleNextModal();
                  } else if (offset.x > 50 && selectedItemIndex > 0) {
                    handlePrevModal();
                  }
                }}
                className="relative w-full max-w-6xl h-[70vh] md:h-full md:max-h-[85vh] flex items-center justify-center cursor-grab active:cursor-grabbing"
                onClick={(e) => e.stopPropagation()}
              >
                <Image 
                  src={filteredItems[selectedItemIndex].image} 
                  alt={filteredItems[selectedItemIndex].title}
                  fill
                  className="object-contain"
                  priority
                  sizes="100vw"
                />
                <div className="absolute -bottom-16 md:-bottom-10 left-0 right-0 text-center text-white pointer-events-none">
                  <p className="text-lg md:text-xl font-bold uppercase tracking-widest">{filteredItems[selectedItemIndex].title}</p>
                  <p className="text-xs md:text-sm text-brand-red font-semibold uppercase tracking-widest mt-1">{filteredItems[selectedItemIndex].category.replace("-", " ")}</p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Next Button */}
            {selectedItemIndex < filteredItems.length - 1 && (
              <button 
                className="absolute right-2 md:right-10 z-[10000] w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-black/50 hover:bg-brand-red text-white transition-all border border-white/20 hidden md:flex"
                onClick={handleNextModal}
              >
                <ChevronRight size={24} />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
