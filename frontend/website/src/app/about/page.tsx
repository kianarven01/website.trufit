import type { Metadata } from "next";
import AboutPage from "@/components/about/AboutPage";

export const metadata: Metadata = {
  title: "Our Story & Commitment to Excellence",
  description:
    "Learn about Trufit Auto Center — our story, our mission, triathlon participation, and what drives our commitment to quality automotive service.",
  alternates: {
    canonical: "https://trufitautocenter.com/about",
  },
  openGraph: {
    title: "Our Story & Commitment to Excellence",
    description:
      "Learn about Trufit Auto Center — our story, our mission, and commitment to quality automotive service.",
    url: "https://trufitautocenter.com/about",
    siteName: "Trufit Auto Center",
    type: "website",
    locale: "en_PH",
    images: [
      {
        url: "https://trufitautocenter.com/images/about-og.jpg",
        width: 1200,
        height: 630,
        alt: "Trufit Auto Center About Page",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Our Story & Commitment to Excellence",
    description:
      "Learn about Trufit Auto Center and our commitment to automotive excellence.",
    images: ["https://trufitautocenter.com/images/about-og.jpg"],
  },
};

export default function About() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://trufitautocenter.com",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "About",
                item: "https://trufitautocenter.com/about",
              },
            ],
          }),
        }}
      />
      <AboutPage />
    </>
  );
}
