import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | Trufit Auto Center",
  description: "Terms of Service and conditions for using the Trufit Auto Center website and services.",
};

export default function TermsOfService() {
  return (
    <div className="bg-brand-dark min-h-screen pt-[160px] md:pt-[200px] pb-24 -mt-[112px] md:-mt-[120px]">
      <div className="max-w-4xl mx-auto px-6 sm:px-10 lg:px-16">
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-[2px] w-8 bg-brand-red" />
            <span className="text-xs font-semibold tracking-[0.3em] uppercase text-brand-red">
              Legal
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight uppercase">
            Terms of <span className="text-brand-red">Service</span>
          </h1>
          <p className="text-gray-400 text-sm">Last Updated: April 2026</p>
        </div>

        <div className="space-y-8 text-gray-300 font-light leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-tight">1. Acceptance of Terms</h2>
            <p>
              By accessing and using the Trufit Auto Center website ("Service"), you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services. Any participation in this service will constitute acceptance of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-tight">2. Service Appointments & Estimates</h2>
            <p className="mb-4">
              All appointments booked through our website are subject to confirmation by our staff. While we strive to honor all requested times, actual availability may vary. 
            </p>
            <p>
              Any estimates provided online or over the phone are preliminary and subject to change based on a physical inspection of the vehicle by our certified technicians. Final pricing will be provided before any repair work commences.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-tight">3. Warranty on Repairs</h2>
            <p>
              Trufit Auto Center offers warranties on specific parts and labor as dictated by the manufacturer and our internal policies. These warranties do not cover damage resulting from misuse, accidents, or subsequent modifications. Specific warranty terms will be provided on your final invoice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-tight">4. Intellectual Property</h2>
            <p>
              The site and its original content, features, and functionality are owned by Trufit Auto Center and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-tight">5. Limitation of Liability</h2>
            <p>
              Trufit Auto Center shall not be liable for any special or consequential damages that result from the use of, or the inability to use, the materials on this site or the performance of the products, even if Trufit Auto Center has been advised of the possibility of such damages.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-tight">6. Changes to Terms</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. What constitutes a material change will be determined at our sole discretion. We will notify you of any changes by posting the new Terms on this site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-tight">7. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Phone: 0918-774-7788</li>
              <li>Email: trufitautocenter@gmail.com</li>
              <li>Address: 1042 Brgy. Gahonon, Vinzons Ave, Daet, Camarines Norte, Philippines</li>
            </ul>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10">
          <Link href="/" className="text-brand-red hover:text-red-400 font-semibold uppercase tracking-wider text-sm transition-colors">
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
