export interface TaggedLocation {
  id: string;
  name: string;
  category: string;
  x: number;
  y: number;
  width: number;
  height: number;
  floorId?: string;
  logoUrl?: string;
  createdAt: string;
}

export type VerticalConnectorType = 'elevator' | 'stairs' | 'escalator' | 'emergency-exit';

export interface VerticalConnector {
  id: string;
  name: string;
  type: VerticalConnectorType;
  x: number;
  y: number;
  width: number;
  height: number;
  floorId: string;
  sharedId: string;
  createdAt: string;
}

export type ShapeType = 'rectangle' | 'circle';
