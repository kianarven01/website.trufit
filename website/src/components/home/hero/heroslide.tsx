// src/components/sections/HeroSlide.tsx
import Image from "next/image"
import Link from "next/link"
import { ArrowRightCircle, Play } from "lucide-react"
import { Slide } from "@/types/slide"

type Props = {
  slide: Slide
}

export default function HeroSlide({ slide }: Props) {
  const [firstWord, ...restWords] = slide.title.split(" ")
  const restOfTitle = restWords.join(" ")
  const serviceSlug = slide.title.replace(/\s+/g, "-").toLowerCase()

  return (
    <div className="relative h-screen w-full">
      
      {/* background image */}
      <Image
        src={slide.image}
        alt={slide.title}
        fill
        priority
        className="object-cover"
      />

      {/* dark overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* left shadow */}
      <div className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-black/70 to-transparent" />

      {/* right shadow */}
      <div className="absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-black/70 to-transparent" />

      {/* content */}
      <div className="relative z-10 flex h-full items-center">
        <div className="px-6 sm:px-10 md:px-16 lg:px-24 xl:px-32 text-white text-left max-w-4xl">
          
          {/* title */}
          <h1 className="font-brawler text-4xl md:text-6xl font-bold mb-4">
            <span className="text-red-600">{firstWord}</span> {restOfTitle}
          </h1>

          {/* subtitle */}
          <p className="font-brawler text-md md:text-xl mb-6">
            {slide.subtitle}
          </p>

          {/* buttons */}
          {slide.buttonText && slide.buttonLink && (
            <div className="flex flex-wrap gap-3">

              {/* main red button */}
              <Link
                href={slide.buttonLink}
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 px-6 py-3 rounded-md font-semibold transition"
              >
                {slide.buttonText}
                <ArrowRightCircle className="w-5 h-5" />
              </Link>

              {/* glass View More button */}
              <Link
                href={`/services/${serviceSlug}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-md font-semibold transition
                           bg-white/10 backdrop-blur-md border border-white/30 text-white
                           hover:bg-white/20"
              >
                <Play className="w-5 h-5" />
                View More
              </Link>

            </div>
          )}

        </div>
      </div>

    </div>
  )
}