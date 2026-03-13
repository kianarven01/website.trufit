import React from "react";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import Navbar from "@/components/ui/site-navbar";
import Footer from "@/components/ui/site-footer";

const Contacts: React.FC = () => {
  useDocumentTitle("Contact Us");

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
        <div className="pt-48 md:pt-56 container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-lg mb-6">
            Have questions or need support? Reach out to us...
          </p>
          <ul className="text-lg space-y-2">
            <li>📞 Phone: +63 912 345 6789</li>
            <li>✉️ Email: support@trufit.com</li>
            <li>📍 Address: 123 Auto Street, Quezon City, Philippines</li>
          </ul>
        </div>
      <Footer />
    </main>
  );
};

export default Contacts;