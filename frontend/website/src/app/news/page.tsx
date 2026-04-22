// src/app/news/page.tsx
"use client";

import { useState, useMemo } from "react";
import NewsHero from "@/components/news/newshero";
import NewsCategories from "@/components/news/newscategories";
import NewsFeatured from "@/components/news/newsfeatured";
import NewsCard from "@/components/news/newscard";
import Pagination from "@/components/news/pagination";
import { NEWS_DATA } from "@/data/news";

export default function NewsPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filter items by category
  const filteredItems = useMemo(() => {
    if (activeCategory === "All") return NEWS_DATA;
    return NEWS_DATA.filter((item) => item.category === activeCategory);
  }, [activeCategory]);

  // Handle pagination (if we had more items)
  // For now, we only have 6 items so totalPages will be 1
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  // Separate featured item from the rest
  const featuredItem = filteredItems.find(item => item.isFeatured) || filteredItems[0];
  const gridItems = filteredItems.filter(item => item.id !== featuredItem?.id);

  return (
    <div className="bg-brand-dark min-h-screen">
      <NewsHero />
      
      <section className="section-padding bg-brand-dark pt-0 relative z-10">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
            <div className="section-label mb-0">
              <div className="section-label-line" />
              <span className="section-label-text">Explore Articles</span>
            </div>
            
            <NewsCategories 
              activeCategory={activeCategory} 
              onCategoryChange={(cat) => {
                setActiveCategory(cat);
                setCurrentPage(1);
              }} 
            />
          </div>

          {/* If "All" or "News", show featured item first */}
          {(activeCategory === "All" || activeCategory === "News") && featuredItem && (
            <NewsFeatured item={featuredItem} />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {gridItems.map((item, index) => (
              <NewsCard key={item.id} item={item} index={index} />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={setCurrentPage} 
            />
          )}

          {filteredItems.length === 0 && (
            <div className="text-center py-40 border border-white/5 rounded-3xl bg-white/[0.02]">
              <p className="text-gray-500 text-xl font-light italic">No articles found in this category.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
