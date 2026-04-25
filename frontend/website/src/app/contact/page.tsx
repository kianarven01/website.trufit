import type { Metadata } from "next";
import ContactPage from "@/components/contact/ContactPage";

export const metadata: Metadata = {
  title: "Get in Touch & Schedule Your Service",
  description:
    "Get in touch with Trufit Auto Center. Send us a message, visit our shop in Daet, Camarines Norte, or call us for service inquiries and appointments.",
  alternates: {
    canonical: "https://trufitautocenter.com/contact",
  },
};

export default function Contact() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://trufitautocenter.com"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Contact",
                "item": "https://trufitautocenter.com/contact"
              }
            ]
          })
        }}
      />
      <ContactPage />
    </>
  );
}
