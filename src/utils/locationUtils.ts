import { TaggedLocation } from "@/components/LocationTagger";
import { Path } from "@/types/map-editor";
import { Floor } from "@/types/building";

export const getAvailableLocationsForBuilding = (
  tags: TaggedLocation[],
  paths: Path[]
): string[] => {
  return [
    ...new Set([
      ...tags.map((tag) => tag.name),
      ...paths.flatMap((path) => [path.source, path.destination]),
    ]),
  ];
};

export const getAvailableLocationsForFloor = (
  tags: TaggedLocation[],
  paths: Path[],
  selectedFloor: Floor | null
): string[] => {
  const currentFloorTags = selectedFloor?.id
    ? tags.filter((tag) => tag.floorId === selectedFloor.id || !tag.floorId)
    : tags;

  const tagLocations = currentFloorTags.map((tag) => tag.name);
  const pathLocations = paths.flatMap((path) => [path.source, path.destination]);
  
  return [...new Set([...tagLocations, ...pathLocations])];
};

export const filterTagsByFloor = (
  tags: TaggedLocation[],
  selectedFloor: Floor | null
): TaggedLocation[] => {
  return tags.filter(
    (tag) =>
      !selectedFloor?.id ||
      tag.floorId === selectedFloor.id ||
      !tag.floorId
  );
};
