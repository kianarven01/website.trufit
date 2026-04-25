// src/components/news/newscategories.tsx
"use client";

import { cn } from "@/lib/utils";

type Props = {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
};

const CATEGORIES = ["All", "News", "Events", "Maintenance Tips"];

export default function NewsCategories({ activeCategory, onCategoryChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-4 mb-12">
      {CATEGORIES.map((category) => (
        <button
          key={category}
          onClick={() => onCategoryChange(category)}
          className={cn(
            "px-6 py-2 rounded-sm text-xs font-bold tracking-[0.2em] uppercase transition-all duration-300 border",
            activeCategory === category
              ? "bg-brand-red border-brand-red text-white"
              : "bg-transparent border-white/10 text-gray-400 hover:border-white/30 hover:text-white"
          )}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
