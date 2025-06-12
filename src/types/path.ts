export interface Point {
  x: number;
  y: number;
}

export interface PathSegment {
  id: string;
  floorId: string;
  points: Point[];
  order: number;
  connectorId?: string;
}

export interface Path {
  id: string;
  source: string;
  destination: string;
  points: Point[];
  isPublished: boolean;
  isMultiFloor?: boolean;
  segments?: PathSegment[];
  floorId?: string;
  buildingId?: string;
  createdAt: string;
  updatedAt: string;
}
