import { Metadata } from "next";
import ServicesHero from "@/components/services/ServicesHero";
import ServiceVideo from "@/components/services/ServiceVideo";
import PMSService from "@/components/services/PMSService";
import GeneralServices from "@/components/services/GeneralServices";
import ServicesCTABlock from "@/components/services/ServicesCTABlock";

export const metadata: Metadata = {
  title: "Services | Trufit Auto Center",
  description: "Explore our wide range of automotive services including Suzuki authorized care, PMS, engine diagnostics, and specialized repairs for all major brands.",
};

export default function ServicesPage() {
  return (
    <main>
      <ServicesHero />
      <ServiceVideo />
      <PMSService />
      <GeneralServices />
      
      {/* Shared Parallax CTA block for Brands & Appointment */}
      <ServicesCTABlock />
    </main>
  );
}
