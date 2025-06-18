export interface PathSegment {
  id: string;
  floorId: string;
  points: { x: number; y: number }[];
  connectorId?: string;
}

export interface Path {
  id: string;
  name: string;
  source: string;
  destination: string;
  points: { x: number; y: number }[];
  isPublished: boolean;
  sourceTagId?: string;
  destinationTagId?: string;
  floorId?: string;
  color?: string;
  isMultiFloor?: boolean;
  segments?: PathSegment[];
  sourceFloorId?: string;
  destinationFloorId?: string;
}

export interface MapEditorState {
  mapImage: string | null;
  mapName: string;
  currentMapId: string | null;
  paths: Path[];
  currentPath: { x: number; y: number }[];
  undoStack: { x: number; y: number }[][];
  isDesignMode: boolean;
  isEditMode: boolean;
  isPreviewMode: boolean;
  isTagMode: boolean;
  isVerticalTagMode: boolean;
  isBuildingMode: boolean;
  selectedShapeType: "circle" | "rectangle";
  isPublished: boolean;
  selectedPath: Path | null;
  animatedPath: { x: number; y: number }[] | null;
  selectedPathForAnimation: Path | null;
}

export interface MultiFloorState {
  isCreatingMultiFloorPath: boolean;
  multiFloorPathSegments: PathSegment[];
  currentSegmentFloorId: string | null;
  pendingConnectorSelection: any | null;
  multiFloorPathSource: string;
  multiFloorPathDestination: string;
  lastConnectorInteraction: string | null;
  isConnectorPromptActive: boolean;
}

export const MAP_CONTAINER_CONFIG = {
  aspectRatio: 16 / 9,
  maxWidth: 1200,
  maxHeight: 675,
  minWidth: 800,
  minHeight: 450,
} as const;
