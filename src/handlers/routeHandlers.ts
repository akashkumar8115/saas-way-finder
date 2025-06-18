import { Path } from "@/types/map-editor";
import { Building, Floor } from "@/types/building";

export const useRouteHandlers = (
  selectedBuilding: Building | null,
  selectedFloor: Floor | null,
  setSelectedFloor: (floor: Floor) => void,
  setMapImage: (image: string) => void,
  setAnimatedPath: (path: { x: number; y: number }[] | null) => void,
  setSelectedPathForAnimation: (path: Path | null) => void
) => {
  const handleRouteSelect = (path: Path | null, segmentIndex?: number) => {
    if (!path) {
      setAnimatedPath(null);
      setSelectedPathForAnimation(null);
      return;
    }

    setSelectedPathForAnimation(path);

    if (
      path.isMultiFloor &&
      path.segments &&
      typeof segmentIndex === "number"
    ) {
      // Handle multi-floor path with specific segment
      const targetSegment = path.segments[segmentIndex];
      if (!targetSegment) return;

      // Switch to the segment's floor if different from current
      if (selectedFloor?.id !== targetSegment.floorId) {
        const targetFloor = selectedBuilding?.floors.find(
          (f) => f.id === targetSegment.floorId
        );
        if (targetFloor) {
          setSelectedFloor(targetFloor);
          setMapImage(targetFloor.imageUrl);

          console.log(
            `Switched to floor ${targetFloor.label} for segment ${
              segmentIndex + 1
            }`
          );
        }
      }

      // Show the specific segment
      setAnimatedPath(targetSegment.points);

      // Log navigation info
      const isFirst = segmentIndex === 0;
      const isLast = segmentIndex === path.segments.length - 1;

      if (isFirst) {
        console.log(
          `Showing first segment: ${path.source} to vertical connector`
        );
      } else if (isLast) {
        console.log(
          `Showing final segment: vertical connector to ${path.destination}`
        );
      } else {
        console.log(`Showing intermediate segment ${segmentIndex + 1}`);
      }
    } else if (path.isMultiFloor && path.segments) {
      // Handle multi-floor path - start with first segment
      const firstSegment = path.segments[0];
      if (firstSegment && selectedFloor?.id !== firstSegment.floorId) {
        // Switch to the starting floor
        const startFloor = selectedBuilding?.floors.find(
          (f) => f.id === firstSegment.floorId
        );
        if (startFloor) {
          setSelectedFloor(startFloor);
          setMapImage(startFloor.imageUrl);
        }
      }

      // Show first segment
      setAnimatedPath(firstSegment ? firstSegment.points : null);
    } else {
      // Handle single-floor path
      if (path.floorId && selectedFloor?.id !== path.floorId) {
        // Switch to the path's floor
        const pathFloor = selectedBuilding?.floors.find(
          (f) => f.id === path.floorId
        );
        if (pathFloor) {
          setSelectedFloor(pathFloor);
          setMapImage(pathFloor.imageUrl);
        }
      }

      setAnimatedPath(path.points);
    }
  };

  return { handleRouteSelect };
};
