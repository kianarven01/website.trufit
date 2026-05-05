// src/app/news/[slug]/page.tsx
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, User, Tag, Share2 } from "lucide-react";
import { NEWS_DATA } from "@/data/news";
import ArticleRenderer from "@/components/news/ArticleRenderer";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = NEWS_DATA.find((item) => item.slug === slug);

  if (!article) return { title: "Article Not Found" };

  return {
    title: `${article.title} | Trufit News`,
    description: article.excerpt,
    alternates: {
      canonical: `https://trufitautocenter.com/news/${slug}`,
    },

    openGraph: {
      title: article.title,
      description: article.excerpt,
      url: `https://trufitautocenter.com/news/${slug}`,
      siteName: "Trufit Auto Center",
      type: "article",
      locale: "en_PH",
      images: [
        {
          url: article.image,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      images: [article.image],
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = NEWS_DATA.find((item) => item.slug === slug);

  if (!article) {
    notFound();
  }

  return (
    <main className="bg-brand-dark min-h-screen">
      {/* Article Hero */}
      <section className="relative h-[calc(60vh+112px)] md:h-[calc(80vh+120px)] min-h-[700px] w-full overflow-hidden -mt-[112px] md:-mt-[120px]">
        <Image
          src={article.image}
          alt={article.title}
          fill
          className="object-cover object-top"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/20 to-transparent" />

        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 lg:p-20 pt-48 pb-12">
          <div className="container mx-auto">
            <Link
              href="/news"
              className="inline-flex items-center gap-2 text-brand-red font-bold uppercase tracking-widest text-sm mb-8 hover:text-white transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Back to News
            </Link>

            <div className="flex flex-wrap items-center gap-4 md:gap-8 text-white text-xs md:text-sm mb-6 uppercase tracking-[0.2em] font-medium">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-brand-red" />
                <span>{article.category}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand-red" />
                <span>{article.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-brand-blue" />
                <span>Trufit IT Department</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white uppercase leading-[1.1] tracking-tight max-w-5xl">
              {article.title}
            </h1>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="section-padding pt-16 md:pt-24 relative z-10">
        <div className="container mx-auto max-w-4xl">
          {article.content ? (
            <ArticleRenderer content={article.content} />
          ) : (
            <div className="max-w-4xl mx-auto">
              <p className="text-gray-300 text-xl leading-relaxed mb-8">
                {article.excerpt}
              </p>
              <p className="text-gray-500 italic">
                Full article content is coming soon.
              </p>
            </div>
          )}

          <div className="mt-24 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-brand-red flex items-center justify-center font-bold text-white">
                T
              </div>
              <div>
                <p className="text-white font-bold text-sm">Trufit IT Department</p>
                <p className="text-gray-500 text-xs">
                  Official News & Updates from Trufit Auto Center
                </p>
              </div>
            </div>

            <Link
              href="/news"
              className="bg-white/5 hover:bg-brand-red px-8 py-4 text-white font-bold text-xs uppercase tracking-[0.2em] transition-all duration-300"
            >
              Explore More Articles
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
