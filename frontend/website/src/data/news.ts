// src/data/news.ts

export type ContentBlock =
  | { type: "paragraph"; content: string }
  | { type: "heading"; content: string; level: 2 | 3 }
  | { type: "image"; src: string; alt: string; caption?: string }
  | { type: "quote"; content: string; author?: string };

export type NewsItem = {
  id: string;
  title: string;
  excerpt: string;
  category: "News" | "Events" | "Maintenance Tips";
  date: string;
  image: string;
  slug: string;
  isFeatured?: boolean;
  content?: ContentBlock[];
};

export const NEWS_DATA: NewsItem[] = [
  {
    id: "triathlon-2026",
    title:
      "Through Heat, Heart, and Grit: Trufit Tri Team Finds Its Podium at Bantayog Talisay Triathlon Year 5",
    excerpt:
      "Under the grueling intensity of the Philippine summer heat, the Trufit Tri Team walked away with two massive podium finishes: 3rd Place in Men's Elite and 2nd Place in Mixed Relay.",
    category: "Events",
    date: "April 12, 2026",
    image: "/images/news/articles/trufit_triathlon/1.webp",
    slug: "trufit-triathlon",
    isFeatured: true,
    content: [
      {
        type: "paragraph",
        content:
          "Under the grueling intensity of the Philippine summer heat, the Trufit Tri Team proved that strategy and resilience are just as important as speed. Competing in the 5th annual Bantayog Talisay Triathlon, April 12, 2026 at the Centennial Wharf in Bagasbas, the team walked away with two massive podium finish: 3rd Place in the Men’s Elite and 2nd Place in the Mixed Relay Category",
      },
      {
        type: "paragraph",
        content:
          "In the men’s elite division, JM Acero did not begin like a future podium finisher. Coming out of the swim second to the last, he was immediately forced into a different race from the leaders. From there, every kilometer became a struggle. On the bike, over a mostly flat route of concrete and asphalt marked by rough patches and humps, Acero steadily clawed back time until the gap had been reduced to just five minutes. It was not yet enough to promise anything, only enough to keep the possibility alive.",
      },
      {
        type: "image",
        src: "/images/news/articles/trufit_triathlon/6.webp",
        alt: "JM Acero competing in the triathlon",
        caption: "JM Acero battling through the bike leg.",
      },
      {
        type: "paragraph",
        content:
          "Then came the run, the cruelest part of the course, 10 kilometers of exposed concrete road under Philippine summer heat, with the athletes hitting that leg at around 8 a.m., when the sun had already started to bite. This was where races came apart. It was also where Acero came alive. He overtook 2 more athletes in the final leg, turning a difficult opening into a third-place finish overall. By the finish, the emotion on his face said what numbers could not. Some podiums are celebrations. Others are survivals. This one felt earned in full.",
      },
      {
        type: "heading",
        level: 2,
        content: "The Mixed Relay: A Story of Stubbornness",
      },
      {
        type: "image",
        src: "/images/news/articles/trufit_triathlon/2.webp",
        alt: "Trufit Relay Team",
        caption: "Nicole Kate Pardo leading the swim leg.",
      },
      {
        type: "paragraph",
        content:
          "The mixed relay team told a different story, but one built on the same stubbornness. Nicole Kate Pardo gave TRUFIT the ideal start, finishing the swim leg first in their category and handing the race to Lester Ariola with momentum already on their side. A clean handover can feel like control, but control in sport is often temporary.",
      },
      {
        type: "image",
        src: "/images/news/articles/trufit_triathlon/4.webp",
        alt: "Lester Ariola Cycling",
        caption: "Lester Ariola on the bike leg.",
      },
      {
        type: "paragraph",
        content:
          "Early in the bike leg, Ariola fell at the first turn section, a moment that could have undone the entire effort. For a relay team, one mistake is never carried by one athlete alone; it instantly becomes everyone’s burden. But he recovered, rebuilt his rhythm, and pushed through the rest of the course, keeping the gap small enough to preserve the team’s chances. By the time Cyrus Villeno took over in the final leg, the race had narrowed into a contest of judgment as much as speed.",
      },
      {
        type: "image",
        src: "/images/news/articles/trufit_triathlon/3.webp",
        alt: "Cyrus Villeno running",
        caption: "Cyrus Villeno maintaining a calculated pace under the heat.",
      },
      {
        type: "paragraph",
        content:
          "Villeno left transition alongside another runner, but instead of forcing an early duel, he chose endurance over impulse. It was a measured decision in brutal conditions, the kind of choice that rarely looks dramatic in the moment but decides races all the same. While others chased the clock too aggressively, he managed his effort and held firm, securing second place on the podium for TRUFIT.",
      },
      {
        type: "image",
        src: "/images/news/articles/trufit_triathlon/5.webp",
        alt: "Trufit Tri Team Podium",
        caption: "The team celebrating their hard-earned podium finishes.",
      },
      {
        type: "paragraph",
        content:
          "What began as a test of speed and endurance had become something harder, a test of patience, pain tolerance, and resolve. In that kind of race, podium finishes are not simply won. They have conquered.",
      },
    ],
  },
  /*{
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
  },*/
];
