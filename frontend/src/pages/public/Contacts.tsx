// contacts.tsx
import React from "react";
import useDocumentTitle from "@/hooks/useDocumentTitle";

const Contacts: React.FC = () => {
  useDocumentTitle("Contact Us");
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
      <p className="text-lg mb-6">
        Have questions or need support? Reach out to us via phone, email, or visit our location. We are here to assist you with anything you need for your vehicle.
      </p>
      <ul className="text-lg space-y-2">
        <li>📞 Phone: +63 912 345 6789</li>
        <li>✉️ Email: support@trufit.com</li>
        <li>📍 Address: 123 Auto Street, Quezon City, Philippines</li>
      </ul>
    </main>
  );
};

export default Contacts;