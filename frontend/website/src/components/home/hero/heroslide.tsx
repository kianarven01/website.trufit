// src/components/sections/HeroSlide.tsx
import Image from "next/image"
import Link from "next/link"
import { ArrowRightCircle, Play } from "lucide-react"
import { Slide } from "@/types/slide"

type Props = {
  slide: Slide
}

export default function HeroSlide({ slide, isActive }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const accreditationsRef = useRef<HTMLDivElement>(null);

  const [firstWord, ...restWords] = slide.title.split(" ");
  const restOfTitle = restWords.join(" ");

  // Common style to prevent sub-pixel rendering shifts and color "blinks"
  const consistentTextStyle: React.CSSProperties = {
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
    transformStyle: "preserve-3d",
  };

  useLayoutEffect(() => {
    // If NOT active (Base Layer), keep it locked in its final state
    if (!isActive) {
      gsap.set(
        [
          badgeRef.current,
          titleRef.current,
          subtitleRef.current,
          buttonsRef.current,
          accreditationsRef.current,
        ],
        {
          opacity: 1,
          x: 0,
          y: 0,
          overwrite: true,
        },
      );
      return;
    }

    const ctx = gsap.context(() => {
      // Set initial states for incoming slide
      gsap.set(
        [
          badgeRef.current,
          titleRef.current,
          subtitleRef.current,
          buttonsRef.current,
          accreditationsRef.current,
        ],
        {
          opacity: 0,
        },
      );

      const tl = gsap.timeline({
        defaults: {
          ease: "power4.out",
          duration: 1.5,
        },
        delay: 1.2,
      });

      tl.fromTo(
          badgeRef.current,
          { opacity: 0, x: -20, y: 40 },
          { opacity: 1, x: 0, y: 0 }
        )
        .fromTo(
          titleRef.current,
          { opacity: 0, y: 60 },
          { opacity: 1, y: 0 },
          "-=1.3",
        )
        .fromTo(
          subtitleRef.current,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0 },
          "-=1.4",
        )
        .fromTo(
          buttonsRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0 },
          "-=1.4",
        )
        .fromTo(
          accreditationsRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0 },
          "-=1.4",
        );
    }, containerRef);

    return () => ctx.revert();
  }, [slide, isActive]);

  return (
    <div ref={containerRef} className="relative h-full w-full">
      {/* background image */}
      {slide.image ? (
        <Image
          src={slide.image}
          alt={slide.title}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      ) : (
        <div className="absolute inset-0 bg-brand-dark flex items-center justify-center">
          <div className="w-full h-full bg-[radial-gradient(circle_at_center,rgba(227,27,35,0.08)_0%,transparent_70%)]" />
          <div className="absolute inset-0 opacity-20" style={{ 
            backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)`,
            backgroundSize: '100px 100px'
          }} />
        </div>
      )}

      {/* dark overlay */}
      <div className="absolute inset-0 bg-black/70" />

      {/* left shadow */}
      <div className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-black/70 to-transparent" />

      {/* right shadow */}
      <div className="absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-black/70 to-transparent" />

      {/* content */}
      <div className="relative z-10 flex h-full items-center">
        <div
          className="px-6 sm:px-10 md:px-16 lg:px-24 xl:px-32 text-white text-left max-w-[1820px] mx-auto w-full 
                      pt-20 md:pt-18 lg:pt-20 pb-16 md:pb-2 flex flex-col justify-center -translate-y-4 sm:-translate-y-6 md:translate-y-0"
        >
          {/* Quality Auto Care badge */}
          <div
            ref={badgeRef}
            className="flex items-center gap-2 mb-3 md:mb-3 landscape:hidden lg:landscape:flex"
            style={{ 
                opacity: isActive ? 0 : 1,
                ...consistentTextStyle 
            }}
          >
            <div className="h-[2px] w-8 bg-brand-red" />
            <span className="text-[10px] md:text-xs font-semibold tracking-[0.3em] uppercase text-white/80">
              {slide.smallHeader}
            </span>
          </div>

          {/* title */}
          <h1
            ref={titleRef}
            className="font-semibold mb-2 md:mb-3 leading-[1.1] uppercase landscape:text-2xl tracking-tight"
            style={{ 
                opacity: isActive ? 0 : 1,
                ...consistentTextStyle,
                fontSize: 'clamp(1.75rem, 5vw, 5rem)'
            }}
          >
            <span className="text-brand-red">{firstWord}</span> {restOfTitle}
          </h1>

          {/* subtitle */}
          <p
            ref={subtitleRef}
            className="max-w-2xl text-gray-300 font-light leading-relaxed landscape:hidden lg:landscape:block mb-3 md:mb-5"
            style={{ 
                opacity: isActive ? 0 : 1,
                ...consistentTextStyle,
                fontSize: 'clamp(0.8rem, 1.3vw, 1.25rem)'
            }}
          >
            {slide.subtitle}
          </p>

          {/* buttons */}
          <div ref={buttonsRef} className="flex flex-wrap gap-2 md:gap-4 mb-5 md:mb-10 landscape:mb-4 md:landscape:mb-6" style={{ opacity: isActive ? 0 : 1, ...consistentTextStyle }}>
            
            <Link href={slide.primaryLink} className="group inline-flex items-center gap-2 bg-brand-red hover:bg-red-700 px-3 py-2 sm:px-5 sm:py-2.5 md:px-8 md:py-4 rounded-sm font-semibold transition-all shadow-lg hover:shadow-red-900/40 text-[9px] sm:text-xs md:text-base">
              Our Services
              <div className="bg-white/20 p-1 rounded-full group-hover:bg-white/40 transition-colors">
                <ArrowRightCircle className="w-3 md:w-4 h-3 md:h-4" />
              </div>
            </Link>
          </div>

          {/* Accreditations and Stats combined in one line */}
          <div className="flex flex-wrap items-center gap-4 md:gap-16 border-t border-white/10 pt-4 md:pt-10 landscape:hidden lg:landscape:flex">
            {/* Accreditations Part */}
            <div 
              ref={accreditationsRef}
              className="flex flex-wrap items-center gap-6 md:gap-14"
              style={{ 
                opacity: isActive ? 0 : 1,
                ...consistentTextStyle 
              }}
            >
              <div className="flex items-center gap-3 md:gap-4">
                <Image src="/images/accreditations/suzuki.webp" alt="Suzuki Authorized" width={140} height={140} className="w-auto h-8 md:h-12 object-contain" />
                <div className="text-[10px] md:text-sm uppercase font-bold tracking-tight leading-tight">
                  Authorized<br/><span className="text-gray-400 font-medium">Service Station</span>
                </div>
              </div>
              <div className="flex items-center gap-3 md:gap-4">
                <Image src="/images/accreditations/dti.webp" alt="DTI 5 Star" width={60} height={60} className="w-10 h-10 md:w-16 md:h-16 object-contain" />
                <div className="text-[10px] md:text-sm uppercase font-bold tracking-tight leading-tight">
                  5 Star Classification<br/><span className="text-gray-400 font-medium">Motor Vehicle and Heavy Equipment</span>
                </div>
              </div>
              <div className="flex items-center gap-3 md:gap-4">
                <Image src="/images/accreditations/bagwis.webp" alt="Bronze Bagwis" width={60} height={60} className="w-10 h-10 md:w-16 md:h-16 object-contain" />
                <div className="text-[10px] md:text-sm uppercase font-bold tracking-tight leading-tight">
                  Bronze Bagwis<br/><span className="text-gray-400 font-medium">Seal of Excellence</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  )
}