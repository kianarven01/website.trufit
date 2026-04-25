// src/app/layout.tsx
import type { Metadata } from "next";
import { Barlow } from "next/font/google";
import Navbar from "@/components/layout/navbar/navbar";
import Footer from "@/components/layout/footer/footer";
import ScrollToTopButton from "@/components/ui/scrolltotopbutton";
import PromoPopup from "@/components/ui/promopopup";
import GlobalModals from "@/components/global/GlobalModals";

import "@/styles/globals.css";

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://trufitautocenter.com"),
  title: {
    default: "Trufit Auto Center | Quality Automotive Service & Maintenance",
    template: "%s | Trufit Auto Center",
  },
  description:
    "Authorized Suzuki Service & Professional Car Care in Daet. Specialized in Oil Change, Wheel Alignment, Battery Replacement, Tune-ups, and repairs for Ford, Toyota, Mitsubishi, and all major brands.",
  keywords: [
    "car service center",
    "auto shop near me",
    "wheel alignment",
    "battery replacement",
    "oil change",
    "engine diagnostics",
    "PMS",
    "Ford repair",
    "Toyota service",
    "Suzuki authorized center",
    "Daet Camarines Norte",
    "transmission repair",
    "exhaust repair",
  ],
  alternates: {
    canonical: "https://trufitautocenter.com",
  },
  openGraph: {
    title: "Trufit Auto Center | Quality Automotive Service",
    description:
      "Expert car care, wheel alignment, and authorized Suzuki service in Daet.",
    url: "https://trufitautocenter.com",
    siteName: "Trufit Auto Center",
    locale: "en_PH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Trufit Auto Center | Quality Automotive Service",
    description: "Professional vehicle diagnostics and repair services.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Google Brawler for hero titles only */}
        <link
          href="https://fonts.googleapis.com/css2?family=Brawler:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "AutoRepair",
              name: "Trufit Auto Center",
              image: "https://trufitautocenter.com/images/logo-dark1.webp",
              "@id": "https://trufitautocenter.com",
              url: "https://trufitautocenter.com",
              telephone: "0918-774-7788",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Daet",
                addressLocality: "Daet",
                addressRegion: "Camarines Norte",
                postalCode: "4600",
                addressCountry: "PH",
              },
              openingHoursSpecification: {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: [
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                ],
                opens: "08:00",
                closes: "17:00",
              },
              makesOffer: [
                {
                  "@type": "Offer",
                  itemOffered: { "@type": "Service", name: "Oil Change" },
                },
                {
                  "@type": "Offer",
                  itemOffered: { "@type": "Service", name: "Wheel Alignment" },
                },
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Service",
                    name: "Battery Replacement",
                  },
                },
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Service",
                    name: "Engine Diagnostics",
                  },
                },
                {
                  "@type": "Offer",
                  itemOffered: { "@type": "Service", name: "Brake Repair" },
                },
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Service",
                    name: "Preventive Maintenance Service (PMS)",
                  },
                },
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Service",
                    name: "Transmission Repair",
                  },
                },
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Service",
                    name: "Ford Repair & Service",
                  },
                },
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Service",
                    name: "Toyota Repair & Service",
                  },
                },
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Service",
                    name: "Mitsubishi Repair & Service",
                  },
                },
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Service",
                    name: "Honda Repair & Service",
                  },
                },
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Service",
                    name: "Isuzu Repair & Service",
                  },
                },
              ],
              areaServed: {
                "@type": "AdministrativeArea",
                name: "Camarines Norte",
              },
            }),
          }}
        />
      </head>
      <body className={`${barlow.className} antialiased`}>
        <Navbar />
        <main>{children}</main>
        <Footer />
        {/* scroll-to-top button */}
        <ScrollToTopButton />
        <GlobalModals />
      </body>
    </html>
  );
}
