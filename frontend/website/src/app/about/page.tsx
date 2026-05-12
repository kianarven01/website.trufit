import type { Metadata } from "next";
import AboutPage from "@/components/about/AboutPage";

export const metadata: Metadata = {
  title: "Our Story & Commitment to Excellence",
  description:
    "Learn about Trufit Auto Center — our story, our mission, triathlon participation, and what drives our commitment to quality automotive service.",
  alternates: {
    canonical: "https://trufitautocenter.com/about",
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
