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

  // function to start auto-slide interval
  const startInterval = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % slideCount)
      setProgress(0)
    }, intervalTime)
  }

  // start auto-slide on mount
  useEffect(() => {
    startInterval()
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [slideCount])

  // animate progress for current slide
  useEffect(() => {
    setProgress(0)
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 100 / (intervalTime / 100), 100))
    }, 100)
    return () => clearInterval(progressInterval)
  }, [index, intervalTime])

  // handle click on progress bar
  const handleClick = (i: number) => {
    setIndex(i)
    setProgress(0)
    startInterval() // reset interval after manual click
  }

  return (
    <div className="relative w-full">
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