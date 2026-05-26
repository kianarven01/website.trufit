import type { Metadata } from "next";
import { Barlow } from "next/font/google";
import "./globals.css";

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-barlow",
});

export const metadata: Metadata = {
  title: "Join Our Team - Trufit Auto Center",
  description:
    "Join the Trufit Auto Center family. Explore our available positions and start your career with us.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Brawler:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${barlow.variable} antialiased`}>
       
        <nav className="w-full bg-white border-b border-gray-200 px-6 py-3 md:py-4 relative z-50">
          <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center">
              <img
                src="/images/navbar/logo.webp"
                alt="Trufit Logo"
                className="h-10 md:h-12 object-contain"
              />
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-600 font-medium">
              <a href="mailto:trufitautocenterdaet@gmail.com" className="hidden md:flex items-center gap-2 hover:text-brand-red transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <span>trufitautocenterdaet@gmail.com</span>
              </a>
              <a href="tel:09187747788" className="hidden md:flex items-center gap-2 hover:text-brand-red transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span>0918-774-7788</span>
              </a>

              <div className="flex items-center gap-4">
                <a
                  href="https://trufitautocenter.com"
                  className="bg-brand-red text-white px-6 py-2.5 rounded text-xs font-bold uppercase tracking-wider hover:bg-red-700 transition-colors"
                >
                  Visit Website
                </a>
              </div>
            </div>
          </div>
        </nav>
        <main>{children}</main>
        {/* Simple Footer */}
        <footer className="bg-brand-gray py-12 border-t border-white/10">
          <div className="container mx-auto text-center text-gray-400 text-sm">
            <p>
              &copy; {new Date().getFullYear()} Trufit Auto Center. All rights
              reserved.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
