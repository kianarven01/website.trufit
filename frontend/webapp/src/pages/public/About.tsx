import React from "react";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import Navbar from "@/components/ui/site-navbar";
import Footer from "@/components/ui/site-footer";

const About: React.FC = () => {
  useDocumentTitle("About Us");

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
        <div className="pt-48 md:pt-56 container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">About Us</h1>
          <p className="text-lg mb-6">
            Welcome to Trufit, your trusted partner in automotive care...
          </p>
        </div>
      <Footer />
    </main>
  );
};

export default About;