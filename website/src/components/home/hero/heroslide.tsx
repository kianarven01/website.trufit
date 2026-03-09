// src/components/sections/HeroSlide.tsx
import Image from "next/image"
import Link from "next/link"
import { Slide } from "@/types/slide"

type Props = {
  slide: Slide
}

export default function HeroSlide({ slide }: Props) {
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

      {/* content */}
      <div className="relative z-10 flex h-full items-center">
        <div className="px-6 sm:px-10 md:px-16 lg:px-24 xl:px-32 text-white text-left max-w-4xl">
          
          {/* title */}
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            {slide.title}
          </h1>

          {/* subtitle */}
          <p className="text-lg md:text-xl mb-6">
            {slide.subtitle}
          </p>

          {/* optional button */}
          {slide.buttonText && slide.buttonLink && (
            <Link
              href={slide.buttonLink}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-md font-semibold transition"
            >
              {slide.buttonText}
            </Link>
          )}

        </div>
      </div>

    </div>
  )
}