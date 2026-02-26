import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "react-feather";

interface CarouselProps {
  autoSlide?: boolean;
  autoSlideInterval?: number;
  slides: string[];
}

export default function Carousel({
  autoSlide = true,
  autoSlideInterval = 10000,
  slides,
}: CarouselProps) {
  const [curr, setCurr] = useState(1);
  const [isInteracting, setIsInteracting] = useState(false);

  const trackRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const prev = () =>
    setCurr((c) => (c === 0 ? slides.length - 1 : c - 1));
  const next = () =>
    setCurr((c) => (c === slides.length - 1 ? 0 : c + 1));

  // auto-slide effect
  useEffect(() => {
    if (!autoSlide) return;
    if (!isInteracting) {
      intervalRef.current = setInterval(next, autoSlideInterval);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoSlide, autoSlideInterval, isInteracting]);

  // drag start
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDown(true);
    setIsInteracting(true);
    setStartX(e.pageX - (trackRef.current?.offsetLeft || 0));
    setScrollLeft(trackRef.current?.scrollLeft || 0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - (trackRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 2; // scroll speed
    if (trackRef.current) trackRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDown(false);
    setIsInteracting(false);
  };
  const handleMouseLeave = () => {
    setIsDown(false);
    setIsInteracting(false);
  };

  return (
    <div className="relative w-full overflow-hidden py-16">
      {/* Sliding Track */}
<div
  className="flex items-center transition-transform duration-700 ease-in-out cursor-grab"
  style={{ transform: `translateX(calc(50% - ${curr * 33.33}% - 16.665%))` }}
  onMouseDown={handleMouseDown}
  onMouseUp={handleMouseUp}
  onMouseLeave={handleMouseLeave}
>
  {slides.map((img, i) => {
    const isCenter = i === curr;

    return (
      <div
        key={i}
        className="w-[33.33%] flex-shrink-0 flex justify-center px-2"
      >
        <img
          src={img}
          alt=""
          draggable={false}
          className={`
            max-h-[600px] object-contain
            transition-all duration-700
            ${
              isCenter
                ? "scale-105 blur-0 brightness-100 opacity-100"
                : "scale-95 blur-sm brightness-75 opacity-70"
            }
          `}
        />
      </div>
    );
  })}
</div>

      {/* Left Arrow */}
      <button
        onClick={() => { prev(); setIsInteracting(true); }}
        className="absolute left-1 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/80 shadow hover:bg-white z-20"
      >
        <ChevronLeft size={30} />
      </button>

      {/* Right Arrow */}
      <button
        onClick={() => { next(); setIsInteracting(true); }}
        className="absolute right-1 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/80 shadow hover:bg-white z-20"
      >
        <ChevronRight size={30} />
      </button>
    </div>
  );
}