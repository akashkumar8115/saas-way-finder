import { Path, PathSegment } from "@/types/map-editor";
import { TaggedLocation } from "@/components/LocationTagger";
import { Floor } from "@/types/building";

export const createSingleFloorPath = (
  pathId: string,
  source: string,
  destination: string,
  currentPath: { x: number; y: number }[],
  tags: TaggedLocation[],
  selectedFloor: Floor | null,
  selectedPath: Path | null
): Path => {
  const sourceTag = tags.find(
    (tag) => tag.name.toLowerCase() === source.toLowerCase()
  );
  const destinationTag = tags.find(
    (tag) => tag.name.toLowerCase() === destination.toLowerCase()
  );

  return {
    id: pathId,
    name: `${source} to ${destination}`,
    source,
    destination,
    points: [...currentPath],
    isPublished: selectedPath?.isPublished || false,
    sourceTagId: sourceTag?.id,
    destinationTagId: destinationTag?.id,
    floorId: selectedFloor?.id,
    color: selectedPath?.color,
  };
};

export const createMultiFloorPath = (
  pathId: string,
  source: string,
  destination: string,
  currentPath: { x: number; y: number }[],
  multiFloorPathSegments: PathSegment[],
  tags: TaggedLocation[],
  selectedFloor: Floor | null,
  selectedPath: Path | null
): Path => {
  const sourceTag = tags.find(
    (tag) => tag.name.toLowerCase() === source.toLowerCase()
  );
  const destinationTag = tags.find(
    (tag) => tag.name.toLowerCase() === destination.toLowerCase()
  );

  // Add final segment
  const finalSegment: PathSegment = {
    id: Date.now().toString(),
    floorId: selectedFloor?.id || "",
    points: [...currentPath],
  };

  const allSegments = [...multiFloorPathSegments, finalSegment];

  return {
    id: pathId,
    name: `${source} to ${destination}`,
    source,
    destination,
    points: [], // Empty for multi-floor paths
    isPublished: selectedPath?.isPublished || false,
    sourceTagId: sourceTag?.id,
    destinationTagId: destinationTag?.id,
    floorId: selectedFloor?.id,
    color: selectedPath?.color,
    isMultiFloor: true,
    segments: allSegments,
    sourceFloorId: allSegments[0]?.floorId,
    destinationFloorId: allSegments[allSegments.length - 1]?.floorId,
  };
};

export const filterPathsByFloor = (
  paths: Path[],
  selectedFloor: Floor | null
): Path[] => {
  return paths.filter((path) => {
    if (path.isMultiFloor && path.segments) {
      return path.segments.some(
        (segment) => segment.floorId === selectedFloor?.id
      );
    }
    return (
      !selectedFloor?.id ||
      path.floorId === selectedFloor.id ||
      !path.floorId
    );
  });
};

export const getPathsForDisplay = (
  paths: Path[],
  selectedFloor: Floor | null,
  isDesignMode: boolean,
  isEditMode: boolean,
  isPreviewMode: boolean,
  selectedPathForAnimation: Path | null,
  animatedPath: { x: number; y: number }[] | null
): Path[] => {
  const floorFilteredPaths = filterPathsByFloor(paths, selectedFloor);

  // In design/edit mode: show ALL paths (published and unpublished)
  if (isDesignMode || isEditMode) {
    return floorFilteredPaths;
  }

  // In preview mode: show only selected/animated path, and only if it's published
  if (isPreviewMode) {
    if (selectedPathForAnimation && animatedPath) {
      return floorFilteredPaths.filter(
        (path) =>
          path.id === selectedPathForAnimation.id && path.isPublished
      );
    }
    return []; // Show no paths if nothing is selected in preview
  }

  // Default: show published paths only
  return floorFilteredPaths.filter((path) => path.isPublished);
};
