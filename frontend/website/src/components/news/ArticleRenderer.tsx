// src/components/news/ArticleRenderer.tsx
"use client";

import Image from "next/image";
import { ContentBlock } from "@/data/news";

type Props = {
  content: ContentBlock[];
};

export default function ArticleRenderer({ content }: Props) {
  return (
    <div className="max-w-4xl mx-auto">
      {content.map((block, index) => {
        switch (block.type) {
          case "paragraph":
            return (
              <p 
                key={index} 
                className="text-gray-300 text-lg md:text-xl leading-relaxed mb-8 font-light"
              >
                {block.content}
              </p>
            );
          
          case "heading":
            const HeadingTag = block.level === 2 ? "h2" : "h3";
            return (
              <HeadingTag 
                key={index} 
                className={`text-white font-bold mb-6 mt-12 uppercase tracking-tight ${
                  block.level === 2 ? "text-3xl md:text-4xl" : "text-2xl md:text-3xl"
                }`}
              >
                {block.content}
              </HeadingTag>
            );
          
          case "image":
            return (
              <figure key={index} className="my-12 relative group">
                <img
                  src={block.src}
                  alt={block.alt}
                  className="w-full h-auto block rounded-2xl shadow-2xl border border-white/5"
                />
                {block.caption && (
                  <figcaption className="mt-4 text-gray-500 text-sm italic text-center">
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            );
          
          case "quote":
            return (
              <div 
                key={index} 
                className="my-12 py-4"
              >
                <p className="text-xl md:text-2xl text-white font-medium italic leading-relaxed">
                  "{block.content}"
                </p>
                {block.author && (
                  <p className="text-gray-500 text-sm mt-2">
                    — {block.author}
                  </p>
                )}
              </div>
            );
          
          default:
            return null;
        }
      })}
    </div>
  );
}
