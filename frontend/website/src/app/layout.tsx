// src/app/layout.tsx
import type { Metadata } from "next"
import { Barlow } from "next/font/google"
import Navbar from "@/components/layout/navbar/navbar"
import Footer from "@/components/layout/footer/footer"
import ScrollToTopButton from "@/components/ui/scrolltotopbutton"
import PromoPopup from "@/components/ui/promopopup"
import GlobalModals from "@/components/global/GlobalModals"

import "@/styles/globals.css"

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
})

export const metadata: Metadata = {
  title: "Trufit Auto Center",
  description: "Professional vehicle diagnostics and repair services.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Google Brawler for hero titles only */}
        <link
          href="https://fonts.googleapis.com/css2?family=Brawler:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${barlow.className} antialiased`}>
        <Navbar />
        <main>{children}</main>
        <Footer />

        {/* scroll-to-top button */}
        <ScrollToTopButton />

        <PromoPopup/>
        <GlobalModals />
      </body>
    </html>
  )
}