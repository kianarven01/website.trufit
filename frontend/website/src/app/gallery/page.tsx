import { Metadata } from "next";
import GalleryHero from "@/components/gallery/GalleryHero";
import GalleryGrid from "@/components/gallery/GalleryGrid";
import VideoTour from "@/components/gallery/VideoTour";

export const metadata: Metadata = {
  title: "Gallery | Trufit Auto Center",
  description: "Explore our state-of-the-art service center and the advanced automotive technologies we use to provide dealership-level precision.",
};

export default function GalleryPage() {
  return (
    <main className="min-h-screen">
      <GalleryHero />
      <VideoTour />
      <GalleryGrid />
      
      {/* Call to Action Section */}
      <section className="bg-brand-dark py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(227,27,35,0.2),transparent_70%)]" />
        </div>
        
        <div className="max-w-[1820px] mx-auto px-6 sm:px-10 lg:px-16 text-center relative z-10">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-8 font-brawler uppercase tracking-tight italic">Ready to see the <br /> <span className="text-brand-red">Trufit difference?</span></h2>
            <p className="text-white/60 mb-12 max-w-2xl mx-auto font-medium">Experience professional-grade automotive care with the technologies you've seen here. Book your appointment today.</p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <a 
                href="/#appointment"
                className="bg-brand-red text-white px-12 py-5 rounded-sm font-black hover:bg-white hover:text-brand-dark transition-all uppercase tracking-[0.2em] text-xs shadow-xl shadow-brand-red/20"
              >
                Book Appointment
              </a>
               <a 
                href="/contact"
                className="border-2 border-white/20 text-white px-12 py-5 rounded-sm font-black hover:bg-white hover:text-brand-dark transition-all uppercase tracking-[0.2em] text-xs"
              >
                Contact Us
              </a>
            </div>
        </div>
      </section>
    </main>
  );
}
