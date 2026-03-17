import AppointmentSection from "@/components/home/appointment/appointment"
import HeroSection from "@/components/home/hero/herosection"
import ServicesSection from "@/components/home/services/servicessection"
import AboutSection from "@/components/home/about/AboutSection"
import ProcessSection from "@/components/home/process/ProcessSection"
import WhyChooseUsSection from "@/components/home/why-choose-us/WhyChooseUsSection"

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <AboutSection />
      <ProcessSection />
      <WhyChooseUsSection />
      <AppointmentSection />
    </>
  )
}