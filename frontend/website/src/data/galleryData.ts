export interface GalleryItem {
  id: number;
  title: string;
  category: "service-center" | "technologies";
  image: string;
  isVideo: boolean;
}

export const galleryItems: GalleryItem[] = [
  {
    id: 1,
    title: "Main Workshop Area",
    category: "service-center",
    image: "/images/gallery/service-center/workshop-1.jpg",
    isVideo: false,
  },
  {
    id: 2,
    title: "Advanced Scanning",
    category: "technologies",
    image: "/images/gallery/technologies/scanner-1.jpg",
    isVideo: false,
  },
  {
    id: 3,
    title: "Precision Calibration",
    category: "technologies",
    image: "/images/gallery/technologies/calibration-1.jpg",
    isVideo: false,
  },
  {
    id: 4,
    title: "Customer Lounge",
    category: "service-center",
    image: "/images/gallery/service-center/lounge-1.jpg",
    isVideo: false,
  },
  {
    id: 5,
    title: "Engine Diagnostics Bench",
    category: "technologies",
    image: "/images/gallery/technologies/engine-bench-1.jpg",
    isVideo: false,
  },
  {
    id: 6,
    title: "Post-Service Inspection",
    category: "service-center",
    image: "/images/gallery/service-center/inspection-1.jpg",
    isVideo: false,
  },
];
