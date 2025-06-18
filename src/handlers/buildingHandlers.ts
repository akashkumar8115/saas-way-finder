import { Building, Floor } from "@/types/building";
import {
  createBuilding,
  addFloorToBuilding,
  removeFloorFromBuilding,
  reorderFloorsInBuilding,
  deleteBuilding,
} from "@/lib/buildingData";

export const useBuildingHandlers = (
  buildings: Building[],
  setBuildings: (buildings: Building[]) => void,
  selectedBuilding: Building | null,
  setSelectedBuilding: (building: Building | null) => void,
  selectedFloor: Floor | null,
  setSelectedFloor: (floor: Floor | null) => void,
  setMapImage: (image: string | null) => void
) => {
  const handleBuildingCreate = (name: string) => {
    const newBuilding = createBuilding(name);
    setBuildings([...buildings, newBuilding]);
    setSelectedBuilding(newBuilding);
  };

  const handleBuildingSelect = (building: Building) => {
    setSelectedBuilding(building);
    setSelectedFloor(building.floors.length > 0 ? building.floors[0] : null);
    if (building.floors.length > 0) {
      setMapImage(building.floors[0].imageUrl);
    }
  };

  const handleBuildingDelete = (buildingId: string) => {
    const updatedBuildings = deleteBuilding(buildings, buildingId);
    setBuildings(updatedBuildings);
    if (selectedBuilding?.id === buildingId) {
      setSelectedBuilding(null);
      setSelectedFloor(null);
      setMapImage(null);
    }
  };

  const handleFloorAdd = (
    buildingId: string,
    floor: Omit<Floor, "id" | "createdAt">
  ) => {
    const updatedBuildings = addFloorToBuilding(buildings, buildingId, floor);
    setBuildings(updatedBuildings);

    const updatedBuilding = updatedBuildings.find((b) => b.id === buildingId);
    if (updatedBuilding) {
      setSelectedBuilding(updatedBuilding);
      const newFloor =
        updatedBuilding.floors[updatedBuilding.floors.length - 1];
      setSelectedFloor(newFloor);
      setMapImage(newFloor.imageUrl);
    }
  };

  const handleFloorDelete = (buildingId: string, floorId: string) => {
    const updatedBuildings = removeFloorFromBuilding(
      buildings,
      buildingId,
      floorId
    );
    setBuildings(updatedBuildings);

    const updatedBuilding = updatedBuildings.find((b) => b.id === buildingId);
    if (updatedBuilding) {
      setSelectedBuilding(updatedBuilding);
      if (selectedFloor?.id === floorId) {
        const remainingFloors = updatedBuilding.floors;
        setSelectedFloor(
          remainingFloors.length > 0 ? remainingFloors[0] : null
        );
        setMapImage(
          remainingFloors.length > 0 ? remainingFloors[0].imageUrl : null
        );
      }
    }
  };

  const handleFloorReorder = (buildingId: string, reorderedFloors: Floor[]) => {
    const updatedBuildings = reorderFloorsInBuilding(
      buildings,
      buildingId,
      reorderedFloors
    );
    setBuildings(updatedBuildings);

    const updatedBuilding = updatedBuildings.find((b) => b.id === buildingId);
    if (updatedBuilding) {
      setSelectedBuilding(updatedBuilding);
    }
  };

  const handleFloorSelect = (
    floor: Floor,
    resetModes: () => void
  ) => {
    setSelectedFloor(floor);
    setMapImage(floor.imageUrl);
    resetModes();
  };

  return {
    handleBuildingCreate,
    handleBuildingSelect,
    handleBuildingDelete,
    handleFloorAdd,
    handleFloorDelete,
    handleFloorReorder,
    handleFloorSelect,
  };
};
