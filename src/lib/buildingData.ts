
import { Building, Floor } from '@/types/building';
import { VerticalConnector } from '@/components/VerticalConnectorTagger';
import { toast } from "react-hot-toast";

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

// Building API Functions
export const createBuilding = async (name: string, address: string, description: string): Promise<Building | null> => {
  try {
    const response = await fetch("/api/building/createBuilding", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, address, description }),
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      toast.error(data.message || "Failed to create building");
      return null;
    }

    toast.success("Building created successfully");
    return data.data;
  } catch (error) {
    console.error("Error creating building:", error);
    toast.error("Failed to create building");
    return null;
  }
};


export const loadBuildingsFromAPI = async (
  statusFilter: string = 'active',
  skip: number = 0,
  limit?: number
): Promise<Building[]> => {
  try {
    const queryParams = new URLSearchParams({
      status_filter: statusFilter,
      skip: skip.toString(),
    });

    if (limit) {
      queryParams.append('limit', limit.toString());
    }

    const response = await fetch(`/api/building/getAllBuildings?${queryParams.toString()}`, {
      method: "GET",
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Failed to fetch buildings:", data.message);
      return [];
    }

    const buildings = data.data || [];

    // Fetch floors for each building
    const buildingsWithFloors = await Promise.all(
      buildings.map(async (building: Building) => {
        try {
          const floors = await getFloorsByBuildingId(building.building_id);
          return {
            ...building,
            floors: floors || []
          };
        } catch (error) {
          console.error(`Error fetching floors for building ${building.building_id}:`, error);
          return {
            ...building,
            floors: []
          };
        }
      })
    );

    return buildingsWithFloors;
  } catch (error) {
    console.error("Error fetching buildings:", error);
    return [];
  }
};


export const loadBuildingsFromStorage = loadBuildingsFromAPI;


export const createFloor = (label: string, order: number, imageUrl: string, building_id: string, status: string): Floor => {
  return {
    // id: Date.now().toString(),
    // label,
    // order,
    // imageUrl,
    // createdAt: new Date().toISOString()
    floor_id: Date.now().toString(),
    label,
    order,
    imageUrl,
    building_id,
    datetime: new Date().getTime(),
    status,
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

// Update the addFloorToBuilding function
export const addFloorToBuilding = async (
  buildingId: string,
  floor: Omit<Floor, "floor_id" | "datetime" | "status" | "building_id">
): Promise<Floor | null> => {
  try {
    const response = await fetch("/api/floor/createFloor", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        building_id: buildingId,
        label: floor.label,
        order: floor.order,
        imageUrl: floor.imageUrl,
      }),
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      toast.error(data.message || "Failed to add floor");
      return null;
    }

    toast.success("Floor added successfully");
    return data.data;
  } catch (error) {
    console.error("Error adding floor:", error);
    toast.error("Failed to add floor");
    return null;
  }
};


// export const removeFloorFromBuilding = async (

//   buildingId: string,
//   floorId: string
// ): Promise<boolean> => {
//   try {
//     const response = await fetch("/api/floor/deleteFloor", {
//       method: "DELETE",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         floor_id: floorId,
//         building_id: buildingId,
//       }),
//       credentials: "include",
//     });

//     const data = await response.json();

//     if (!response.ok) {
//       toast.error(data.message || "Failed to delete floor");
//       return false;
//     }

//     toast.success("Floor deleted successfully");
//     return true;
//   } catch (error) {
//     console.error("Error deleting floor:", error);
//     toast.error("Failed to delete floor");
//     return false;
//   }
// };



// The removeFloorFromBuilding function looks correct, just ensure it uses the right endpoint


export const removeFloorFromBuilding = async (
  buildingId: string,
  floorId: string
): Promise<boolean> => {
  try {
    const response = await fetch("/api/floor/deleteFloor", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        floor_id: floorId,
        building_id: buildingId,
      }),
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      toast.error(data.message || "Failed to delete floor");
      return false;
    }

    toast.success("Floor deleted successfully");
    return true;
  } catch (error) {
    console.error("Error deleting floor:", error);
    toast.error("Failed to delete floor");
    return false;
  }
};


