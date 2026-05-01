import { Metadata } from "next";

export const metadata: Metadata = {
  title: "News and Articles",
  description: "Stay updated with the latest news, automotive tips, and articles from Trufit Auto Center.",
  alternates: {
    canonical: "https://trufitautocenter.com/news",
  },
  openGraph: {
    title: "News and Articles",
    description:
      "Stay updated with the latest news, automotive tips, and articles from Trufit Auto Center.",
    url: "https://trufitautocenter.com/news",
    siteName: "Trufit Auto Center",
    type: "website",
    locale: "en_PH",
    images: [
      {
        url: "https://trufitautocenter.com/images/news-og.jpg",
        width: 1200,
        height: 630,
        alt: "Trufit Auto Center News",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "News and Articles",
    description:
      "Stay updated with the latest news, automotive tips, and articles from Trufit Auto Center.",
    images: ["https://trufitautocenter.com/images/news-og.jpg"],
  },
};

export default function NewsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
