import type { Metadata } from "next";
import ContactPage from "@/components/contact/ContactPage";

export const metadata: Metadata = {
  title: "Get in Touch & Schedule Your Service",
  description:
    "Get in touch with Trufit Auto Center. Send us a message, visit our shop in Daet, Camarines Norte, or call us for service inquiries and appointments.",
  alternates: {
    canonical: "https://trufitautocenter.com/contact",
  },
  openGraph: {
    title: "Get in Touch & Schedule Your Service",
    description:
      "Contact Trufit Auto Center for professional automotive service in Daet, Camarines Norte.",
    url: "https://trufitautocenter.com/contact",
    siteName: "Trufit Auto Center",
    type: "website",
    locale: "en_PH",
    images: [
      {
        url: "https://trufitautocenter.com/images/contact-og.jpg",
        width: 1200,
        height: 630,
        alt: "Trufit Auto Center Contact Page",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Get in Touch & Schedule Your Service",
    description:
      "Contact Trufit Auto Center for service inquiries and appointments.",
    images: ["https://trufitautocenter.com/images/contact-og.jpg"],
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
