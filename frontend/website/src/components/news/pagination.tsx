// src/components/news/pagination.tsx
"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({ currentPage, totalPages, onPageChange }: Props) {
  return (
    <div className="flex items-center justify-center gap-4 mt-20 pt-10 border-t border-white/5">
      <button 
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-3 bg-white/5 border border-white/10 hover:bg-brand-red disabled:opacity-30 disabled:hover:bg-white/5 rounded-full transition-all group"
      >
        <ChevronLeft className="w-5 h-5 text-white" />
      </button>

      <div className="flex items-center gap-2">
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => onPageChange(i + 1)}
            className={cn(
              "w-12 h-12 rounded-full font-bold flex items-center justify-center border transition-all",
              currentPage === i + 1 
                ? "bg-brand-red border-brand-red text-white shadow-[0_0_20px_rgba(227,27,35,0.3)]" 
                : "bg-transparent border-white/10 text-gray-400 hover:border-white/30 hover:text-white"
            )}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <button 
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-3 bg-white/5 border border-white/10 hover:bg-brand-red disabled:opacity-30 disabled:hover:bg-white/5 rounded-full transition-all group"
      >
        <ChevronRight className="w-5 h-5 text-white" />
      </button>
    </div>
  );
}
