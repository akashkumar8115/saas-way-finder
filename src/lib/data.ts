// src/lib/data.ts
// Note: Assuming this file is in /src/lib for organization

// Import types (ensure these exist in /src/types/index.ts)
import { Location, AppFloor, Event, RouteSearchResult } from "@/types";

// Import images using Next.js static asset paths
// Use `next/image` when rendering these in components
const Flor0 = "/gifs/floor-0.jpeg"; // Static path from /public

export const locations: Location[] = [
  {
    id: "washrooms",
    name: "Washrooms",
    floor: 0,
    coordinates: { x: 100, y: 150 },
    type: "facility",
  },
  {
    id: "lost-found",
    name: "Lost and Found",
    floor: 0,
    coordinates: { x: 200, y: 100 },
    type: "facility",
  },
  {
    id: "pantry",
    name: "Pantry",
    floor: 1,
    coordinates: { x: 150, y: 200 },
    type: "facility",
  },
  {
    id: "cafeteria",
    name: "Cafeteria",
    floor: 0,
    coordinates: { x: 300, y: 250 },
    type: "facility",
  },
  {
    id: "store",
    name: "Campus Store",
    floor: 0,
    coordinates: { x: 250, y: 180 },
    type: "facility",
  },
  {
    id: "main-entrance",
    name: "Main Entrance",
    floor: 0,
    coordinates: { x: 50, y: 300 },
    type: "entrance",
  },
  {
    id: "library",
    name: "Library",
    floor: 1,
    coordinates: { x: 200, y: 150 },
    type: "facility",
  },
  {
    id: "auditorium",
    name: "Auditorium",
    floor: 0,
    coordinates: { x: 400, y: 200 },
    type: "facility",
  },
];

export const floors: AppFloor[] = [
  { number: 0, name: "Ground Floor", isActive: true },
  { number: 1, name: "First Floor", isActive: true },
  { number: 2, name: "Second Floor", isActive: true },
  { number: 3, name: "Third Floor", isActive: false },
];

export const events: Event[] = [
  {
    id: 1,
    title: "Campus Orientation Day",
    type: "Academic",
    date: "2024-01-15",
    image: "/images/events/event1.jpg", // Use /public path
    description:
      "Welcome new students to campus with orientation activities and campus tours.",
    location: "Main Auditorium",
    startTime: "09:00",
    endTime: "17:00",
  },
  {
    id: 2,
    title: "Tech Innovation Summit",
    type: "Technology",
    date: "2024-01-20",
    image: "/images/events/event2.jpg",
    description:
      "Annual technology summit featuring latest innovations and industry speakers.",
    location: "Conference Hall",
    startTime: "10:00",
    endTime: "16:00",
  },
  {
    id: 3,
    title: "Cultural Festival",
    type: "Cultural",
    date: "2024-01-25",
    image: "/images/events/event3.jpg",
    description:
      "Celebrate diversity with cultural performances, food, and exhibitions.",
    location: "Campus Grounds",
    startTime: "14:00",
    endTime: "20:00",
  },
];

export interface SavedMap {
  id: string;
  name: string;
  imageUrl: string;
  paths: {
    id: string;
    name: string;
    source: string;
    destination: string;
    points: { x: number; y: number }[];
    isPublished: boolean;
    color?: string;
  }[];
  createdAt: string;
  isPublished: boolean;
}

export interface SavedPath {
  id: string;
  name: string;
  source: string;
  destination: string;
  points: { x: number; y: number }[];
  isPublished: boolean;
}

// Client-side storage functions (use in client components only)
// export const saveMapToStorage = (map: SavedMap): void => {
//   if (typeof window === "undefined") return; // Prevent server-side execution
//   const existingMaps = getStoredMaps();
//   const updatedMaps = existingMaps.filter((m) => m.id !== map.id);
//   updatedMaps.push(map);
//   localStorage.setItem("savedMaps", JSON.stringify(updatedMaps));
// };
export function saveMapToStorage(map: SavedMap) {
  const maps = JSON.parse(localStorage.getItem("maps") || "[]");
  const updatedMaps = maps.filter((m: SavedMap) => m.id !== map.id);
  updatedMaps.push(map);
  localStorage.setItem("maps", JSON.stringify(updatedMaps));
}
export const getStoredMaps = (): SavedMap[] => {
  if (typeof window === "undefined") return []; // Prevent server-side execution
  const stored = localStorage.getItem("savedMaps");
  return stored ? JSON.parse(stored) : [];
};

