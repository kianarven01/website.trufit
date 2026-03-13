"use client"

import { useState, useEffect, useRef } from "react"
import { slides } from "@/data/slides"
import HeroSlide from "./heroslide"

export default function HeroSlider() {
  const [index, setIndex] = useState(0)
  const slideCount = slides.length
  const intervalTime = 5000
  const [progress, setProgress] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // touch state
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)
  const minSwipeDistance = 50 // minimum distance to trigger swipe

  const startInterval = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % slideCount)
      setProgress(0)
    }, intervalTime)
  }

  useEffect(() => {
    startInterval()
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [slideCount])

  useEffect(() => {
    setProgress(0)
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 100 / (intervalTime / 100), 100))
    }, 100)
    return () => clearInterval(progressInterval)
  }, [index, intervalTime])

  const handleClick = (i: number) => {
    setIndex(i)
    setProgress(0)
    startInterval()
  }

  // handle swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    const distance = touchStartX.current - touchEndX.current
    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) {
        // swipe left → next slide
        setIndex((prev) => (prev + 1) % slideCount)
      } else {
        // swipe right → previous slide
        setIndex((prev) => (prev - 1 + slideCount) % slideCount)
      }
      setProgress(0)
      startInterval()
    }
  }

  return (
    <div
      className="relative w-full overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <HeroSlide slide={slides[index]} />

      {/* clickable rectangle progress bars */}
      <div className="absolute bottom-4 left-0 right-0 px-6 md:px-16 flex gap-2 z-50">
        {slides.map((_, i) => (
          <div
            key={i}
            onClick={() => handleClick(i)}
            className="flex-1 h-3 bg-white/30 cursor-pointer hover:bg-white/50 relative"
          >
            <div
              className="h-full bg-white transition-[width] duration-100 linear pointer-events-none"
              style={{
                width: i === index ? `${progress}%` : "0%",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}