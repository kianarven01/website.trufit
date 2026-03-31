// src/data/news.ts

export type NewsItem = {
  id: string;
  title: string;
  excerpt: string;
  category: "News" | "Events" | "Maintenance Tips";
  date: string;
  image: string;
  slug: string;
  isFeatured?: boolean;
};

const LOREM_TITLE = "Lorem Ipsum Dolor Sit Amet Consectetur Adipiscing Elit";
const LOREM_EXCERPT = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";
const PLACEHOLDER_IMAGE = "/images/news/placeholder.webp";

export const NEWS_DATA: NewsItem[] = [
  {
    id: "1",
    title: LOREM_TITLE,
    excerpt: LOREM_EXCERPT,
    category: "News",
    date: "March 28, 2026",
    image: PLACEHOLDER_IMAGE,
    slug: "lorem-ipsum-1",
    isFeatured: true,
  },
  {
    id: "2",
    title: LOREM_TITLE,
    excerpt: LOREM_EXCERPT,
    category: "Events",
    date: "March 20, 2026",
    image: PLACEHOLDER_IMAGE,
    slug: "lorem-ipsum-2",
  },
  {
    id: "3",
    title: LOREM_TITLE,
    excerpt: LOREM_EXCERPT,
    category: "Maintenance Tips",
    date: "March 15, 2026",
    image: PLACEHOLDER_IMAGE,
    slug: "lorem-ipsum-3",
  },
  {
    id: "4",
    title: LOREM_TITLE,
    excerpt: LOREM_EXCERPT,
    category: "Events",
    date: "March 10, 2026",
    image: PLACEHOLDER_IMAGE,
    slug: "lorem-ipsum-4",
  },
  {
    id: "5",
    title: LOREM_TITLE,
    excerpt: LOREM_EXCERPT,
    category: "News",
    date: "March 05, 2026",
    image: PLACEHOLDER_IMAGE,
    slug: "lorem-ipsum-5",
  },
  {
    id: "6",
    title: LOREM_TITLE,
    excerpt: LOREM_EXCERPT,
    category: "Maintenance Tips",
    date: "February 25, 2026",
    image: PLACEHOLDER_IMAGE,
    slug: "lorem-ipsum-6",
  },
];
