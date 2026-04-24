import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Trufit Auto Center",
  description: "Privacy Policy detailing how Trufit Auto Center collects, uses, and protects your personal information.",
};

export default function PrivacyPolicy() {
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
            Privacy <span className="text-brand-red">Policy</span>
          </h1>
          <p className="text-gray-400 text-sm">Last Updated: April 2026</p>
        </div>

        <div className="space-y-8 text-gray-300 font-light leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-tight">1. Information We Collect</h2>
            <p className="mb-4">
              At Trufit Auto Center, we collect information that you provide directly to us when you use our website, such as when you:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Book a service appointment</li>
              <li>Fill out our contact or feedback forms</li>
              <li>Subscribe to our newsletters or promotions</li>
              <li>Communicate with us directly via phone or email</li>
            </ul>
            <p className="mt-4">
              This information may include your name, email address, phone number, vehicle information (Make, Model, Year), and any other information you choose to provide.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-tight">2. How We Use Your Information</h2>
            <p className="mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Process and confirm your service appointments</li>
              <li>Communicate with you regarding your vehicle, inquiries, or feedback</li>
              <li>Improve our website, customer service, and overall user experience</li>
              <li>Send promotional emails and updates (only if you have opted in)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-tight">3. Protection of Your Data</h2>
            <p>
              We implement a variety of security measures to maintain the safety of your personal information. Your personal data is contained behind secured networks and is only accessible by a limited number of persons who have special access rights to such systems, and are required to keep the information confidential. We do not sell, trade, or otherwise transfer to outside parties your personally identifiable information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-tight">4. Third-Party Links</h2>
            <p>
              Occasionally, at our discretion, we may include or offer third-party products or services on our website. These third-party sites have separate and independent privacy policies. We therefore have no responsibility or liability for the content and activities of these linked sites.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-tight">5. Cookies</h2>
            <p>
              Our website may use "cookies" to enhance user experience. Your web browser places cookies on your hard drive for record-keeping purposes and sometimes to track information about you. You may choose to set your web browser to refuse cookies, or to alert you when cookies are being sent. If you do so, note that some parts of the site may not function properly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-tight">6. Your Consent</h2>
            <p>
              By using our site, you consent to our website's privacy policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-tight">7. Contacting Us</h2>
            <p>
              If there are any questions regarding this privacy policy, you may contact us using the information below:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Phone: 0918-774-7788</li>
              <li>Email: trufitautocenter@gmail.com</li>
              <li>Address: P1, Brgy. Gahonon, Daet, Camarines Norte</li>
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
