// Enhanced type definitions for the way-finder application

export interface Location {
  id: string;
  name: string;
  floor: number;
  coordinates?: {
    x: number;
    y: number;
  };
  type?: "room" | "facility" | "landmark" | "entrance";
  description?: string;
}

export interface AppFloor {
  number: number;
  name: string;
  imageUrl?: string;
  isActive?: boolean;
}

export interface Event {
  id: number;
  title: string;
  type: string;
  date: string;
  image: string;
  description: string;
  location?: string;
  startTime?: string;
  endTime?: string;
}

export interface MapPath {
  id: string;
  points: Array<{ x: number; y: number }>;
  source: string;
  destination: string;
  mapId: string;
  distance?: number;
  estimatedTime?: string;
  color?: string;
  isPublished?: boolean;
  sourceTagId?: string;
  destinationTagId?: string;
  floorId?: string;
  // Multi-floor support
  isMultiFloor?: boolean;
  segments?: PathSegment[];
  sourceFloorId?: string;
  destinationFloorId?: string;
}

export interface PathSegment {
  id: string;
  floorId: string;
  points: { x: number; y: number }[];
  connectorId?: string;
}

export interface TaggedLocation {
  id: string;
  name: string;
  category: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  shape: "circle" | "rectangle";
  floorId?: string;
  logoUrl?: string;
  color?: string;
  createdAt?: string;
}

export interface VerticalConnector {
  id: string;
  name: string;
  type: "elevator" | "stairs" | "escalator" | "emergency-exit";
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  shape: "circle" | "rectangle";
  floorId: string;
  sharedId: string;
  createdAt: string;
}

export interface RouteSearchResult {
  map: {
    id: string;
    name: string;
    imageUrl: string;
  };
  path: MapPath;
  alternativeRoutes?: MapPath[];
}

export interface CanvasPoint {
  x: number;
  y: number;
}

export interface MapCanvasProps {
  imageUrl: string | null;
  currentPath: CanvasPoint[];
  isDesignMode: boolean;
  isEditMode: boolean;
  isPreviewMode: boolean;
  isTagMode: boolean;
  isVerticalTagMode: boolean;
  selectedShapeType: "circle" | "rectangle";
  onCanvasClick: (x: number, y: number) => void;
  onDotDrag: (index: number, x: number, y: number) => void;
  onShapeDrawn: (
    shape: Omit<TaggedLocation, "id" | "name" | "category" | "floorId">
  ) => void;
  onVerticalShapeDrawn: (
    shape: Omit<
      VerticalConnector,
      "id" | "name" | "type" | "sharedId" | "createdAt"
    >
  ) => void;
  paths: MapPath[];
  animatedPath?: CanvasPoint[] | null;
  tags: TaggedLocation[];
  verticalConnectors: VerticalConnector[];
  onTagUpdate?: (tag: TaggedLocation) => void;
  selectedPathForAnimation?: MapPath | null;
  className?: string;
}

// Utility types
export type LoadingState = "idle" | "loading" | "success" | "error";
export type SearchMode = "location" | "route";
export type ViewMode = "map" | "list" | "grid";
export type ShapeType = "circle" | "rectangle";
