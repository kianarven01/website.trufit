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

          {/* Contact Details */}
          <div className="mt-8 space-y-4 text-gray-400 text-sm">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-brand-red shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>P1, Brgy. Gahonon, Daet, <br />Camarines Norte, Philippines</span>
            </div>
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-brand-red shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <a href="tel:09187747788" className="hover:text-white transition-colors">0918-774-7788</a>
            </div>
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-brand-red shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <a href="mailto:trufitautocenter@gmail.com" className="hover:text-white transition-colors whitespace-nowrap">trufitautocenter@gmail.com</a>
            </div>
          </div>

          {/* Social Icons */}
          <div className="mt-8 flex items-center gap-6">
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

        <div className="lg:pl-8">
          <h4 className="font-bold mb-6 text-lg tracking-tight uppercase">Services</h4>
          <ul className="space-y-3 text-gray-400 text-sm">
            <li><Link href="/services" className="hover:text-brand-red transition-colors">Euro Car Specialist</Link></li>
            <li><Link href="/services" className="hover:text-brand-red transition-colors">American Car Specialist</Link></li>
            <li><Link href="/services" className="hover:text-brand-red transition-colors">Diagnostic of Vehicle Electronics</Link></li>
            <li><Link href="/services" className="hover:text-brand-red transition-colors">Maintenance & Inspection</Link></li>
            <li><Link href="/services" className="hover:text-brand-red transition-colors">Air Conditioning Services & Repair</Link></li>
            <li><Link href="/services" className="hover:text-brand-red transition-colors">Mechanical Repairs</Link></li>
            <li><Link href="/services" className="hover:text-brand-red transition-colors">Under Chassis Repairs</Link></li>
            <li><Link href="/services" className="hover:text-brand-red transition-colors">Diesel Vehicle Services</Link></li>
            <li><Link href="/services" className="hover:text-brand-red transition-colors">Diesel Common Rail Direct Inspection</Link></li>
            <li><Link href="/services" className="hover:text-brand-red transition-colors">Interior & Exterior Detailing</Link></li>
            <li><Link href="/services" className="hover:text-brand-red transition-colors">Other Allied Services</Link></li>
          </ul>
        </div>

        {/* Company */}
        <div className="lg:pl-8">
          <h4 className="font-bold mb-6 text-lg tracking-tight uppercase">Quick Links</h4>
          <ul className="space-y-3 text-gray-400 text-sm">
            <li><Link href="/" className="hover:text-brand-red transition-colors">Home</Link></li>
            <li><Link href="/services" className="hover:text-brand-red transition-colors">Services</Link></li>
            <li><Link href="/gallery" className="hover:text-brand-red transition-colors">Gallery</Link></li>
            
            <li><Link href="/about" className="hover:text-brand-red transition-colors">About Us</Link></li>
            <li><Link href="/contact" className="hover:text-brand-red transition-colors">Contact Us</Link></li>
          </ul>
        </div>

        {/* FAQ */}
        <div className="lg:pl-8">
          <h4 className="font-bold mb-6 text-lg tracking-tight uppercase">FAQ</h4>
          <ul className="space-y-4 text-gray-400 text-sm">
            <li>
              <p className="text-white font-medium mb-1">Do I need an appointment?</p>
              <p className="text-xs leading-relaxed text-gray-500 italic">
                Walk-ins are welcome, but scheduling ensures dedicated time for your vehicle.
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
              <p className="text-white font-medium mb-1">Brake service indicators?</p>
              <p className="text-xs leading-relaxed text-gray-500 italic">
                Squeaking, grinding, or a soft pedal indicate your brakes need urgent inspection.
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