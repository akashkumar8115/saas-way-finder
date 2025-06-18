import { Path } from "@/types/map-editor";
import { TaggedLocation } from "@/components/LocationTagger";
import { VerticalConnector } from "@/components/VerticalConnectorTagger";
import { Building, Floor } from "@/types/building";
import { saveMapToStorage, SavedMap } from "@/lib/data";
import {
  addVerticalConnector,
  updateVerticalConnector,
  removeVerticalConnector,
} from "@/lib/buildingData";
import { createSingleFloorPath, createMultiFloorPath } from "@/utils/pathUtils";

export const useMapEditorActions = (
  paths: Path[],
  setPaths: (paths: Path[]) => void,
  tags: TaggedLocation[],
  setTags: (tags: TaggedLocation[]) => void,
  verticalConnectors: VerticalConnector[],
  setVerticalConnectors: (connectors: VerticalConnector[]) => void,
  selectedBuilding: Building | null,
  selectedFloor: Floor | null
) => {
  const handleSavePath = (
    source: string,
    destination: string,
    currentPath: { x: number; y: number }[],
    selectedPath: Path | null,
    isCreatingMultiFloorPath: boolean,
    multiFloorPathSegments: any[],
    onComplete: () => void
  ) => {
    if (currentPath.length === 0 && multiFloorPathSegments.length === 0) return;

    const pathId = selectedPath?.id || Date.now().toString();

    let newPath: Path;

    if (isCreatingMultiFloorPath && multiFloorPathSegments.length > 0) {
      newPath = createMultiFloorPath(
        pathId,
        source,
        destination,
        currentPath,
        multiFloorPathSegments,
        tags,
        selectedFloor,
        selectedPath
      );
      console.log("Saved multi-floor path with", newPath.segments?.length, "segments");
    } else {
      newPath = createSingleFloorPath(
        pathId,
        source,
        destination,
        currentPath,
        tags,
        selectedFloor,
        selectedPath
      );
      console.log("Saved single-floor path");
    }

    if (selectedPath) {
      const updatedPath = {
        ...newPath,
        source: source || selectedPath.source,
        destination: destination || selectedPath.destination,
        name:
          source && destination
            ? `${source} to ${destination}`
            : selectedPath.name,
      };
      setPaths(paths.map((p) => (p.id === pathId ? updatedPath : p)));
    } else {
      setPaths([...paths, newPath]);
    }

    onComplete();
  };

  const handleEditPath = (
    path: Path,
    setCurrentPath: (path: { x: number; y: number }[]) => void,
    setSelectedPath: (path: Path) => void,
    setIsEditMode: (mode: boolean) => void,
    setIsDesignMode: (mode: boolean) => void,
    setIsPreviewMode: (mode: boolean) => void,
    setUndoStack: (stack: { x: number; y: number }[][]) => void,
    onFloorChange: (floor: Floor, imageUrl: string) => void,
    setIsCreatingMultiFloorPath: (creating: boolean) => void,
    setMultiFloorPathSegments: (segments: any[]) => void
  ) => {
    setSelectedPath(path);

    if (path.isMultiFloor && path.segments) {
      // Handle multi-floor path editing
      setIsCreatingMultiFloorPath(true);
      setMultiFloorPathSegments(path.segments.slice(0, -1));
      setCurrentPath([...path.segments[path.segments.length - 1].points]);

      // Switch to the floor of the last segment
      const lastSegment = path.segments[path.segments.length - 1];
      const targetFloor = selectedBuilding?.floors.find(
        (f) => f.id === lastSegment.floorId
      );
      if (targetFloor) {
        onFloorChange(targetFloor, targetFloor.imageUrl);
      }
    } else {
      // Handle single-floor path editing
      setCurrentPath([...path.points]);

      // Switch to the path's floor if needed
      if (path.floorId && selectedFloor?.id !== path.floorId) {
        const targetFloor = selectedBuilding?.floors.find(
          (f) => f.id === path.floorId
        );
        if (targetFloor) {
          onFloorChange(targetFloor, targetFloor.imageUrl);
        }
      }
    }

    setIsDesignMode(false);
    setIsEditMode(true);
    setIsPreviewMode(false);
    setUndoStack([]);
  };

  const handleDeletePath = (pathId: string) => {
    setPaths(paths.filter((p) => p.id !== pathId));
  };

  const handlePublishMap = (
    mapImage: string | null,
    currentMapId: string | null,
    mapName: string,
    setIsPublished: (published: boolean) => void
  ) => {
    // For building mode
    if (selectedBuilding) {
      if (selectedBuilding.floors.length === 0) {
        alert("Please add at least one floor to the building before publishing");
        return;
      }

      if (paths.length === 0) {
        alert("Please create at least one path before publishing");
        return;
      }

      const savedMap: SavedMap = {
        id: selectedBuilding.id,
        name: selectedBuilding.name,
        imageUrl: selectedBuilding.floors[0]?.imageUrl || "",
        paths: paths.map((path) => ({
          id: path.id,
          name: path.name,
          source: path.source,
          destination: path.destination,
          points: path.points,
          isPublished: true,
          color: path.color,
        })),
        createdAt: new Date().toISOString(),
        isPublished: true,
      };

      saveMapToStorage(savedMap);
      setPaths(paths.map((path) => ({ ...path, isPublished: true })));
      setIsPublished(true);

      alert(`Building "${selectedBuilding.name}" has been published successfully!`);
      return;
    }

    // For single map mode
    if (!mapImage || !currentMapId) {
      alert("Please upload a map first");
      return;
    }

    if (!mapName.trim()) {
      alert("Please provide a map name before publishing");
      return;
    }

    if (paths.length === 0) {
      alert("Please create at least one path before publishing");
      return;
    }

    const savedMap: SavedMap = {
      id: currentMapId,
      name: mapName.trim(),
      imageUrl: mapImage,
      paths: paths.map((path) => ({
        id: path.id,
        name: path.name,
        source: path.source,
        destination: path.destination,
        points: path.points,
        isPublished: true,
        color: path.color,
      })),
      createdAt: new Date().toISOString(),
      isPublished: true,
    };

    saveMapToStorage(savedMap);
    setPaths(paths.map((path) => ({ ...path, isPublished: true })));
    setIsPublished(true);

    alert(`Map "${mapName}" has been published successfully!`);
  };

  // Tag management
  const handleCreateTag = (
    name: string,
    category: string,
    floorId: string | undefined,
    pendingShape: any
  ) => {
    if (pendingShape) {
      const newTag: TaggedLocation = {
        id: Date.now().toString(),
        name,
        category,
        floorId: floorId || selectedFloor?.id,
        ...pendingShape,
      };
      setTags([...tags, newTag]);
    }
  };

  const handleTagUpdate = (updatedTag: TaggedLocation) => {
    setTags(tags.map((tag) => (tag.id === updatedTag.id ? updatedTag : tag)));
  };

  const handleEditTag = (updatedTag: TaggedLocation) => {
    setTags(tags.map((tag) => (tag.id === updatedTag.id ? updatedTag : tag)));
  };

  const handleDeleteTag = (tagId: string) => {
    setTags(tags.filter((tag) => tag.id !== tagId));
    setPaths(
      paths.map((path) => ({
        ...path,
        sourceTagId: path.sourceTagId === tagId ? undefined : path.sourceTagId,
        destinationTagId:
          path.destinationTagId === tagId ? undefined : path.destinationTagId,
      }))
    );
  };

  const handleTagColorChange = (tagId: string, color: string) => {
    setTags(tags.map((tag) => (tag.id === tagId ? { ...tag, color } : tag)));
  };

  const handlePathColorChange = (pathId: string, color: string) => {
    setPaths(
      paths.map((path) => (path.id === pathId ? { ...path, color } : path))
    );
  };

  // Vertical connector management
  const handleCreateVerticalConnector = (
    name: string,
    type: any,
    sharedId: string,
    pendingVerticalShape: any
  ) => {
    if (pendingVerticalShape && selectedFloor) {
      const newConnector = addVerticalConnector(verticalConnectors, {
        ...pendingVerticalShape,
        name,
        type,
        sharedId,
        floorId: selectedFloor.id,
      });
      setVerticalConnectors(newConnector);
    }
  };

  const handleEditVerticalConnector = (updatedConnector: VerticalConnector) => {
    const updated = updateVerticalConnector(
      verticalConnectors,
      updatedConnector.id,
      updatedConnector
    );
    setVerticalConnectors(updated);
  };

  const handleDeleteVerticalConnector = (connectorId: string) => {
    const updated = removeVerticalConnector(verticalConnectors, connectorId);
    setVerticalConnectors(updated);
  };

  return {
    handleSavePath,
    handleEditPath,
    handleDeletePath,
    handlePublishMap,
    handleCreateTag,
    handleTagUpdate,
    handleEditTag,
    handleDeleteTag,
    handleTagColorChange,
    handlePathColorChange,
    handleCreateVerticalConnector,
    handleEditVerticalConnector,
    handleDeleteVerticalConnector,
  };
};
