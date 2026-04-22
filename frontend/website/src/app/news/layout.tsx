import { Metadata } from "next";

export const metadata: Metadata = {
  title: "News & Articles | Trufit Auto Center",
  description: "Stay updated with the latest news, automotive tips, and articles from Trufit Auto Center.",
  alternates: {
    canonical: "/news",
  },
};

export default function NewsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
