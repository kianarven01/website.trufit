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
            <Link href="/" className="text-gray-400 hover:text-white transition-all hover:scale-110">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </Link>
            <Link href="/" className="text-gray-400 hover:text-white transition-all hover:scale-110">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.332 3.608 1.308.975.975 1.246 2.242 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.332 2.633-1.308 3.608-.975.975-2.242 1.246-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.332-3.608-1.308-.975-.975-1.246-2.242-1.308-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.332-2.633 1.308-3.608.975-.975 2.242-1.246 3.608-1.308 1.266-.058 1.646-.07 4.85-.07zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12s.014 3.667.072 4.947c.2 4.352 2.613 6.766 6.96 6.966 1.28.058 1.688.072 4.947.072s3.667-.014 4.947-.072c4.351-.2 6.766-2.613 6.966-6.966.058-1.28.072-1.688.072-4.947s-.014-3.667-.072-4.947c-.2-4.352-2.613-6.766-6.966-6.966C15.667.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </Link>
            <Link href="/" className="text-gray-400 hover:text-white transition-all hover:scale-110">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.872.505 9.377.505 9.377.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </Link>
            <Link href="/" className="text-gray-400 hover:text-white transition-all hover:scale-110">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
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