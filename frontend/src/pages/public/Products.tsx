// products.tsx
import React from "react";
import useDocumentTitle from "@/hooks/useDocumentTitle";

const Products: React.FC = () => {
  useDocumentTitle("Our Products");
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">Our Products</h1>
      <p className="text-lg mb-6">
        We offer high-quality automotive products to enhance your vehicle’s performance and longevity. Explore our range of trusted brands and accessories.
      </p>
      <ul className="list-disc list-inside space-y-2 text-lg">
        <li>Engine Oils & Lubricants</li>
        <li>Brake Pads & Rotors</li>
        <li>Batteries & Chargers</li>
        <li>Tires & Wheels</li>
        <li>Car Accessories & Tools</li>
      </ul>
    </main>
  );
};

export default Products;