export const reorderFloorsInBuilding = async (
  buildingId: string,
  reorderedFloors: Floor[]
): Promise<Floor[] | null> => {
  try {
    const response = await fetch("/api/floor/reorderFloors", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        building_id: buildingId,
        floors: reorderedFloors.map((floor, index) => ({
          floor_id: floor.floor_id,
          order: index + 1,
        })),
      }),
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      toast.error(data.message || "Failed to reorder floors");
      return null;
    }

    toast.success("Floors reordered successfully");
    return data.data;
  } catch (error) {
    console.error("Error reordering floors:", error);
    toast.error("Failed to reorder floors");
    return null;
  }
};

export const deleteBuilding = async (buildingId: string): Promise<boolean> => {
  try {
    const response = await fetch("/api/building/deleteBuilding", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ building_id: buildingId }),
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      toast.error(data.message || "Failed to delete building");
      return false;
    }

    toast.success("Building deleted successfully");
    return true;
  } catch (error) {
    console.error("Error deleting building:", error);
    toast.error("Failed to delete building");
    return false;
  }
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


export const updateBuilding = async (
  buildingId: string,
  updates: { name?: string; address?: string; description?: string }
): Promise<Building | null> => {
  try {
    const response = await fetch("/api/building/updateBuilding", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ building_id: buildingId, ...updates }),
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      toast.error(data.message || "Failed to update building");
      return null;
    }

    toast.success("Building updated successfully");
    return data.data;
  } catch (error) {
    console.error("Error updating building:", error);
    toast.error("Failed to update building");
    return null;
  }
};


export const updateFloorInBuilding = async (
  buildingId: string,
  floorId: string,
  updates: { label?: string; order?: number; imageUrl?: string; description?: string; status?: string }
): Promise<Floor | null> => {
  try {
    if (updates.label === undefined || updates.order === undefined) {
      toast.error("Floor name and floor number are required");
      return null;
    }

    const requestBody = {
      floor_id: floorId,
      building_id: buildingId,
      label: updates.label,
      order: updates.order,
      imageUrl: updates.imageUrl,
      description: updates.description,
      status: updates.status || "active"
    };

    const response = await fetch("/api/floor/updateFloor", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Update floor error:", data);
      toast.error(data.message || "Failed to update floor");
      return null;
    }

    toast.success("Floor updated successfully");
    return data.data;
  } catch (error) {
    console.error("Error updating floor:", error);
    toast.error("Failed to update floor");
    return null;
  }
};

export const getBuildingById = async (buildingId: string): Promise<Building | null> => {
  try {
    const response = await fetch(`/api/building/getBuilding/${buildingId}`, {
      method: "GET",
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Failed to fetch building:", data.message);
      return null;
    }

    return data.data;
  } catch (error) {
    console.error("Error fetching building:", error);
    return null;
  }
};


export const getFloorsByBuildingId = async (
  buildingId: string,
  statusFilter: string = 'active',
  includeLocationsCount: boolean = true,
  limit?: number,
  skip: number = 0
): Promise<Floor[]> => {
  try {
    const queryParams = new URLSearchParams({
      buildingId: buildingId,
      status_filter: statusFilter,
      include_locations_count: includeLocationsCount.toString(),
      skip: skip.toString(),
    });

    if (limit) {
      queryParams.append('limit', limit.toString());
    }

    const response = await fetch(
      `/api/floor/getFloorByBuildingId?${queryParams.toString()}`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Failed to fetch floors:", data.message);
      return [];
    }

    return data.data?.floors || [];
  } catch (error) {
    console.error("Error fetching floors:", error);
    return [];
  }
};





// Export helper function for data transformation if needed
export const transformBuildingData = (apiBuilding: any): Building => {
  return {
    building_id: apiBuilding.building_id,
    name: apiBuilding.name,
    address: apiBuilding.address || "",
    description: apiBuilding.description || "",
    floors: apiBuilding.floors || [],
    created_by: apiBuilding.created_by,
    datetime: apiBuilding.datetime,
    status: apiBuilding.status,
  };
};

export const transformFloorData = (apiFloor: any): Floor => {
  return {
    floor_id: apiFloor.floor_id,
    label: apiFloor.label,
    order: apiFloor.order,
    imageUrl: apiFloor.imageUrl,
    building_id: apiFloor.building_id,
    datetime: apiFloor.datetime,
    status: apiFloor.status,
  };
};



