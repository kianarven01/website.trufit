import { MetadataRoute } from "next";
import { NEWS_DATA } from "@/data/news";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://trufitautocenter.com";


  const staticRoutes = [
    "",
    "/about",
    "/services",
    "/gallery",
    "/news",
    "/contact",
    //"/privacy",
    //"/terms",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency:
      route === "/news" ? ("weekly" as const) : ("daily" as const),
    priority:
      route === "" ? 1 : route === "/news" || route === "/services" ? 0.8 : 0.5,
  }));


  const newsEntries = NEWS_DATA.map((article) => ({
    url: `${baseUrl}/news/${article.slug}`,
    lastModified: new Date(article.date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...newsEntries];
}
