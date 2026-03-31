"use client";

import ContactHero from "./ContactHero";
import LocationSection from "./LocationSection";
import FAQSection from "./FAQSection";
import ContactCTA from "./ContactCTA";

import "./contact.css";

export default function ContactPage() {
  return (
    <div id="contact-page">
      <ContactHero />
      <LocationSection />
      <FAQSection />
      <ContactCTA />
    </div>
  );
}
