import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { positions } from "../../../../data/positions";
import ApplyForm from "./ApplyForm";

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
        <ApplyForm position={position} />
      </div>
    </div>
  );
}
