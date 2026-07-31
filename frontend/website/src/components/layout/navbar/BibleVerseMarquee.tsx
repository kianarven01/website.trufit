"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface Verse {
  reference: string
  text: string
}

const FALLBACK: Verse = {
  reference: "Philippians 4:13",
  text: "I can do all things through Christ who strengthens me."
}

const CACHE_KEY = "dailyVerse"

function todayKey() {
  return new Date().toISOString().slice(0, 10) // "YYYY-MM-DD"
}

export default function BibleVerseMarquee() {
  const [verse, setVerse] = useState<Verse | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLooping, setIsLooping] = useState(false)

  useEffect(() => {
    const fetchVerse = async () => {
      try {
        // Check cache first
        const cached = localStorage.getItem(CACHE_KEY)
        if (cached) {
          const parsed = JSON.parse(cached)
          if (parsed.date === todayKey()) {
            setVerse(parsed.verse)
            return
          }
        }

        const res = await fetch("https://beta.ourmanna.com/api/v1/get/?format=json&order=sequential&type=verse")
        const data = await res.json()
        const details = data?.verse?.details

        if (details?.text && details?.reference) {
          const v: Verse = {
            reference: details.reference,
            text: details.text.replace(/<[^>]*>?/gm, "")
          }
          setVerse(v)
          localStorage.setItem(CACHE_KEY, JSON.stringify({ date: todayKey(), verse: v }))
        } else {
          setVerse(FALLBACK)
        }
      } catch (error) {
        console.error("Failed to fetch Bible verse:", error)
        setVerse(FALLBACK)
      } finally {
        setLoading(false)
      }
    }

    fetchVerse()
  }, [])

  if (loading || !verse) {
    return (
      <div className="flex-1 overflow-hidden relative h-full flex items-center">
        <div className="w-full h-4 bg-white/5 animate-pulse rounded-full mx-12" />
      </div>
    )
  }

  const verseText = `${verse.reference} - "${verse.text}"`

  return (
    <div className="flex-1 overflow-hidden relative h-full flex items-center">
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
              duration: isLooping ? 35 : 15,
              repeat: isLooping ? Infinity : 0,
              ease: "linear",
            },
            opacity: { duration: 0.5 }
          }}
          onAnimationComplete={() => {
            if (!isLooping) setIsLooping(true)
          }}
        >
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
