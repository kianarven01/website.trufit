// services.tsx
import React from "react";
import useDocumentTitle from "@/hooks/useDocumentTitle";

const Services: React.FC = () => {
  useDocumentTitle("Our Services");
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">Our Services</h1>
      <p className="text-lg mb-6">
        We provide a wide range of automotive services to keep your vehicle in perfect condition. Our skilled team ensures every job is done with precision and care.
      </p>
      <ul className="list-disc list-inside space-y-2 text-lg">
        <li>Engine Repair & Maintenance</li>
        <li>Brake System Check & Replacement</li>
        <li>Transmission Service</li>
        <li>Battery & Electrical System Care</li>
        <li>Car Detailing & Cleaning</li>
      </ul>
    </main>
  );
};

export default Services;