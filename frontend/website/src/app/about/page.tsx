import type { Metadata } from "next";
import AboutPage from "@/components/about/AboutPage";

export const metadata: Metadata = {
  title: "About Us | Trufit Auto Center",
  description:
    "Learn about Trufit Auto Center — our story, our mission, disaster relief efforts, triathlon participation, and what drives our commitment to quality automotive service.",
  alternates: {
    canonical: "/about",
  },
};

export default function About() {
  return <AboutPage />;
}
