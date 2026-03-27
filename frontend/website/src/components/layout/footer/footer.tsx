// src/components/layout/Footer/Footer.tsx
import Image from "next/image"
import Link from "next/link"


export default function Footer() {
  return (
    <footer className="bg-gray-950 text-white pt-16 pb-8">
      
      {/* main footer content */}
      <div className="max-w-[1820px] mx-auto px-6 sm:px-10 lg:px-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">

        {/* logo */}
        <div className="flex flex-col items-start lg:pr-8">
          <Link href="/">
            <Image
              src="/images/logo-dark1.png"
              alt="TruFit Auto Center"
              width={180}
              height={48}
              priority
              className="w-[150px] md:w-[180px]"
            />
          </Link>
          <p className="mt-8 text-gray-400 text-sm leading-relaxed">
            Quality auto care inspired by world-class engineering standards. Your vehicle deserves the best.
          </p>

          {/* Social Icons */}
          <div className="mt-10 flex items-center gap-6">
          {/* Facebook */}
          <Link 
            href="https://www.facebook.com/ac.trufit" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-all hover:scale-110"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </Link>
        </div>

        </div>

        {/* Services */}
        <div className="lg:pl-8">
          <h4 className="font-bold mb-6 text-lg tracking-tight uppercase">Services</h4>
          <ul className="space-y-3 text-gray-400 text-sm">
            <li><Link href="/" className="hover:text-brand-red transition-colors">Euro Car Specialist</Link></li>
            <li><Link href="/" className="hover:text-brand-red transition-colors">American Car Specialist</Link></li>
            <li><Link href="/" className="hover:text-brand-red transition-colors">Diagnostic of Vehicle Electronics</Link></li>
            <li><Link href="/" className="hover:text-brand-red transition-colors">Maintenance & Inspection</Link></li>
            <li><Link href="/" className="hover:text-brand-red transition-colors">Air Conditioning Services & Repair</Link></li>
            <li><Link href="/" className="hover:text-brand-red transition-colors">Mechanical Repairs</Link></li>
            <li><Link href="/" className="hover:text-brand-red transition-colors">Under Chassis Repairs</Link></li>
            <li><Link href="/" className="hover:text-brand-red transition-colors">Diesel Vehicle Services</Link></li>
            <li><Link href="/" className="hover:text-brand-red transition-colors">Diesel Common Rail Direct Inspection</Link></li>
            <li><Link href="/" className="hover:text-brand-red transition-colors">Interior & Exterior Detailing</Link></li>
            <li><Link href="/" className="hover:text-brand-red transition-colors">Other Allied Services</Link></li>
          </ul>
        </div>

        {/* Company */}
        <div className="lg:pl-8">
          <h4 className="font-bold mb-6 text-lg tracking-tight uppercase">Company</h4>
          <ul className="space-y-3 text-gray-400 text-sm">
            <li><Link href="/about" className="hover:text-brand-red transition-colors">About Us</Link></li>
            <li><Link href="/" className="hover:text-brand-red transition-colors">Our Team</Link></li>
            <li><Link href="/" className="hover:text-brand-red transition-colors">Careers</Link></li>
            <li><Link href="/" className="hover:text-brand-red transition-colors">Testimonials</Link></li>
            <li><Link href="/" className="hover:text-brand-red transition-colors">Blog</Link></li>
          </ul>
        </div>

        {/* FAQ */}
        <div className="lg:pl-8">
          <h4 className="font-bold mb-6 text-lg tracking-tight uppercase">FAQ</h4>
          <ul className="space-y-4 text-gray-400 text-sm">
            <li>
              <p className="text-white font-medium mb-1">Do I need an appointment?</p>
              <p className="text-xs leading-relaxed text-gray-500 italic">
                Walk-ins are welcome, but appointments are preferred for faster service.
              </p>
            </li>
            <li>
              <p className="text-white font-medium mb-1">How long for a diagnostic?</p>
              <p className="text-xs leading-relaxed text-gray-500 italic">
                A comprehensive electronic scan typically takes 30-60 minutes.
              </p>
            </li>
            <li>
              <p className="text-white font-medium mb-1">Do you service all brands?</p>
              <p className="text-xs leading-relaxed text-gray-500 italic">
                We specialize in European, American, and Asian vehicle standards.
              </p>
            </li>
            <li>
              <p className="text-white font-medium mb-1">What is your warranty?</p>
              <p className="text-xs leading-relaxed text-gray-500 italic">
                We provide a standard warranty on all certified parts and labor.
              </p>
            </li>
          </ul>
        </div>

      </div>

      {/* copyright */}
      <div className="max-w-[1820px] mx-auto px-6 sm:px-10 lg:px-16 mt-12">
        <div className="border-t border-gray-800 pt-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* left: copyright */}
            <div className="text-gray-500 text-xs">
              © {new Date().getFullYear()} Trufit Auto Center. All rights reserved.
            </div>

            {/* center: verse */}
            <p className="text-gray-600 text-xs text-center italic max-w-lg">
              For from him and through him and for him are all things. To him be the glory forever! Amen. (Rom. 11:36)
            </p>

            {/* right: links */}
            <div className="flex gap-8 text-gray-600 text-xs font-medium">
              <Link href="/" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>

        </div>
      </div>

    </footer>
  )
}