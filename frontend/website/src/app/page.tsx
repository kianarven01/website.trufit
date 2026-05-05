import { Metadata } from "next"
import HeroSection from "@/components/home/hero/herosection"
import ServicesSection from "@/components/home/services/servicessection"
import AboutSection from "@/components/home/about/AboutSection"
import ProcessSection from "@/components/home/process/ProcessSection"
import WhyChooseUsSection from "@/components/home/why-choose-us/WhyChooseUsSection"
import HomeCTABlock from "@/components/home/HomeCTABlock"

export const metadata: Metadata = {
  title: "Trufit Auto Center | Quality Automotive Service & Maintenance",
  alternates: {
    canonical: "https://trufitautocenter.com",
  },
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <AboutSection />
      <ProcessSection />
      <WhyChooseUsSection />
      <HomeCTABlock />
    </>
  )
}