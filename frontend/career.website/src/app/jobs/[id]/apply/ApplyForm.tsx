"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { Position } from "../../../../data/positions";

const ReCAPTCHA = dynamic(() => import("react-google-recaptcha"), { ssr: false });

interface Props {
  position: Position;
}

export default function ApplyForm({ position }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      formData.append("position", position.title);

      // Get reCAPTCHA token
      if (!recaptchaToken) {
        throw new Error("Please complete the reCAPTCHA verification.");
      }
      formData.append("g-recaptcha-response", recaptchaToken);

      const res = await fetch("/api/apply", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit application");
      }

      setSuccess(true);
      form.reset();
      setRecaptchaToken(null);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white border border-brand-red rounded-md p-12 text-center shadow-sm">
        <h2 className="text-2xl font-bold text-brand-dark mb-4">Application Submitted Successfully!</h2>
        <p className="text-gray-600 mb-8">Thank you for applying for the {position.title} position at Trufit Auto Center. We have received your application and will review it shortly.</p>
        <button 
          onClick={() => setSuccess(false)}
          className="text-brand-red font-bold uppercase tracking-wider text-sm hover:underline"
        >
          Submit another application
        </button>
      </div>
    );
  }

  return (
    <form action="/api/apply" onSubmit={handleSubmit} method="POST" encType="multipart/form-data" className="bg-white border border-gray-200 rounded-md p-8 md:p-12 shadow-sm">
      {error && (
        <div className="mb-8 p-4 bg-red-50 text-red-600 border border-red-200 rounded text-sm">
          {error}
        </div>
      )}
      
      <div className="mb-10">
        <h2 className="text-lg font-bold text-brand-dark uppercase tracking-wider mb-1">Personal Information</h2>
        <div className="h-[3px] w-10 bg-brand-red mb-6" />
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
            <input type="text" name="name" required className="w-full border border-gray-300 rounded px-4 py-3 text-sm text-brand-dark focus:outline-none focus:border-brand-red transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
            <input type="email" name="email" required className="w-full border border-gray-300 rounded px-4 py-3 text-sm text-brand-dark focus:outline-none focus:border-brand-red transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
            <input 
              type="tel" 
              name="phone" 
              required 
              pattern="[0-9]{11}"
              maxLength={11}
              onInput={(e) => {
                e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '');
              }}
              
              className="w-full border border-gray-300 rounded px-4 py-3 text-sm text-brand-dark focus:outline-none focus:border-brand-red transition-colors" 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Current Location *</label>
            <input type="text" name="location" required placeholder="City, Province" className="w-full border border-gray-300 rounded px-4 py-3 text-sm text-brand-dark focus:outline-none focus:border-brand-red transition-colors" />
          </div>
        </div>
      </div>

      <div className="mb-10">
        <h2 className="text-lg font-bold text-brand-dark uppercase tracking-wider mb-1">Questionnaire</h2>
        <div className="h-[3px] w-10 bg-brand-red mb-6" />

        <div className="space-y-8">
          {position.category === "Office" ? (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  1. Why are you interested in this administrative/office position at Trufit Auto Center? *
                </label>
                <textarea name="q1" required rows={3} placeholder="Type your answer here..." className="w-full border border-gray-300 rounded px-4 py-3 text-sm text-brand-dark focus:outline-none focus:border-brand-red transition-colors resize-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  2. Do you have relevant experience in office administration, management, or the specific role you are applying for? If yes, briefly describe. *
                </label>
                <textarea name="q2" required rows={3} placeholder="Type your answer here..." className="w-full border border-gray-300 rounded px-4 py-3 text-sm text-brand-dark focus:outline-none focus:border-brand-red transition-colors resize-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  3. Are you comfortable using modern office software and management tools? *
                </label>
                <textarea name="q3" required rows={2} placeholder="Type your answer here..." className="w-full border border-gray-300 rounded px-4 py-3 text-sm text-brand-dark focus:outline-none focus:border-brand-red transition-colors resize-none" />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  1. Why are you interested in this technical position at Trufit Auto Center? *
                </label>
                <textarea name="q1" required rows={3} placeholder="Type your answer here..." className="w-full border border-gray-300 rounded px-4 py-3 text-sm text-brand-dark focus:outline-none focus:border-brand-red transition-colors resize-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  2. Do you have relevant hands-on experience in automotive repair or maintenance? If yes, briefly describe. *
                </label>
                <textarea name="q2" required rows={3} placeholder="Type your answer here..." className="w-full border border-gray-300 rounded px-4 py-3 text-sm text-brand-dark focus:outline-none focus:border-brand-red transition-colors resize-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  3. Are you familiar with standard workshop safety protocols and specialized automotive tools? *
                </label>
                <textarea name="q3" required rows={2} placeholder="Type your answer here..." className="w-full border border-gray-300 rounded px-4 py-3 text-sm text-brand-dark focus:outline-none focus:border-brand-red transition-colors resize-none" />
              </div>
            </>
          )}
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              4. When is the earliest date you can start if hired? *
            </label>
            <textarea name="q4" required rows={2} placeholder="Type your answer here..." className="w-full border border-gray-300 rounded px-4 py-3 text-sm text-brand-dark focus:outline-none focus:border-brand-red transition-colors resize-none" />
          </div>
        </div>
      </div>

      <div className="mb-10">
        <h2 className="text-lg font-bold text-brand-dark uppercase tracking-wider mb-1">Resume</h2>
        <div className="h-[3px] w-10 bg-brand-red mb-6" />
        <div className="border border-gray-300 rounded-md p-6">
          <p className="text-gray-700 text-sm font-semibold mb-2">Upload your resume (PDF, DOC, DOCX - max 5MB) *</p>
          <input type="file" name="resume" required accept=".pdf,.doc,.docx" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-brand-red/10 file:text-brand-red hover:file:bg-brand-red/20 transition-colors" />
        </div>
      </div>

      <div className="mb-10">
        {mounted && (
          <ReCAPTCHA
            sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
            onChange={(token) => setRecaptchaToken(token)}
            onExpired={() => setRecaptchaToken(null)}
          />
        )}
      </div>

      <div className="pt-6 border-t border-gray-100">
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="bg-brand-red hover:bg-red-700 disabled:opacity-70 text-white font-bold py-4 px-12 rounded transition-colors uppercase tracking-wider text-sm flex items-center gap-2"
        >
          {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          {isSubmitting ? "Submitting..." : "Submit Application"}
        </button>
        <p className="text-gray-400 text-xs mt-4">
          By submitting this application, you agree that your information will be reviewed by the Trufit Auto Center hiring team.
        </p>
      </div>
    </form>
  );
}
