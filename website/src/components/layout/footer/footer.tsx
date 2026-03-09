// src/components/layout/Footer/Footer.tsx
import Image from "next/image"
import Link from "next/link"
import { FaFacebookF, FaInstagram, FaLinkedinIn } from "react-icons/fa"

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-6">
      
      {/* main footer content */}
      <div className="container grid grid-cols-1 md:grid-cols-4 gap-8">

        {/* logo */}
        <div className="flex flex-col items-start">
          <Link href="/">
            <Image
              src="/images/logo-white.png"
              alt="TruFit Auto Center"
              width={150}
              height={40}
              priority
            />
          </Link>
          <p className="mt-4 text-gray-400 text-sm">
            Professional vehicle diagnostics and repair services.
          </p>
        </div>

        {/* quick links */}
        <div>
          <h4 className="font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-gray-300">
            <li><Link href="/">Home</Link></li>
            <li><Link href="/services">Services</Link></li>
            <li><Link href="/news">News</Link></li>
            <li><Link href="/about">About</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </div>

        {/* contact info */}
        <div>
          <h4 className="font-semibold mb-4">Contact Info</h4>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li>📍 123 Main St, Quezon City, PH</li>
            <li>📞 +63 912 345 6789</li>
            <li>✉ info@trufitautocenter.com</li>
          </ul>
        </div>

        {/* social media */}
        <div>
          <h4 className="font-semibold mb-4">Follow Us</h4>
          <div className="flex gap-4">
            <Link href="https://facebook.com/trufitautocenter" target="_blank" aria-label="Facebook">
              <FaFacebookF className="hover:text-blue-500" />
            </Link>
            <Link href="https://instagram.com/trufitautocenter" target="_blank" aria-label="Instagram">
              <FaInstagram className="hover:text-pink-500" />
            </Link>
            <Link href="https://linkedin.com/company/trufitautocenter" target="_blank" aria-label="LinkedIn">
              <FaLinkedinIn className="hover:text-blue-700" />
            </Link>
          </div>
        </div>

      </div>

      {/* copyright */}
      <div className="container border-t border-gray-800 mt-8 pt-4 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} TruFit Auto Center. All rights reserved.
      </div>

    </footer>
  )
}