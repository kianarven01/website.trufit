"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface Verse {
  bookname: string
  chapter: string
  verse: string
  text: string
}

export default function BibleVerseMarquee() {
  const [verse, setVerse] = useState<Verse | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLooping, setIsLooping] = useState(false)

  useEffect(() => {
    const fetchVerse = async () => {
      try {
        const response = await fetch("https://labs.bible.org/api/?passage=random&type=json")
        const data = await response.json()
        if (data && data.length > 0) {
          setVerse(data[0])
        }
      } catch (error) {
        console.error("Failed to fetch Bible verse:", error)
        setVerse({
          bookname: "Philippians",
          chapter: "4",
          verse: "13",
          text: "I can do all things through Christ who strengthens me."
        })
      } finally {
        setLoading(false)
      }
    }

    fetchVerse()
  }, [])

  // Show an empty but masked container while loading to prevent layout shift
  if (loading || !verse) {
    return (
      <div className="flex-1 overflow-hidden relative h-full flex items-center">
        <div className="w-full h-4 bg-white/5 animate-pulse rounded-full mx-12" />
      </div>
    )
  }

  const cleanText = verse.text.replace(/<[^>]*>?/gm, "")
  const verseText = `${verse.bookname} ${verse.chapter}:${verse.verse} - "${cleanText}"`

  return (
    <div className="flex-1 overflow-hidden relative h-full flex items-center">
      {/* "Tunnel" effect container */}
      <div 
        className="relative w-full overflow-hidden h-full flex items-center"
        style={{
          maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)"
        }}
      >
        <motion.div
          className="flex whitespace-nowrap w-max opacity-0"
          initial={{ x: "100%", opacity: 0 }}
          animate={{ 
            x: isLooping ? [0, "-50%"] : 0,
            opacity: 1
          }}
          transition={{
            x: {
              duration: isLooping ? 35 : 15, // Initial entry is a bit faster than the loop
              repeat: isLooping ? Infinity : 0,
              ease: "linear",
            },
            opacity: { duration: 0.5 }
          }}
          onAnimationComplete={() => {
            if (!isLooping) setIsLooping(true)
          }}
        >
          {/* Dual clones for seamless looping */}
          <div className="flex items-center px-24 md:px-48">
            <span className="text-brand-red font-bold mr-2 shrink-0">Daily Bread:</span>
            <span className="font-medium tracking-wide">{verseText}</span>
          </div>
          <div className="flex items-center px-24 md:px-48">
            <span className="text-brand-red font-bold mr-2 shrink-0">Daily Bread:</span>
            <span className="font-medium tracking-wide">{verseText}</span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
