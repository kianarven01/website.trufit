export interface GalleryItem {
  id: number;
  title: string;
  category: "service-center" | "technologies";
  image: string;
  isVideo: boolean;
}

export const galleryItems: GalleryItem[] = [
  // Service Center
  {
    id: 1,
    title: "Service Center Entrance",
    category: "service-center",
    image: "/images/gallery/service_center/entrance.webp",
    isVideo: false,
  },
  {
    id: 2,
    title: "Trufit Gateway",
    category: "service-center",
    image: "/images/gallery/service_center/gate.webp",
    isVideo: false,
  },
  {
    id: 3,
    title: "Component Stock",
    category: "service-center",
    image: "/images/gallery/service_center/inventory1.webp",
    isVideo: false,
  },
  {
    id: 4,
    title: "Parts Inventory Room",
    category: "service-center",
    image: "/images/gallery/service_center/inventory2.webp",
    isVideo: false,
  },
  {
    id: 5,
    title: "Technical Laboratory",
    category: "service-center",
    image: "/images/gallery/service_center/laboratory1.webp",
    isVideo: false,
  },
  {
    id: 6,
    title: "Technical Laboratory",
    category: "service-center",
    image: "/images/gallery/service_center/laboratory2.webp",
    isVideo: false,
  },
  {
    id: 7,
    title: "Comfortable Client Lounge",
    category: "service-center",
    image: "/images/gallery/service_center/lounge1.webp",
    isVideo: false,
  },
  {
    id: 8,
    title: "Premium Waiting Area",
    category: "service-center",
    image: "/images/gallery/service_center/lounge2.webp",
    isVideo: false,
  },
  {
    id: 9,
    title: "Parts Display",
    category: "service-center",
    image: "/images/gallery/service_center/lounge3.webp",
    isVideo: false,
  },
  {
    id: 10,
    title: "Parts & Logistics",
    category: "service-center",
    image: "/images/gallery/service_center/parts_department.webp",
    isVideo: false,
  },
  {
    id: 11,
    title: "Welcome Reception",
    category: "service-center",
    image: "/images/gallery/service_center/reception.webp",
    isVideo: false,
  },
  {
    id: 12,
    title: "Customer Service Hub",
    category: "service-center",
    image: "/images/gallery/service_center/reception_office.webp",
    isVideo: false,
  },
  {
    id: 13,
    title: "Maintenance Bay Left",
    category: "service-center",
    image: "/images/gallery/service_center/workshop1.webp",
    isVideo: false,
  },
  {
    id: 14,
    title: "Maintenance Bay Right",
    category: "service-center",
    image: "/images/gallery/service_center/workshop2.webp",
    isVideo: false,
  },

  // Technologies
  {
    id: 15,
    title: "Ultrasonic Nebulizer",
    category: "technologies",
    image:
      "/images/gallery/technologies/atom_machine_ultrasonic_nebulizer.webp",
    isVideo: false,
  },
  {
    id: 16,
    title: "Digital OBD Scanner",
    category: "technologies",
    image: "/images/gallery/technologies/onboard_diagnostic_tool.webp",
    isVideo: false,
  },
  {
    id: 17,
    title: "Transmission Lift System",
    category: "technologies",
    image: "/images/gallery/technologies/transmission_support.webp",
    isVideo: false,
  },
];
