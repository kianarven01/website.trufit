import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Briefcase, User, MapPin, ArrowRight } from "lucide-react";
import { positions } from "../../../data/positions";
import ShareButton from "./ShareButton";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function JobDetailPage({ params }: Props) {
  const { id } = await params;
  const position = positions.find((p) => p.id === parseInt(id));

  if (!position) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Light Header Banner */}
      <div className="bg-white py-16 px-6 border-b-4 border-brand-red">
        <div className="container mx-auto max-w-6xl">
          <Link 
            href="/#open-positions"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-brand-dark transition-colors mb-8 uppercase tracking-widest"
          >
            <ChevronLeft size={16} />
            Back to all jobs
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-brand-dark tracking-tight">{position.title}</h1>
          <div className="flex flex-wrap items-center gap-4 mt-4 text-gray-500 text-sm font-medium">
            <span className="flex items-center gap-2"><Briefcase size={14} /> {position.type}</span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-2"><MapPin size={14} /> {position.location}</span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-2"><User size={14} /> Automotive</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto max-w-6xl px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-10">
            {/* Responsibilities */}
            <div>
              <h3 className="text-lg font-bold text-brand-dark mb-1 uppercase tracking-wider">Responsibilities</h3>
              <div className="h-[3px] w-10 bg-brand-red mb-6" />
              <ul className="space-y-4">
                {position.responsibilities.map((resp, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-600 leading-relaxed">
                    <span className="text-brand-red font-bold mt-0.5 text-lg leading-none">&bull;</span>
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Requirements */}
            <div>
              <h3 className="text-lg font-bold text-brand-dark mb-1 uppercase tracking-wider">Requirements</h3>
              <div className="h-[3px] w-10 bg-brand-red mb-6" />
              <ul className="space-y-4">
                {position.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-600 leading-relaxed">
                    <span className="text-brand-red font-bold mt-0.5 text-lg leading-none">&bull;</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Benefits */}
            <div>
              <h3 className="text-lg font-bold text-brand-dark mb-1 uppercase tracking-wider">Benefits</h3>
              <div className="h-[3px] w-10 bg-brand-red mb-6" />
              <ul className="space-y-3">
                {[
                  "Competitive salary package",
                  "Health insurance",
                  "Paid training and certifications",
                  "Company events and team building activities",
                  "Opportunities for promotion",
                  "Performance-based pay raise",
                  "Promotion to permanent employee",
                ].map((benefit, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-600 leading-relaxed">
                    <span className="text-brand-red font-bold mt-0.5 text-lg leading-none">&bull;</span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-4">
              {/* Info Card */}
              <div className="bg-white rounded-md border border-gray-200 shadow-sm p-8">
                <div className="space-y-5 mb-8">
                  <div className="flex items-center gap-4 text-brand-dark font-semibold">
                    <Briefcase className="text-brand-red" size={20} />
                    <span>{position.type}</span>
                  </div>
                  <div className="flex items-center gap-4 text-brand-dark font-semibold">
                    <User className="text-brand-red" size={20} />
                    <span>Entry / Mid Level</span>
                  </div>
                  <div className="flex items-center gap-4 text-brand-dark font-semibold">
                    <MapPin className="text-brand-red" size={20} />
                    <span>{position.location}</span>
                  </div>
                </div>

                <Link
                  href={`/jobs/${position.id}/apply`}
                  className="w-full bg-brand-red hover:bg-red-700 text-white font-bold py-4 rounded transition-colors uppercase tracking-wider text-sm flex items-center justify-center gap-2"
                >
                  Apply Now <ArrowRight size={16} />
                </Link>
              </div>

              {/* Share Button */}
              <ShareButton />

              {/* Contact Card */}
              <div className="bg-white border border-gray-200 rounded-md p-8 text-center shadow-sm">
                <p className="text-gray-500 text-sm mb-3">Have questions about this role?</p>
                <a 
                  href="mailto:trufitautocenterdaet@gmail.com" 
                  className="text-brand-red font-bold text-sm hover:underline break-all"
                >
                  trufitautocenterdaet@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
