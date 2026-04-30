// src/components/news/newsfeatured.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, User } from "lucide-react";
import { NewsItem } from "@/data/news";

type Props = {
  item: NewsItem;
};

export default function NewsFeatured({ item }: Props) {
  return (
    <article className="group relative grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center mb-16 md:mb-24">
      <div className="aspect-video lg:aspect-auto lg:h-[450px] overflow-hidden rounded-2xl relative shadow-2xl">
        <Image
          src={item.image}
          alt={item.title}
          fill
          className="object-cover transition-transform duration-1000 group-hover:scale-105"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />
        <div className="absolute top-6 left-6">
          <span className="px-4 py-2 bg-brand-red text-white text-xs font-bold uppercase tracking-[0.2em] rounded-sm shadow-lg">
            Featured
          </span>
        </div>
      </div>

      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-6 text-gray-500 text-xs mb-6 font-medium uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-red" />
            <span>{item.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-brand-blue" />
            <span>Trufit Editorial</span>
          </div>
        </div>

        <h2 className="font-brawler text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 uppercase leading-[1.1] group-hover:text-brand-red transition-colors duration-300">
          {item.title}
        </h2>

        <p className="text-gray-400 text-base md:text-xl leading-relaxed mb-8 max-w-xl font-light">
          {item.excerpt}
        </p>

        <Link 
          href={`/news/${item.slug}`}
          className="group/btn inline-flex items-center gap-3 bg-white/5 border border-white/10 hover:bg-brand-red hover:border-brand-red px-8 py-4 text-white font-bold text-sm uppercase tracking-[0.2em] transition-all duration-300 backdrop-blur-sm self-start"
        >
          Read Full Story 
          <ArrowRight className="w-5 h-5 transition-transform group-hover/btn:translate-x-1" />
        </Link>
      </div>
    </article>
  );
}
