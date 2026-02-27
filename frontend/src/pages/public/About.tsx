import React from "react";
import useDocumentTitle from "@/hooks/useDocumentTitle";

const About: React.FC = () => {
  useDocumentTitle("About Us");
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">About Us</h1>
      <p className="text-lg mb-6">
        Welcome to Trufit, your trusted partner in automotive care. We are dedicated to providing top-notch services to keep your vehicle running smoothly and efficiently. With years of experience in the industry, our team of skilled technicians is committed to delivering exceptional service and customer satisfaction.
      </p>
    </main>
  );
};

export default About;