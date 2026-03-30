"use client";

import { useRef, useState } from "react";
import { ChevronDown, Mail, Send } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

const faqData = [
  {
    question: "How often should I get my oil changed?",
    answer:
      "For most modern vehicles, we recommend an oil change every 5,000 to 7,500 kilometers, or every 6 months — whichever comes first. However, this can vary depending on your driving habits, vehicle type, and the oil used. Our technicians can advise you on the best schedule for your specific car.",
  },
  {
    question: "Do I need an appointment, or can I walk in?",
    answer:
      "Walk-ins are always welcome at Trufit Auto Center! However, scheduling an appointment ensures we can dedicate time specifically for your vehicle and reduces your wait time. You can book through our website or give us a call.",
  },
  {
    question: "What are the signs that my brakes need servicing?",
    answer:
      "Common signs include squeaking or grinding noises when braking, a soft or spongy brake pedal, your vehicle pulling to one side when stopping, or a vibration in the steering wheel during braking. If you notice any of these, it's best to have your brakes inspected as soon as possible for your safety.",
  },
  {
    question: "How long does a typical diagnostic check take?",
    answer:
      "A comprehensive electronic diagnostic scan typically takes 30 to 60 minutes. Depending on the complexity of the issue, further inspection may be needed. We'll always communicate clearly about timelines and findings before proceeding with any repairs.",
  },
  {
    question: "Do you service all vehicle brands and models?",
    answer:
      "We specialize in European, American, and Asian vehicles, covering a wide range of brands and models. Our team has extensive experience with both common and premium vehicle makes. If you're unsure, feel free to contact us with your vehicle details.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept cash, bank transfers, and major credit/debit cards. For larger repairs, we can discuss flexible payment arrangements to suit your needs. Just ask our front desk team for available options.",
  },
];

export default function FAQSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [quickEmail, setQuickEmail] = useState("");

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  useGSAP(
    () => {
      // Left side reveal
      const leftItems = gsap.utils.toArray<HTMLElement>(".faq-left-reveal");
      leftItems.forEach((item, i) => {
        gsap.fromTo(
          item,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: i * 0.12,
            ease: "power3.out",
            scrollTrigger: {
              trigger: item,
              start: "top 92%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });

      // FAQ items stagger
      const faqItems = gsap.utils.toArray<HTMLElement>(".faq-item-animate");
      faqItems.forEach((item, i) => {
        gsap.fromTo(
          item,
          { opacity: 0, x: 30 },
          {
            opacity: 1,
            x: 0,
            duration: 0.7,
            delay: i * 0.08,
            ease: "power2.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 70%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="faq-section py-16 md:py-24 lg:py-32"
      id="faq"
    >
      <div className="max-w-[1820px] mx-auto px-6 sm:px-10 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-20">
          {/* LEFT: Heading + Quick Contact */}
          <div className="lg:col-span-2 space-y-6">
            {/* Label */}
            <div className="faq-left-reveal flex items-center gap-3">
              <div className="h-[2px] w-10 bg-brand-blue" />
              <span className="text-brand-blue text-xs font-bold tracking-[0.3em] uppercase">
                FAQ
              </span>
            </div>

            {/* Title */}
            <h2 className="faq-left-reveal text-3xl md:text-4xl lg:text-5xl font-black text-white font-brawler leading-tight tracking-tight">
              Do you have any{" "}
              <span className="text-brand-red">questions</span> for us?
            </h2>

            {/* Subtitle */}
            <p className="faq-left-reveal text-white/40 text-sm md:text-base leading-relaxed max-w-md">
              If there are questions you want to ask, we will answer all your questions.
              Can&apos;t find your question below? Send us a message!
            </p>

            {/* Quick email input */}
            <div className="faq-left-reveal pt-2">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Mail
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                  />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={quickEmail}
                    onChange={(e) => setQuickEmail(e.target.value)}
                    className="quick-contact-input pl-10"
                  />
                </div>
                <button
                  onClick={() => {
                    if (quickEmail) {
                      setQuickEmail("");
                    }
                  }}
                  className="shrink-0 bg-brand-red text-white px-5 py-[0.875rem] rounded-sm text-sm font-bold hover:bg-red-700 transition-all flex items-center gap-2"
                >
                  <Send size={14} />
                  <span className="hidden sm:inline">Submit</span>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: FAQ Accordion */}
          <div className="lg:col-span-3">
            {faqData.map((faq, idx) => (
              <div
                key={idx}
                className="faq-item faq-item-animate"
              >
                <button
                  className="faq-trigger"
                  onClick={() => toggleFaq(idx)}
                  aria-expanded={openIndex === idx}
                >
                  <span className="pr-4">{faq.question}</span>
                  <span
                    className={`faq-trigger-icon ${
                      openIndex === idx ? "active" : ""
                    }`}
                  >
                    <ChevronDown size={14} className="text-white" />
                  </span>
                </button>

                <div
                  className={`faq-answer ${openIndex === idx ? "open" : ""}`}
                >
                  <div className="faq-answer-inner">{faq.answer}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