export const getMapById = (mapId: string): SavedMap | null => {
  if (typeof window === "undefined") return null; // Prevent server-side execution
  const maps = getStoredMaps();
  return maps.find((map) => map.id === mapId) || null;
};

// Mock route data
const mockRoutes = [
  {
    source: "Main Entrance",
    destination: "Cafeteria",
    mapName: "Ground Floor",
    mapId: "ground-floor",
    points: [
      { x: 50, y: 300 },
      { x: 150, y: 300 },
      { x: 250, y: 280 },
      { x: 300, y: 250 },
    ],
  },
  {
    source: "Library",
    destination: "Pantry",
    mapName: "First Floor",
    mapId: "first-floor",
    points: [
      { x: 200, y: 150 },
      { x: 175, y: 175 },
      { x: 150, y: 200 },
    ],
  },
  {
    source: "Washrooms",
    destination: "Store",
    mapName: "Ground Floor",
    mapId: "ground-floor",
    points: [
      { x: 100, y: 150 },
      { x: 175, y: 165 },
      { x: 250, y: 180 },
    ],
  },
];

// Helper functions
export const getLocationGif = (locationId: string): string => {
  const gifMap: Record<string, string> = {
    "zone-a": "/gifs/zone-a.gif",
    "zone-g": "/gifs/zone-g.gif",
    "meeting-room-34": "/gifs/meeting-room.gif",
    washrooms: "/gifs/campus-overview.gif",
    "lost-found": "/gifs/lost-found.gif",
    pantry: "/gifs/pantry.gif",
    cafeteria: "/gifs/cafeteria.gif",
    store: "/gifs/store.gif",
    reception: "/gifs/reception.gif",
    "conference-hall": "/gifs/conference-hall.gif",
    "it-support": "/gifs/it-support.gif",
    "hr-department": "/gifs/hr-department.gif",
    "executive-offices": "/gifs/executive-offices.gif",
    "training-center": "/gifs/training-center.gif",
    "recreation-area": "/gifs/recreation-area.gif",
  };

  return gifMap[locationId] || "/gifs/default.gif";
};

export const getFloorGif = (floorNumber: number): string => {
  // Return static path for floor image
  return Flor0; // Maps to /public/gifs/floor-0.jpeg
};

export const searchMapPaths = (
  source: string,
  destination: string
): RouteSearchResult | null => {
  try {
    const route = mockRoutes.find(
      (r) =>
        r.source.toLowerCase().includes(source.toLowerCase()) &&
        r.destination.toLowerCase().includes(destination.toLowerCase())
    );

    if (route) {
      return {
        map: {
          id: route.mapId,
          name: route.mapName,
          imageUrl: Flor0, // Use static path
        },
        path: {
          id: `${route.source}-${route.destination}`,
          points: route.points,
          source: route.source,
          destination: route.destination,
          mapId: route.mapId,
          estimatedTime: "5-10 minutes",
        },
      };
    }

    return null;
  } catch (error) {
    console.error("Error searching map paths:", error);
    return null;
  }
};

export const getAllAvailableRoutes = () => {
  try {
    return mockRoutes.map((route) => ({
      source: route.source,
      destination: route.destination,
      mapName: route.mapName,
      mapId: route.mapId,
    }));
  } catch (error) {
    console.error("Error getting available routes:", error);
    return [];
  }
};

export const getLocationById = (id: string): Location | undefined => {
  return locations.find((location) => location.id === id);
};

export const getLocationsByFloor = (floorNumber: number): Location[] => {
  return locations.filter((location) => location.floor === floorNumber);
};

export const searchLocations = (query: string): Location[] => {
  if (!query.trim()) return [];

  return locations.filter(
    (location) =>
      location.name.toLowerCase().includes(query.toLowerCase()) ||
      location.type?.toLowerCase().includes(query.toLowerCase())
  );
};
