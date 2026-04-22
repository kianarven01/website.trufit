import { Metadata } from "next";
import GalleryHero from "@/components/gallery/GalleryHero";
import GalleryGrid from "@/components/gallery/GalleryGrid";
import VideoTour from "@/components/gallery/VideoTour";
import AppointmentModalClient from "@/components/home/appointment/AppointmentModalClient"
import GalleryCTA from "@/components/gallery/GalleryCTA";

export const metadata: Metadata = {
  title: "Gallery | Trufit Auto Center",
  description: "Explore our state-of-the-art service center and the advanced automotive technologies we use to provide dealership-level precision.",
  alternates: {
    canonical: "/gallery",
  },
};

export default function GalleryPage() {
  return (
    <main className="min-h-screen">
      <GalleryHero />
      <VideoTour />
      <GalleryGrid />
      <GalleryCTA />
    </main>
  );
}
