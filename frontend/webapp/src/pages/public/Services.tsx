import React from "react";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import Navbar from "@/components/ui/site-navbar";
import Footer from "@/components/ui/site-footer";

const Services: React.FC = () => {
  useDocumentTitle("Our Services");

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
        <div className="pt-48 md:pt-56 container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Our Services</h1>
          <ul className="list-disc list-inside space-y-2 text-lg">
            <li>Engine Diagnostics</li>
            <li>Brake Inspection & Repair</li>
            <li>Battery Testing & Replacement</li>
            <li>Oil Change & Maintenance</li>
            <li>Tire Installation & Alignment</li>
          </ul>
        </div>
      <Footer />
    </main>
  );
};

export default Services;