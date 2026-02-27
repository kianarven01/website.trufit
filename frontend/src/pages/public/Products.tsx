import React from "react";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import Navbar from "@/components/ui/site-navbar";
import Footer from "@/components/ui/site-footer";

const Products: React.FC = () => {
  useDocumentTitle("Our Products");

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
        <div className="pt-48 md:pt-56 container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Our Products</h1>
          <ul className="list-disc list-inside space-y-2 text-lg">
            <li>Engine Oils & Lubricants</li>
            <li>Brake Pads & Rotors</li>
            <li>Batteries & Chargers</li>
            <li>Tires & Wheels</li>
            <li>Car Accessories & Tools</li>
          </ul>
        </div>
      <Footer />
    </main>
  );
};

export default Products;