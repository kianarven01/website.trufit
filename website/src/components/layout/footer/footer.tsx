// src/components/layout/Footer/Footer.tsx
import Image from "next/image"
import Link from "next/link"
import { Facebook, Phone, Mail, MapPin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-white pt-12 pb-6">
      
      {/* main footer content */}
      <div className="container grid grid-cols-1 md:grid-cols-4 gap-8">

        {/* logo */}
        <div className="flex flex-col items-start">
          <Link href="/">
            <Image
              src="/images/logo-dark1.png"
              alt="TruFit Auto Center"
              width={150}
              height={40}
              priority
            />
          </Link>
          <p className="mt-4 text-gray-400 text-sm">
            Quality auto care inspired by world-class engineering standards. Your vehicle deserves the best.
          </p>

          {/* Contact + Facebook Icon */}
          <div className="mt-4 flex items-center gap-4 text-gray-300">

            <a
              href="tel:+639187747788"
              className="hover:text-red-600 transition"
            >
              <Phone size={25} />
            </a>

            <a
              href="mailto:trufitautocenter@gmail.com"
              className="hover:text-red-600 transition"
            >
              <Mail size={25} />
            </a>

            <a
              href="https://maps.app.goo.gl/aPGe5t9YmpYhqZNQ8"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-red-600 transition"
            >
              <MapPin size={25} />
            </a>

            <a
              href="https://www.facebook.com/ac.trufit"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="hover:text-blue-500 transition"
            >
              <Facebook size={25} />
            </a>

          </div>

        </div>

        {/* Services */}
        <div>
          <h4 className="font-semibold mb-4">Services</h4>
          <ul className="space-y-2 text-gray-300">
            <li><Link href="/" className="hover:text-red-600 transition">Euro Car Specialist</Link></li>
            <li><Link href="/" className="hover:text-red-600 transition">American Car Specialist</Link></li>
            <li><Link href="/" className="hover:text-red-600 transition">Diagnostic of Vehicle Electronics</Link></li>
            <li><Link href="/" className="hover:text-red-600 transition">Maintenance & Inspection</Link></li>
            <li><Link href="/" className="hover:text-red-600 transition">Air Conditioning Services & Repair</Link></li>
            <li><Link href="/" className="hover:text-red-600 transition">Mechanical Repairs</Link></li>
            <li><Link href="/" className="hover:text-red-600 transition">Under Chassis Repairs</Link></li>
            <li><Link href="/" className="hover:text-red-600 transition">Diesel Vehicle Services</Link></li>
            <li><Link href="/" className="hover:text-red-600 transition">Diesel Common Rail Direct Inspection</Link></li>
            <li><Link href="/" className="hover:text-red-600 transition">Interior & Exterior Detailing</Link></li>
            <li><Link href="/" className="hover:text-red-600 transition">Other Allied Services</Link></li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="font-semibold mb-4">Company</h4>
          <ul className="space-y-2 text-gray-300">
            <li><Link href="/about" className="hover:text-red-600 transition">About Us</Link></li>
            <li><Link href="/" className="hover:text-red-600 transition">Our Team</Link></li>
            <li><Link href="/" className="hover:text-red-600 transition">Careers</Link></li>
            <li><Link href="/" className="hover:text-red-600 transition">Testimonials</Link></li>
            <li><Link href="/" className="hover:text-red-600 transition">Blog</Link></li>
          </ul>
        </div>

      </div>

      {/* copyright */}
      <div className="container mt-8">
        {/* extra space above the border line */}
        <div className="mb-6"></div>

        <div className="border-t border-gray-800 pt-4 text-gray-500 text-sm">

          <div className="flex flex-col md:flex-row items-center justify-between gap-2">

            {/* left: copyright */}
            <div className="text-left md:text-left">
              © {new Date().getFullYear()} TRUFIT Auto Center. All rights reserved.
            </div>

            {/* mobile divider */}
            <div className="block md:hidden w-full border-t border-gray-700 my-2"></div>

            {/* center: verse */}
            <p className="text-gray-400 text-sm text-center md:text-center flex-1 mx-4 max-w-md">
              {/* mobile: single line */}
              <span className="md:hidden">
                For from him and through him and for him are all things. To him be the glory forever! Amen. (Rom. 11:36)
              </span>
              {/* desktop: two lines */}
              <span className="hidden md:inline">
                For from him and through him and for him are all things.<br />
                To him be the glory forever! Amen. (Rom. 11:36)
              </span>
            </p>

            {/* mobile divider */}
            <div className="block md:hidden w-full border-t border-gray-700 my-2"></div>

            {/* right: privacy + terms */}
            <div className="flex gap-4 text-right md:text-right">
              <Link href="/" className="hover:text-red-600 transition">Privacy Policy</Link>
              <Link href="/" className="hover:text-red-600 transition">Terms of Service</Link>
            </div>

          </div>

        </div>
      </div>

    </footer>
  )
}