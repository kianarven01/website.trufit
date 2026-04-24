// src/components/news/newscard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";
import { NewsItem } from "@/data/news";

type Props = {
  item: NewsItem;
  index: number;
};

export default function NewsCard({ item, index }: Props) {
  return (
    <article 
      className="news-card group relative bg-brand-dark border border-white/5 rounded-2xl overflow-hidden hover:border-brand-red/30 transition-all duration-500 hover:shadow-2xl hover:shadow-brand-red/10 animate-reveal"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="overflow-hidden relative bg-black/20">
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-auto transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-brand-red text-white text-[10px] font-bold uppercase tracking-widest rounded-sm">
            {item.category}
          </span>
        </div>
      </div>

      <div className="p-6 md:p-8">
        <div className="flex items-center gap-2 text-gray-500 text-xs mb-4">
          <Calendar className="w-3.5 h-3.5" />
          <span>{item.date}</span>
        </div>

        <h3 className="font-bold text-xl md:text-2xl text-white mb-4 line-clamp-2 leading-tight group-hover:text-brand-red transition-colors tracking-tight">
          {item.title}
        </h3>

        <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-3">
          {item.excerpt}
        </p>

        <Link 
          href={`/news/${item.slug}`}
          className="inline-flex items-center gap-2 text-white font-bold text-xs uppercase tracking-widest hover:text-brand-red transition-all group/btn"
        >
          Read More 
          <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
        </Link>
      </div>
    </article>
  );
}
