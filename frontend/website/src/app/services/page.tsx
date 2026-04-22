import { Metadata } from "next";
import ServicesHero from "@/components/services/ServicesHero";
import ServiceVideo from "@/components/services/ServiceVideo";
import PMSService from "@/components/services/PMSService";
import GeneralServices from "@/components/services/GeneralServices";
import ServicesCTABlock from "@/components/services/ServicesCTABlock";

export const metadata: Metadata = {
  title: "Authorized Suzuki Service & Professional PMS",
  description:
    "Explore our wide range of automotive services including Suzuki quality service, PMS, engine diagnostics, and specialized repairs for all major brands.",
  alternates: {
    canonical: "https://trufitautocenter.com/services",
  },
};

export default function ServicesPage() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://trufitautocenter.com",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Services",
                item: "https://trufitautocenter.com/services",
              },
            ],
          }),
        }}
      />
      <ServicesHero />
      <ServiceVideo />
      <PMSService />
      <GeneralServices />

      {/* Shared Parallax CTA block for Brands & Appointment */}
      <ServicesCTABlock />
    </main>
  );
}
