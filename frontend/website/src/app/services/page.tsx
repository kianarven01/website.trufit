import { Metadata } from "next";
import ServicesHero from "@/components/services/ServicesHero";
import ServiceVideo from "@/components/services/ServiceVideo";
import PMSService from "@/components/services/PMSService";
import GeneralServices from "@/components/services/GeneralServices";
import VehicleBrands from "@/components/services/VehicleBrands";
import AppointmentSection from "@/components/home/appointment/appointment";

export const metadata: Metadata = {
  title: "Professional Services | Trufit Auto Center",
  description: "Explore our wide range of automotive services including Suzuki authorized care, PMS, engine diagnostics, and specialized repairs for all major brands.",
};

export default function ServicesPage() {
  return (
    <main>
      <ServicesHero />
      <ServiceVideo />
      <PMSService />
      <GeneralServices />
      <VehicleBrands />
      
      {/* Reusing existing Appointment section for CTA */}
      <AppointmentSection />
    </main>
  );
}
