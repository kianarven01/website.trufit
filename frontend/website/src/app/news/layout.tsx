import { Metadata } from "next";

export const metadata: Metadata = {
  title: "News and Articles",
  description: "Stay updated with the latest news, automotive tips, and articles from Trufit Auto Center.",
  alternates: {
    canonical: "https://trufitautocenter.com/news",
  },
};

export default function NewsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
