import { Metadata } from "next";
import GalleryHero from "@/components/gallery/GalleryHero";
import GalleryGrid from "@/components/gallery/GalleryGrid";
import VideoTour from "@/components/gallery/VideoTour";
import AppointmentModalClient from "@/components/home/appointment/AppointmentModalClient"
import GalleryCTA from "@/components/gallery/GalleryCTA";

export const metadata: Metadata = {
  title: "Inside Our Service Center",
  description: "Explore our state-of-the-art service center and the advanced automotive technologies we use to provide dealership-level precision.",
  alternates: {
    canonical: "https://trufitautocenter.com/gallery",
  },
};

export default function GalleryPage() {
  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://trufitautocenter.com"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Gallery",
                "item": "https://trufitautocenter.com/gallery"
              }
            ]
          })
        }}
      />
      <GalleryHero />
      <VideoTour />
      <GalleryGrid />
      <GalleryCTA />
    </main>
  );
}
