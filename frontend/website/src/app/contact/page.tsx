import type { Metadata } from "next";
import ContactPage from "@/components/contact/ContactPage";

export const metadata: Metadata = {
  title: "Contact Us | Trufit Auto Center",
  description:
    "Get in touch with Trufit Auto Center. Send us a message, visit our shop in Daet, Camarines Norte, or call us for service inquiries and appointments.",
  alternates: {
    canonical: "/contact",
  },
};

export default function Contact() {
  return <ContactPage />;
}
