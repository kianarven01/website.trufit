import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Send } from "lucide-react";
import { positions } from "../../../../data/positions";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ApplyPage({ params }: Props) {
  const { id } = await params;
  const position = positions.find((p) => p.id === parseInt(id));

  if (!position) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <div className="bg-white py-10 px-6 border-b-4 border-brand-red">
        <div className="container mx-auto max-w-3xl">
          <Link 
            href={`/jobs/${position.id}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-brand-dark transition-colors mb-6 uppercase tracking-widest"
          >
            <ChevronLeft size={16} />
            Back to Job Details
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-brand-dark tracking-tight">
            Apply: {position.title}
          </h1>
          <p className="text-gray-500 text-sm mt-2 font-medium">{position.type} &bull; {position.location}</p>
        </div>
      </div>

      {/* Form */}
      <div className="container mx-auto max-w-3xl px-6 py-12">
        <div className="bg-white border border-gray-200 rounded-md p-8 md:p-12 shadow-sm">
          
          <div className="mb-10">
            <h2 className="text-lg font-bold text-brand-dark uppercase tracking-wider mb-1">Personal Information</h2>
            <div className="h-[3px] w-10 bg-brand-red mb-6" />
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                <input type="text" placeholder="Juan Dela Cruz" className="w-full border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:border-brand-red transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                <input type="email" placeholder="juan@email.com" className="w-full border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:border-brand-red transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                <input type="tel" placeholder="09XX-XXX-XXXX" className="w-full border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:border-brand-red transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Current Location</label>
                <input type="text" placeholder="City, Province" className="w-full border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:border-brand-red transition-colors" />
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
                    <textarea rows={3} placeholder="Type your answer here..." className="w-full border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:border-brand-red transition-colors resize-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      2. Do you have relevant experience in office administration, management, or the specific role you are applying for? If yes, briefly describe. *
                    </label>
                    <textarea rows={3} placeholder="Type your answer here..." className="w-full border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:border-brand-red transition-colors resize-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      3. Are you comfortable using modern office software and management tools? *
                    </label>
                    <textarea rows={2} placeholder="Type your answer here..." className="w-full border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:border-brand-red transition-colors resize-none" />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      1. Why are you interested in this technical position at Trufit Auto Center? *
                    </label>
                    <textarea rows={3} placeholder="Type your answer here..." className="w-full border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:border-brand-red transition-colors resize-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      2. Do you have relevant hands-on experience in automotive repair or maintenance? If yes, briefly describe. *
                    </label>
                    <textarea rows={3} placeholder="Type your answer here..." className="w-full border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:border-brand-red transition-colors resize-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      3. Are you familiar with standard workshop safety protocols and specialized automotive tools? *
                    </label>
                    <textarea rows={2} placeholder="Type your answer here..." className="w-full border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:border-brand-red transition-colors resize-none" />
                  </div>
                </>
              )}
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  4. When is the earliest date you can start if hired? *
                </label>
                <textarea rows={2} placeholder="Type your answer here..." className="w-full border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:border-brand-red transition-colors resize-none" />
              </div>
            </div>
          </div>

          <div className="mb-10">
            <h2 className="text-lg font-bold text-brand-dark uppercase tracking-wider mb-1">Resume</h2>
            <div className="h-[3px] w-10 bg-brand-red mb-6" />
            <div className="border-2 border-dashed border-gray-300 rounded-md p-8 text-center">
              <p className="text-gray-500 text-sm mb-2">Drag and drop your resume here, or click to browse</p>
              <p className="text-gray-400 text-xs">PDF, DOC, or DOCX (max 5MB)</p>
              <input type="file" className="hidden" accept=".pdf,.doc,.docx" />
              <button type="button" className="mt-4 text-brand-red font-bold text-sm border border-brand-red rounded px-6 py-2 hover:bg-brand-red hover:text-white transition-colors">
                Browse Files
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <button 
              type="button" 
              className="bg-brand-red hover:bg-red-700 text-white font-bold py-4 px-12 rounded transition-colors uppercase tracking-wider text-sm flex items-center gap-2"
            >
              <Send size={16} />
              Submit Application
            </button>
            <p className="text-gray-400 text-xs mt-4">
              By submitting this application, you agree that your information will be reviewed by the Trufit Auto Center hiring team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
