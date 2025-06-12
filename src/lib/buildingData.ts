
import { Building, Floor } from '@/types/building';
import { VerticalConnector } from '@/components/VerticalConnectorTagger';

const BUILDINGS_STORAGE_KEY = 'wayfinder_buildings';
const VERTICAL_CONNECTORS_STORAGE_KEY = 'wayfinder_vertical_connectors';

// Building management functions
export const saveBuildingsToStorage = (buildings: Building[]): void => {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem("buildings", JSON.stringify(buildings));
  } catch (error) {
    console.error("Error saving buildings to storage:", error);
  }
};

export const loadBuildingsFromStorage = (): Building[] => {
  if (typeof window === "undefined") return [];
  
  try {
    const saved = localStorage.getItem("buildings");
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Error loading buildings from storage:", error);
    return [];
  }
};

// Vertical connector management functions
export const saveVerticalConnectorsToStorage = (connectors: VerticalConnector[]): void => {
  try {
    localStorage.setItem(VERTICAL_CONNECTORS_STORAGE_KEY, JSON.stringify(connectors));
  } catch (error) {
    console.error('Failed to save vertical connectors to storage:', error);
  }
};

export const loadVerticalConnectorsFromStorage = (): VerticalConnector[] => {
  try {
    const stored = localStorage.getItem(VERTICAL_CONNECTORS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load vertical connectors from storage:', error);
    return [];
  }
};

export const createBuilding = (name: string, address: string, description: string): Building => {
  return {
    id: generateId(),
    name,
    address,
    description,
    floors: [],
    createdAt: new Date().toISOString()
  };
};

export const createFloor = (label: string, order: number, imageUrl: string): Floor => {
  return {
    id: Date.now().toString(),
    label,
    order,
    imageUrl,
    createdAt: new Date().toISOString()
  };
};

export const createVerticalConnector = (
  name: string,
  type: string,
  sharedId: string,
  shape: 'circle' | 'rectangle',
  x: number,
  y: number,
  floorId: string,
  radius?: number,
  width?: number,
  height?: number
): VerticalConnector => {
  return {
    id: Date.now().toString(),
    name,
    type: type as any,
    sharedId,
    shape,
    x,
    y,
    radius,
    width,
    height,
    floorId,
    createdAt: new Date().toISOString()
  };
};

export const addFloorToBuilding = (
  buildings: Building[],
  buildingId: string,
  floor: Omit<Floor, "id" | "createdAt">
): Building[] => {
  return buildings.map((building) => {
    if (building.id === buildingId) {
      const newFloor: Floor = {
        ...floor,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      return {
        ...building,
        floors: [...building.floors, newFloor],
      };
    }
    return building;
  });
};

export const removeFloorFromBuilding = (
  buildings: Building[],
  buildingId: string,
  floorId: string
): Building[] => {
  return buildings.map((building) => {
    if (building.id === buildingId) {
      return {
        ...building,
        floors: building.floors.filter((floor) => floor.id !== floorId),
      };
    }
    return building;
  });
};

export const reorderFloorsInBuilding = (
  buildings: Building[],
  buildingId: string,
  reorderedFloors: Floor[]
): Building[] => {
  return buildings.map((building) => {
    if (building.id === buildingId) {
      return {
        ...building,
        floors: reorderedFloors,
      };
    }
    return building;
  });
};

export const deleteBuilding = (
  buildings: Building[],
  buildingId: string
): Building[] => {
  return buildings.filter((building) => building.id !== buildingId);
};

// Vertical connector operations
export const addVerticalConnector = (
  connectors: VerticalConnector[],
  connector: Omit<VerticalConnector, 'id' | 'createdAt'>
): VerticalConnector[] => {
  const newConnector = createVerticalConnector(
    connector.name,
    connector.type,
    connector.sharedId,
    connector.shape,
    connector.x,
    connector.y,
    connector.floorId,
    connector.radius,
    connector.width,
    connector.height
  );
  return [...connectors, newConnector];
};

export const updateVerticalConnector = (
  connectors: VerticalConnector[],
  connectorId: string,
  updates: Partial<VerticalConnector>
): VerticalConnector[] => {
  return connectors.map(connector =>
    connector.id === connectorId ? { ...connector, ...updates } : connector
  );
};

export const removeVerticalConnector = (
  connectors: VerticalConnector[],
  connectorId: string
): VerticalConnector[] => {
  return connectors.filter(connector => connector.id !== connectorId);
};

export const getConnectorsByFloor = (
  connectors: VerticalConnector[],
  floorId: string
): VerticalConnector[] => {
  return connectors.filter(connector => connector.floorId === floorId);
};

export const getConnectorsBySharedId = (
  connectors: VerticalConnector[],
  sharedId: string
): VerticalConnector[] => {
  return connectors.filter(connector => connector.sharedId === sharedId);
};

export const validateVerticalConnector = (
  connectors: VerticalConnector[],
  sharedId: string
): boolean => {
  const matchingConnectors = getConnectorsBySharedId(connectors, sharedId);
  return matchingConnectors.length >= 2; // Must exist on at least 2 floors
};


export const updateBuilding = (
  buildings: Building[],
  buildingId: string,
  updates: { name?: string; address?: string; description?: string }
): Building[] => {
  return buildings.map((building) => {
    if (building.id === buildingId) {
      return {
        ...building,
        ...updates,
      };
    }
    return building;
  });
};

export const updateFloorInBuilding = (
  buildings: Building[],
  buildingId: string,
  floorId: string,
  updates: { label?: string; order?: number; imageUrl?: string }
): Building[] => {
  return buildings.map((building) => {
    if (building.id === buildingId) {
      return {
        ...building,
        floors: building.floors.map((floor) => {
          if (floor.id === floorId) {
            return {
              ...floor,
              ...updates,
            };
          }
          return floor;
        }),
      };
    }
    return building;
  });
};






const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};


