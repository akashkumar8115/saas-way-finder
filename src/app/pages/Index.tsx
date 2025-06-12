// "use client";

// import React, { useState, useEffect } from "react";
// import { MapCanvas } from "@/components/MapCanvas";
// import { Toolbar } from "@/components/Toolbar";
// import { PathManager } from "@/components/PathManager";
// import { RouteSearch } from "@/components/RouteSearch";
// import { MapUpload } from "@/components/MapUpload";
// import { LocationTagger, TaggedLocation } from "@/components/LocationTagger";
// import { TagCreationDialog } from "@/components/TagCreationDialog";
// import { ColorCustomizer } from "@/components/ColorCustomizer";
// import // AppFloor,
// // Location,
// // Connector,
// // PathSegment,
// // CanvasPoint,
// "../../types";

// import {
//   Navigation,
//   MapPin,
//   Route,
//   Building as BuildingIcon,
// } from "lucide-react";
// import { saveMapToStorage, SavedMap } from "@/lib/data";
// import { Input } from "@/components/ui/Input";
// import { Button } from "@/components/ui/Button";
// import Link from "next/link";
// import { BuildingManager } from "@/components/BuildingManager";
// import { FloorSelector } from "@/components/FloorSelector";
// import { Building, Floor } from "@/types/building";
// import {
//   loadBuildingsFromStorage,
//   saveBuildingsToStorage,
//   createBuilding,
//   addFloorToBuilding,
//   removeFloorFromBuilding,
//   reorderFloorsInBuilding,
//   deleteBuilding,
//   loadVerticalConnectorsFromStorage,
//   saveVerticalConnectorsToStorage,
//   addVerticalConnector,
//   updateVerticalConnector,
//   removeVerticalConnector,
// } from "@/lib/buildingData"
// import {
//   VerticalConnectorTagger,
//   VerticalConnector,
// } from "@/components/VerticalConnectorTagger";
// import { VerticalConnectorCreationDialog } from "@/components/VerticalConnectorCreationDialog";
// // import {
// //   loadVerticalConnectorsFromStorage,
// //   saveVerticalConnectorsToStorage,
// //   addVerticalConnector,
// //   updateVerticalConnector,
// //   removeVerticalConnector,
// // } from "@/lib/buildingData";

// interface PathSegment {
//   id: string;
//   floorId: string;
//   points: { x: number; y: number }[];
//   connectorId?: string; // ID of the vertical connector this segment connects to
// }

// interface Path {
//   id: string;
//   name: string;
//   source: string;
//   destination: string;
//   points: { x: number; y: number }[];
//   isPublished: boolean;
//   sourceTagId?: string;
//   destinationTagId?: string;
//   floorId?: string;
//   color?: string;
//   // Multi-floor support
//   isMultiFloor?: boolean;
//   segments?: PathSegment[];
//   sourceFloorId?: string;
//   destinationFloorId?: string;
// }

// // Standardized map container dimensions - same as Main.tsx
// const MAP_CONTAINER_CONFIG = {
//   aspectRatio: 16 / 9,
//   maxWidth: 1200,
//   maxHeight: 675, // 1200 * (9/16)
//   minWidth: 800,
//   minHeight: 450, // 800 * (9/16)
// };

// const Index = () => {
//   const [mapImage, setMapImage] = useState<string | null>(null);
//   const [mapName, setMapName] = useState<string>("");
//   const [currentMapId, setCurrentMapId] = useState<string | null>(null);
//   const [paths, setPaths] = useState<Path[]>([]);
//   const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>(
//     []
//   );
//   const [undoStack, setUndoStack] = useState<{ x: number; y: number }[][]>([]);
//   const [isDesignMode, setIsDesignMode] = useState(false);
//   const [isEditMode, setIsEditMode] = useState(false);
//   const [isPreviewMode, setIsPreviewMode] = useState(false);
//   const [isTagMode, setIsTagMode] = useState(false);
//   const [selectedShapeType, setSelectedShapeType] = useState<
//     "circle" | "rectangle"
//   >("circle");
//   const [isPublished, setIsPublished] = useState(false);
//   const [selectedPath, setSelectedPath] = useState<Path | null>(null);
//   const [animatedPath, setAnimatedPath] = useState<
//     { x: number; y: number }[] | null
//   >(null);
//   const [tags, setTags] = useState<TaggedLocation[]>([]);
//   const [pendingShape, setPendingShape] = useState<Omit<
//     TaggedLocation,
//     "id" | "name" | "category" | "floorId"
//   > | null>(null);
//   const [showTagDialog, setShowTagDialog] = useState(false);

//   // New state for selected path in preview mode
//   const [selectedPathForAnimation, setSelectedPathForAnimation] =
//     useState<Path | null>(null);

//   // New state for building management
//   const [buildings, setBuildings] = useState<Building[]>([]);
//   const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(
//     null
//   );
//   const [selectedFloor, setSelectedFloor] = useState<Floor | null>(null);
//   const [isBuildingMode, setIsBuildingMode] = useState(false);

//   // New state for vertical connectors
//   const [verticalConnectors, setVerticalConnectors] = useState<
//     VerticalConnector[]
//   >([]);
//   const [isVerticalTagMode, setIsVerticalTagMode] = useState(false);
//   const [pendingVerticalShape, setPendingVerticalShape] = useState<Omit<
//     VerticalConnector,
//     "id" | "name" | "type" | "sharedId" | "createdAt"
//   > | null>(null);
//   const [showVerticalConnectorDialog, setShowVerticalConnectorDialog] =
//     useState(false);

//   // New state for multi-floor path creation
//   const [isCreatingMultiFloorPath, setIsCreatingMultiFloorPath] =
//     useState(false);
//   const [multiFloorPathSegments, setMultiFloorPathSegments] = useState<
//     PathSegment[]
//   >([]);
//   const [currentSegmentFloorId, setCurrentSegmentFloorId] = useState<
//     string | null
//   >(null);
//   // const [setCurrentSegmentFloorId] = useState<string | null>(null);
//   const [pendingConnectorSelection, setPendingConnectorSelection] =
//     useState<VerticalConnector | null>(null);
//   const [multiFloorPathSource, setMultiFloorPathSource] = useState<string>("");
//   const [multiFloorPathDestination, setMultiFloorPathDestination] =
//     useState<string>("");

//   // New state for tracking connector interactions
//   const [lastConnectorInteraction, setLastConnectorInteraction] = useState<
//     string | null
//   >(null);
//   const [isConnectorPromptActive, setIsConnectorPromptActive] = useState(false);

//   // Load buildings on component mount
//   useEffect(() => {
//     const savedBuildings = loadBuildingsFromStorage();
//     setBuildings(savedBuildings);
//   }, []);

//   // Save buildings whenever they change
//   useEffect(() => {
//     saveBuildingsToStorage(buildings);
//   }, [buildings]);

//   // Load vertical connectors on component mount
//   useEffect(() => {
//     const savedConnectors = loadVerticalConnectorsFromStorage();
//     setVerticalConnectors(savedConnectors);
//   }, []);

//   // Save vertical connectors whenever they change
//   useEffect(() => {
//     saveVerticalConnectorsToStorage(verticalConnectors);
//   }, [verticalConnectors]);

//   const handleImageUpload = (imageUrl: string) => {
//     setMapImage(imageUrl);
//     setIsDesignMode(false);
//     setIsEditMode(false);
//     setIsPreviewMode(false);
//     setIsTagMode(false);
//     setIsVerticalTagMode(false);
//     setIsBuildingMode(false);
//     setCurrentPath([]);
//     setUndoStack([]);
//     setSelectedPath(null);
//     setAnimatedPath(null);
//     setIsPublished(false);
//     setPaths([]);
//     setTags([]);
//     setSelectedPathForAnimation(null);

//     // Clear building context when uploading single map
//     setSelectedBuilding(null);
//     setSelectedFloor(null);

//     // Clear multi-floor path state
//     setIsCreatingMultiFloorPath(false);
//     setMultiFloorPathSegments([]);
//     setCurrentSegmentFloorId(null);
//     setPendingConnectorSelection(null);

//     // Generate new map ID
//     setCurrentMapId(Date.now().toString());
//   };

//   const handleCanvasClick = (x: number, y: number) => {
//     if (!isDesignMode && !isEditMode) return;

//     const newPoint = { x, y };
//     setUndoStack([...undoStack, [...currentPath]]);
//     setCurrentPath([...currentPath, newPoint]);

//     // Enhanced strict connector detection for multi-floor paths
//     if (
//       (isDesignMode || isEditMode) &&
//       selectedFloor &&
//       selectedBuilding &&
//       !isConnectorPromptActive
//     ) {
//       const floorConnectors = verticalConnectors.filter(
//         (c) => c.floorId === selectedFloor.id
//       );
//       const clickedConnector = floorConnectors.find((connector) => {
//         // Calculate distance in canvas pixels for more precise detection
//         const canvasSize = { width: 1200, height: 800 }; // Use standard canvas size
//         const connectorCanvasX = connector.x * canvasSize.width;
//         const connectorCanvasY = connector.y * canvasSize.height;
//         const clickCanvasX = x * canvasSize.width;
//         const clickCanvasY = y * canvasSize.height;

//         const distance = Math.sqrt(
//           Math.pow(connectorCanvasX - clickCanvasX, 2) +
//             Math.pow(connectorCanvasY - clickCanvasY, 2)
//         );

//         // Strict threshold - only trigger if clicking very close to connector center
//         let threshold = 15; // Base threshold in pixels

//         // Adjust threshold based on connector shape and size
//         if (connector.shape === "circle" && connector.radius) {
//           threshold = Math.max(15, connector.radius * canvasSize.width * 0.8);
//         } else if (
//           connector.shape === "rectangle" &&
//           connector.width &&
//           connector.height
//         ) {
//           const avgSize =
//             (connector.width * canvasSize.width +
//               connector.height * canvasSize.height) /
//             2;
//           threshold = Math.max(15, avgSize * 0.4);
//         }

//         return distance <= threshold;
//       });

//       if (
//         clickedConnector &&
//         clickedConnector.id !== lastConnectorInteraction
//       ) {
//         console.log(
//           "Explicit click detected on connector:",
//           clickedConnector.name
//         );
//         setIsConnectorPromptActive(true);
//         handleConnectorClick(clickedConnector);
//       }
//     }
//   };

//   const handleConnectorClick = (connector: VerticalConnector) => {
//     if (!selectedFloor || !selectedBuilding) return;

//     console.log("Processing explicit connector click for:", connector.name);

//     // Find matching connectors on other floors
//     const matchingConnectors = verticalConnectors.filter(
//       (c) => c.sharedId === connector.sharedId && c.floorId !== selectedFloor.id
//     );

//     console.log("Found matching connectors:", matchingConnectors.length);

//     if (matchingConnectors.length === 0) {
//       setIsConnectorPromptActive(false);
//       alert(
//         `No matching connector "${connector.name}" found on other floors. Please ensure the connector exists on multiple floors with the same Shared ID.`
//       );
//       return;
//     }

//     // Get available floors that have this connector
//     const availableFloors = selectedBuilding.floors.filter((floor) =>
//       matchingConnectors.some((c) => c.floorId === floor.id)
//     );

//     console.log(
//       "Available floors for connection:",
//       availableFloors.map((f) => f.label)
//     );

//     if (availableFloors.length === 0) {
//       setIsConnectorPromptActive(false);
//       alert("No other floors available for this connector.");
//       return;
//     }

//     // Show confirmation modal first
//     const shouldSwitch = confirm(
//       `You've reached "${connector.name}". Do you want to continue this path on another floor?\n\nClick OK to switch floors, or Cancel to continue on the current floor.`
//     );

//     if (!shouldSwitch) {
//       setIsConnectorPromptActive(false);
//       setLastConnectorInteraction(connector.id);
//       console.log("User chose to stay on current floor");
//       return;
//     }

//     // Prompt user to select target floor
//     let selectedFloorLabel: string | null = null;

//     if (availableFloors.length === 1) {
//       // Auto-select if only one option
//       selectedFloorLabel = availableFloors[0].label;
//     } else {
//       // Show selection dialog
//       const floorOptions = availableFloors.map((f) => f.label).join("\n");
//       selectedFloorLabel = prompt(
//         `Connect to which floor via "${connector.name}"?\n\nAvailable floors:\n${floorOptions}\n\nEnter the floor name:`
//       );
//     }

//     if (selectedFloorLabel) {
//       const targetFloor = availableFloors.find(
//         (f) => f.label.toLowerCase() === selectedFloorLabel.toLowerCase()
//       );

//       if (targetFloor) {
//         handleFloorTransition(targetFloor, connector);
//       } else {
//         setIsConnectorPromptActive(false);
//         alert(`Floor "${selectedFloorLabel}" not found. Please try again.`);
//       }
//     } else {
//       setIsConnectorPromptActive(false);
//     }
//   };

//   const handleFloorTransition = (
//     targetFloor: Floor,
//     sourceConnector: VerticalConnector
//   ) => {
//     if (!selectedFloor) return;

//     console.log(
//       `Transitioning from ${selectedFloor.label} to ${targetFloor.label}`
//     );

//     // Save current segment INCLUDING the connector point as the final point
//     const pathWithConnector = [
//       ...currentPath,
//       { x: sourceConnector.x, y: sourceConnector.y },
//     ];

//     const currentSegment: PathSegment = {
//       id: Date.now().toString(),
//       floorId: selectedFloor.id,
//       points: pathWithConnector,
//       connectorId: sourceConnector.id,
//     };

//     setMultiFloorPathSegments((prev) => [...prev, currentSegment]);
//     setIsCreatingMultiFloorPath(true);

//     // Switch to target floor
//     setSelectedFloor(targetFloor);
//     setMapImage(targetFloor.imageUrl);

//     // Find matching connector on target floor
//     const targetConnector = verticalConnectors.find(
//       (c) =>
//         c.sharedId === sourceConnector.sharedId && c.floorId === targetFloor.id
//     );

//     if (targetConnector) {
//       // Start new path from the connector location on the new floor
//       setCurrentPath([{ x: targetConnector.x, y: targetConnector.y }]);
//       setCurrentSegmentFloorId(targetFloor.id);
//       setLastConnectorInteraction(targetConnector.id);
//       setIsConnectorPromptActive(false);

//       console.log(
//         `Started new path segment on ${targetFloor.label} from connector`,
//         targetConnector.name
//       );

//       // Show success message
//       setTimeout(() => {
//         alert(
//           `✅ Switched to ${targetFloor.label}.\n\nContinue your path from "${sourceConnector.name}" connector.\nYou can now place dots freely on this floor.`
//         );
//       }, 100);
//     } else {
//       setIsConnectorPromptActive(false);
//       alert(`Error: Could not find matching connector on ${targetFloor.label}`);
//     }
//   };

//   const handleDotDrag = (index: number, x: number, y: number) => {
//     if (!isEditMode) return;

//     const newPath = [...currentPath];
//     newPath[index] = { x, y };
//     setCurrentPath(newPath);
//   };

//   const handleUndo = () => {
//     if (undoStack.length > 0) {
//       const previousState = undoStack[undoStack.length - 1];
//       setCurrentPath(previousState);
//       setUndoStack(undoStack.slice(0, -1));
//     }
//   };

//   const handleShapeDrawn = (
//     shape: Omit<TaggedLocation, "id" | "name" | "category">
//   ) => {
//     setPendingShape(shape);
//     setShowTagDialog(true);
//   };

//   const handleCreateTag = (
//     name: string,
//     category: string,
//     floorId?: string
//   ) => {
//     if (pendingShape) {
//       const newTag: TaggedLocation = {
//         id: Date.now().toString(),
//         name,
//         category,
//         floorId: floorId || selectedFloor?.id,
//         ...pendingShape,
//       };
//       setTags([...tags, newTag]);
//       setPendingShape(null);
//     }
//   };

//   const handleTagUpdate = (updatedTag: TaggedLocation) => {
//     setTags(tags.map((tag) => (tag.id === updatedTag.id ? updatedTag : tag)));
//   };

//   const handleEditTag = (updatedTag: TaggedLocation) => {
//     setTags(tags.map((tag) => (tag.id === updatedTag.id ? updatedTag : tag)));
//   };

//   const handleDeleteTag = (tagId: string) => {
//     setTags(tags.filter((tag) => tag.id !== tagId));
//     setPaths(
//       paths.map((path) => ({
//         ...path,
//         sourceTagId: path.sourceTagId === tagId ? undefined : path.sourceTagId,
//         destinationTagId:
//           path.destinationTagId === tagId ? undefined : path.destinationTagId,
//       }))
//     );
//   };

//   const handleSavePath = (source: string, destination: string) => {
//     if (currentPath.length === 0 && multiFloorPathSegments.length === 0) return;

//     // Find matching tags for source and destination
//     const sourceTag = tags.find(
//       (tag) => tag.name.toLowerCase() === source.toLowerCase()
//     );
//     const destinationTag = tags.find(
//       (tag) => tag.name.toLowerCase() === destination.toLowerCase()
//     );

//     const pathId = selectedPath?.id || Date.now().toString();

//     // Handle multi-floor path
//     if (isCreatingMultiFloorPath && multiFloorPathSegments.length > 0) {
//       // Add final segment
//       const finalSegment: PathSegment = {
//         id: Date.now().toString(),
//         floorId: selectedFloor?.id || "",
//         points: [...currentPath],
//       };

//       const allSegments = [...multiFloorPathSegments, finalSegment];

//       const newPath: Path = {
//         id: pathId,
//         name: `${source} to ${destination}`,
//         source,
//         destination,
//         points: [], // Empty for multi-floor paths
//         isPublished: selectedPath?.isPublished || false,
//         sourceTagId: sourceTag?.id,
//         destinationTagId: destinationTag?.id,
//         floorId: selectedFloor?.id,
//         color: selectedPath?.color,
//         isMultiFloor: true,
//         segments: allSegments,
//         sourceFloorId: allSegments[0]?.floorId,
//         destinationFloorId: allSegments[allSegments.length - 1]?.floorId,
//       };

//       if (selectedPath) {
//         setPaths(paths.map((p) => (p.id === pathId ? newPath : p)));
//       } else {
//         setPaths([...paths, newPath]);
//       }

//       // Reset multi-floor state
//       setIsCreatingMultiFloorPath(false);
//       setMultiFloorPathSegments([]);
//       setCurrentSegmentFloorId(null);
//       setMultiFloorPathSource("");
//       setMultiFloorPathDestination("");

//       console.log(
//         "Saved multi-floor path with",
//         allSegments.length,
//         "segments"
//       );
//     } else {
//       // Handle single-floor path
//       const newPath: Path = {
//         id: pathId,
//         name: `${source} to ${destination}`,
//         source,
//         destination,
//         points: [...currentPath],
//         isPublished: selectedPath?.isPublished || false,
//         sourceTagId: sourceTag?.id,
//         destinationTagId: destinationTag?.id,
//         floorId: selectedFloor?.id,
//         color: selectedPath?.color,
//       };

//       if (selectedPath) {
//         const updatedPath = {
//           ...newPath,
//           source: source || selectedPath.source,
//           destination: destination || selectedPath.destination,
//           name:
//             source && destination
//               ? `${source} to ${destination}`
//               : selectedPath.name,
//         };

//         setPaths(paths.map((p) => (p.id === pathId ? updatedPath : p)));
//       } else {
//         setPaths([...paths, newPath]);
//       }

//       console.log("Saved single-floor path");
//     }

//     setCurrentPath([]);
//     setUndoStack([]);
//     setIsDesignMode(false);
//     setIsEditMode(false);
//     setSelectedPath(null);
//   };

//   const handleClearPath = () => {
//     setCurrentPath([]);
//     setUndoStack([]);

//     if (isCreatingMultiFloorPath) {
//       setIsCreatingMultiFloorPath(false);
//       setMultiFloorPathSegments([]);
//       setCurrentSegmentFloorId(null);
//       setMultiFloorPathSource("");
//       setMultiFloorPathDestination("");
//     }

//     // Reset connector interaction tracking
//     setLastConnectorInteraction(null);
//     setIsConnectorPromptActive(false);
//   };

//   const handleEditPath = (path: Path) => {
//     setSelectedPath(path);

//     if (path.isMultiFloor && path.segments) {
//       // Handle multi-floor path editing
//       setIsCreatingMultiFloorPath(true);
//       setMultiFloorPathSegments(path.segments.slice(0, -1)); // All but last segment
//       setCurrentPath([...path.segments[path.segments.length - 1].points]); // Last segment

//       // Switch to the floor of the last segment
//       const lastSegment = path.segments[path.segments.length - 1];
//       const targetFloor = selectedBuilding?.floors.find(
//         (f) => f.id === lastSegment.floorId
//       );
//       if (targetFloor) {
//         setSelectedFloor(targetFloor);
//         setMapImage(targetFloor.imageUrl);
//       }
//     } else {
//       // Handle single-floor path editing
//       setCurrentPath([...path.points]);

//       // Switch to the path's floor if needed
//       if (path.floorId && selectedFloor?.id !== path.floorId) {
//         const targetFloor = selectedBuilding?.floors.find(
//           (f) => f.id === path.floorId
//         );
//         if (targetFloor) {
//           setSelectedFloor(targetFloor);
//           setMapImage(targetFloor.imageUrl);
//         }
//       }
//     }

//     setIsDesignMode(false);
//     setIsEditMode(true);
//     setIsPreviewMode(false);
//     setUndoStack([]);
//   };

//   const handleDeletePath = (pathId: string) => {
//     setPaths(paths.filter((p) => p.id !== pathId));
//   };

//   const handlePublishMap = () => {
//     // For building mode, check if we have a building and floors
//     if (selectedBuilding) {
//       if (selectedBuilding.floors.length === 0) {
//         alert(
//           "Please add at least one floor to the building before publishing"
//         );
//         return;
//       }

//       if (paths.length === 0) {
//         alert("Please create at least one path before publishing");
//         return;
//       }

//       // Create a saved map for the building
//       const savedMap: SavedMap = {
//         id: selectedBuilding.id,
//         name: selectedBuilding.name,
//         imageUrl: selectedBuilding.floors[0]?.imageUrl || "",
//         paths: paths.map((path) => ({
//           id: path.id,
//           name: path.name,
//           source: path.source,
//           destination: path.destination,
//           points: path.points,
//           isPublished: true,
//           color: path.color,
//         })),
//         createdAt: new Date().toISOString(),
//         isPublished: true,
//       };

//       saveMapToStorage(savedMap);

//       // Update all paths to published status
//       setPaths(paths.map((path) => ({ ...path, isPublished: true })));

//       // Only set isPublished to true if ALL paths are now published
//       const allPathsPublished = paths.every((path) => path.isPublished);
//       if (allPathsPublished) {
//         setIsPublished(true);
//       }

//       alert(
//         `Building "${selectedBuilding.name}" has been published successfully!`
//       );
//       return;
//     }

//     // For single map mode
//     if (!mapImage || !currentMapId) {
//       alert("Please upload a map first");
//       return;
//     }

//     if (!mapName.trim()) {
//       alert("Please provide a map name before publishing");
//       return;
//     }

//     if (paths.length === 0) {
//       alert("Please create at least one path before publishing");
//       return;
//     }

//     const savedMap: SavedMap = {
//       id: currentMapId,
//       name: mapName.trim(),
//       imageUrl: mapImage,
//       paths: paths.map((path) => ({
//         id: path.id,
//         name: path.name,
//         source: path.source,
//         destination: path.destination,
//         points: path.points,
//         isPublished: true,
//         color: path.color,
//       })),
//       createdAt: new Date().toISOString(),
//       isPublished: true,
//     };

//     saveMapToStorage(savedMap);

//     // Update all paths to published status
//     setPaths(paths.map((path) => ({ ...path, isPublished: true })));

//     // Only set isPublished to true if ALL paths are now published
//     const allPathsPublished = paths.every((path) => path.isPublished);
//     if (allPathsPublished) {
//       setIsPublished(true);
//     }

//     alert(`Map "${mapName}" has been published successfully!`);
//   };

//   const toggleDesignMode = () => {
//     if (isPreviewMode || isTagMode) return;

//     const newDesignMode = !isDesignMode && !isEditMode;
//     setIsDesignMode(newDesignMode);
//     setIsEditMode(false);

//     if (!newDesignMode) {
//       setCurrentPath([]);
//       setUndoStack([]);
//       setSelectedPath(null);

//       // Reset multi-floor path state
//       if (isCreatingMultiFloorPath) {
//         setIsCreatingMultiFloorPath(false);
//         setMultiFloorPathSegments([]);
//         setCurrentSegmentFloorId(null);
//       }

//       // Reset connector interaction tracking
//       setLastConnectorInteraction(null);
//       setIsConnectorPromptActive(false);
//     } else {
//       // When entering design mode, always reset connector interaction tracking
//       setLastConnectorInteraction(null);
//       setIsConnectorPromptActive(false);
//     }
//   };

//   const startMultiFloorPath = () => {
//     setIsCreatingMultiFloorPath(true);
//     setMultiFloorPathSegments([]);
//     setCurrentSegmentFloorId(selectedFloor?.id || null);
//     setIsDesignMode(true);
//     setIsEditMode(false);
//     // Reset connector interaction tracking for multi-floor paths
//     setLastConnectorInteraction(null);
//     setIsConnectorPromptActive(false);
//     alert(
//       "Multi-floor path mode activated.\n\n• Place dots freely on the current floor\n• Click directly on vertical connectors (elevators, stairs) to switch floors\n• You will only be prompted when clicking on a connector"
//     );
//   };

//   const toggleTagMode = () => {
//     setIsTagMode(!isTagMode);
//     setIsDesignMode(false);
//     setIsEditMode(false);
//     setIsPreviewMode(false);
//     setCurrentPath([]);
//     setUndoStack([]);
//     setSelectedPath(null);
//     setAnimatedPath(null);
//     setSelectedPathForAnimation(null);
//   };

//   const togglePreviewMode = () => {
//     setIsPreviewMode(!isPreviewMode);
//     setIsDesignMode(false);
//     setIsEditMode(false);
//     setCurrentPath([]);
//     setUndoStack([]);
//     setSelectedPath(null);
//     setAnimatedPath(null);
//     setSelectedPathForAnimation(null);
//   };

//   const handleViewPublishedMap = () => {
//     setIsPreviewMode(true);
//     setIsDesignMode(false);
//     setIsEditMode(false);
//     setCurrentPath([]);
//     setSelectedPath(null);
//     setSelectedPathForAnimation(null);
//   };

//   // New building management handlers
//   const handleBuildingCreate = (name: string) => {
//     const newBuilding = createBuilding(name);
//     setBuildings([...buildings, newBuilding]);
//     setSelectedBuilding(newBuilding);
//   };

//   const handleBuildingSelect = (building: Building) => {
//     setSelectedBuilding(building);
//     setSelectedFloor(building.floors.length > 0 ? building.floors[0] : null);
//     if (building.floors.length > 0) {
//       setMapImage(building.floors[0].imageUrl);
//     }
//   };

//   const handleBuildingDelete = (buildingId: string) => {
//     const updatedBuildings = deleteBuilding(buildings, buildingId);
//     setBuildings(updatedBuildings);
//     if (selectedBuilding?.id === buildingId) {
//       setSelectedBuilding(null);
//       setSelectedFloor(null);
//       setMapImage(null);
//     }
//   };

//   const handleFloorAdd = (
//     buildingId: string,
//     floor: Omit<Floor, "id" | "createdAt">
//   ) => {
//     const updatedBuildings = addFloorToBuilding(buildings, buildingId, floor);
//     setBuildings(updatedBuildings);

//     const updatedBuilding = updatedBuildings.find((b) => b.id === buildingId);
//     if (updatedBuilding) {
//       setSelectedBuilding(updatedBuilding);
//       const newFloor =
//         updatedBuilding.floors[updatedBuilding.floors.length - 1];
//       setSelectedFloor(newFloor);
//       setMapImage(newFloor.imageUrl);
//     }
//   };

//   const handleFloorDelete = (buildingId: string, floorId: string) => {
//     const updatedBuildings = removeFloorFromBuilding(
//       buildings,
//       buildingId,
//       floorId
//     );
//     setBuildings(updatedBuildings);

//     const updatedBuilding = updatedBuildings.find((b) => b.id === buildingId);
//     if (updatedBuilding) {
//       setSelectedBuilding(updatedBuilding);
//       if (selectedFloor?.id === floorId) {
//         const remainingFloors = updatedBuilding.floors;
//         setSelectedFloor(
//           remainingFloors.length > 0 ? remainingFloors[0] : null
//         );
//         setMapImage(
//           remainingFloors.length > 0 ? remainingFloors[0].imageUrl : null
//         );
//       }
//     }
//   };

//   const handleFloorReorder = (buildingId: string, reorderedFloors: Floor[]) => {
//     const updatedBuildings = reorderFloorsInBuilding(
//       buildings,
//       buildingId,
//       reorderedFloors
//     );
//     setBuildings(updatedBuildings);

//     const updatedBuilding = updatedBuildings.find((b) => b.id === buildingId);
//     if (updatedBuilding) {
//       setSelectedBuilding(updatedBuilding);
//     }
//   };

//   const handleFloorSelect = (floor: Floor) => {
//     setSelectedFloor(floor);
//     setMapImage(floor.imageUrl);
//     setIsDesignMode(false);
//     setIsEditMode(false);
//     setIsPreviewMode(false);
//     setIsTagMode(false);
//     setIsVerticalTagMode(false);
//     setCurrentPath([]);
//     setUndoStack([]);
//     setSelectedPath(null);
//     setAnimatedPath(null);
//     setSelectedPathForAnimation(null);
//   };

//   const toggleBuildingMode = () => {
//     setIsBuildingMode(!isBuildingMode);
//     setIsDesignMode(false);
//     setIsEditMode(false);
//     setIsPreviewMode(false);
//     setIsTagMode(false);
//     setIsVerticalTagMode(false);
//   };

//   const handleBuildingManagerExit = () => {
//     setIsBuildingMode(false);
//   };

//   // New vertical connector handlers
//   const handleVerticalShapeDrawn = (
//     shape: Omit<
//       VerticalConnector,
//       "id" | "name" | "type" | "sharedId" | "createdAt"
//     >
//   ) => {
//     setPendingVerticalShape(shape);
//     setShowVerticalConnectorDialog(true);
//   };

//   const handleCreateVerticalConnector = (
//     name: string,
//     type: any,
//     sharedId: string
//   ) => {
//     if (pendingVerticalShape && selectedFloor) {
//       const newConnector = addVerticalConnector(verticalConnectors, {
//         ...pendingVerticalShape,
//         name,
//         type,
//         sharedId,
//         floorId: selectedFloor.id,
//       });
//       setVerticalConnectors(newConnector);
//       setPendingVerticalShape(null);
//     }
//   };

//   const handleEditVerticalConnector = (updatedConnector: VerticalConnector) => {
//     const updated = updateVerticalConnector(
//       verticalConnectors,
//       updatedConnector.id,
//       updatedConnector
//     );
//     setVerticalConnectors(updated);
//   };

//   const handleDeleteVerticalConnector = (connectorId: string) => {
//     const updated = removeVerticalConnector(verticalConnectors, connectorId);
//     setVerticalConnectors(updated);
//   };

//   const handleRouteSelect = (path: Path | null, segmentIndex?: number) => {
//     if (!path) {
//       setAnimatedPath(null);
//       setSelectedPathForAnimation(null);
//       return;
//     }

//     setSelectedPathForAnimation(path);

//     if (
//       path.isMultiFloor &&
//       path.segments &&
//       typeof segmentIndex === "number"
//     ) {
//       // Handle multi-floor path with specific segment
//       const targetSegment = path.segments[segmentIndex];
//       if (!targetSegment) return;

//       // Switch to the segment's floor if different from current
//       if (selectedFloor?.id !== targetSegment.floorId) {
//         const targetFloor = selectedBuilding?.floors.find(
//           (f) => f.id === targetSegment.floorId
//         );
//         if (targetFloor) {
//           setSelectedFloor(targetFloor);
//           setMapImage(targetFloor.imageUrl);

//           console.log(
//             `Switched to floor ${targetFloor.label} for segment ${
//               segmentIndex + 1
//             }`
//           );
//         }
//       }

//       // Show the specific segment
//       setAnimatedPath(targetSegment.points);

//       // Log navigation info
//       const isFirst = segmentIndex === 0;
//       const isLast = segmentIndex === path.segments.length - 1;

//       if (isFirst) {
//         console.log(
//           `Showing first segment: ${path.source} to vertical connector`
//         );
//       } else if (isLast) {
//         console.log(
//           `Showing final segment: vertical connector to ${path.destination}`
//         );
//       } else {
//         console.log(`Showing intermediate segment ${segmentIndex + 1}`);
//       }
//     } else if (path.isMultiFloor && path.segments) {
//       // Handle multi-floor path - start with first segment
//       const firstSegment = path.segments[0];
//       if (firstSegment && selectedFloor?.id !== firstSegment.floorId) {
//         // Switch to the starting floor
//         const startFloor = selectedBuilding?.floors.find(
//           (f) => f.id === firstSegment.floorId
//         );
//         if (startFloor) {
//           setSelectedFloor(startFloor);
//           setMapImage(startFloor.imageUrl);
//         }
//       }

//       // Show first segment
//       setAnimatedPath(firstSegment ? firstSegment.points : null);
//     } else {
//       // Handle single-floor path
//       if (path.floorId && selectedFloor?.id !== path.floorId) {
//         // Switch to the path's floor
//         const pathFloor = selectedBuilding?.floors.find(
//           (f) => f.id === path.floorId
//         );
//         if (pathFloor) {
//           setSelectedFloor(pathFloor);
//           setMapImage(pathFloor.imageUrl);
//         }
//       }

//       setAnimatedPath(path.points);
//     }
//   };

//   const getAvailableLocations = () => {
//     if (selectedBuilding) {
//       // In building mode, get locations from all floors
//       return [
//         ...new Set([
//           ...tags.map((tag) => tag.name),
//           ...paths.flatMap((path) => [path.source, path.destination]),
//         ]),
//       ];
//     } else {
//       // In single map mode, filter by current floor
//       const currentFloorTags = selectedFloor?.id
//         ? tags.filter((tag) => tag.floorId === selectedFloor.id || !tag.floorId)
//         : tags;

//       const tagLocations = currentFloorTags.map((tag) => tag.name);
//       const pathLocations = paths.flatMap((path) => [
//         path.source,
//         path.destination,
//       ]);
//       return [...new Set([...tagLocations, ...pathLocations])];
//     }
//   };

//   const handleTagColorChange = (tagId: string, color: string) => {
//     setTags(tags.map((tag) => (tag.id === tagId ? { ...tag, color } : tag)));
//   };

//   const handlePathColorChange = (pathId: string, color: string) => {
//     setPaths(
//       paths.map((path) => (path.id === pathId ? { ...path, color } : path))
//     );
//   };

//   const toggleVerticalTagMode = () => {
//     setIsVerticalTagMode(!isVerticalTagMode);
//     setIsDesignMode(false);
//     setIsEditMode(false);
//     setIsPreviewMode(false);
//     setIsTagMode(false);
//     setCurrentPath([]);
//     setUndoStack([]);
//     setSelectedPath(null);
//     setAnimatedPath(null);
//     setSelectedPathForAnimation(null);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
//       {/* Header */}
//       <div className="bg-white shadow-sm border-b">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex items-center justify-between h-16">
//             <div className="flex items-center space-x-3">
//               <div className="bg-blue-600 p-2 rounded-lg">
//                 <Link href="/">
//                   <Navigation className="h-6 w-6 text-white" />
//                 </Link>
//               </div>
//               <div>
//                 <h1 className="text-xl font-bold text-gray-900">Way Finder</h1>
//                 <p className="text-sm text-gray-500">
//                   {isBuildingMode
//                     ? "Building Management"
//                     : isPreviewMode
//                     ? "Preview Mode"
//                     : isTagMode
//                     ? "Location Tagging"
//                     : isVerticalTagMode
//                     ? "Vertical Connector Tagging"
//                     : isCreatingMultiFloorPath
//                     ? "Multi-Floor Path Designer"
//                     : "Interactive Path Designer"}
//                   {isPublished &&
//                     !isPreviewMode &&
//                     !isBuildingMode &&
//                     " (Published)"}
//                 </p>
//               </div>
//             </div>
//             <div className="flex items-center space-x-2 text-sm text-gray-600">
//               <MapPin className="h-4 w-4" />
//               <span>
//                 {selectedBuilding ? `${selectedBuilding.name} • ` : ""}
//                 {paths.length} paths • {tags.length} tags •{" "}
//                 {
//                   verticalConnectors.filter(
//                     (c) => c.floorId === selectedFloor?.id
//                   ).length
//                 }{" "}
//                 vertical connectors
//               </span>
//               {isPublished && (
//                 <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
//                   Published
//                 </span>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//         {!mapImage && !isBuildingMode ? (
//           <div className="text-center py-12">
//             <div className="max-w-md mx-auto">
//               <div className="bg-blue-100 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
//                 <Route className="h-10 w-10 text-blue-600" />
//               </div>
//               <h2 className="text-2xl font-bold text-gray-900 mb-4">
//                 Start Creating Your Wayfinding Map
//               </h2>
//               <p className="text-gray-600 mb-8">
//                 Upload a single map or manage multi-floor buildings
//               </p>
//               <div className="flex space-x-4">
//                 <MapUpload onImageUpload={handleImageUpload} />
//                 <Button
//                   onClick={toggleBuildingMode}
//                   // variant="outline"
//                   className="mt-4"
//                 >
//                   <BuildingIcon className="h-4 w-4 mr-2" />
//                   Manage Buildings
//                 </Button>
//               </div>
//             </div>
//           </div>
//         ) : isBuildingMode ? (
//           <div className="max-w-4xl mx-auto">
//             <BuildingManager
//               buildings={buildings}
//               selectedBuilding={selectedBuilding}
//               onBuildingSelect={handleBuildingSelect}
//               onBuildingCreate={handleBuildingCreate}
//               onBuildingDelete={handleBuildingDelete}
//               onFloorAdd={handleFloorAdd}
//               onFloorDelete={handleFloorDelete}
//               onFloorReorder={handleFloorReorder}
//               onExit={handleBuildingManagerExit}
//             />
//             <div className="mt-6 text-center">
//               <Button
//                 onClick={toggleBuildingMode}
//                 // variant="outline"
//               >
//                 Back to Map Editor
//               </Button>
//             </div>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
//             {/* Main Canvas Area */}
//             <div className="lg:col-span-3">
//               <div className="bg-white rounded-xl shadow-lg overflow-hidden">
//                 {/* Building/Floor Info */}
//                 {selectedBuilding && selectedFloor && (
//                   <div className="p-4 border-b bg-gray-50">
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <h3 className="font-medium text-gray-900">
//                           {selectedBuilding.name}
//                         </h3>
//                         <p className="text-sm text-gray-500">
//                           Current floor: {selectedFloor.label}
//                         </p>
//                         {isCreatingMultiFloorPath && (
//                           <p className="text-sm text-blue-600 font-medium">
//                             Multi-floor path mode active • Click near connectors
//                             to switch floors
//                           </p>
//                         )}
//                       </div>
//                       <div className="flex space-x-2">
//                         <Button
//                           // variant="outline"
//                           // size="sm"
//                           onClick={toggleBuildingMode}
//                         >
//                           <BuildingIcon className="h-4 w-4 mr-2" />
//                           Manage Building
//                         </Button>
//                         {selectedBuilding.floors.length > 1 &&
//                           !isCreatingMultiFloorPath &&
//                           (isDesignMode || isEditMode) && (
//                             <Button
//                               // variant="outline"
//                               // size="sm"
//                               onClick={startMultiFloorPath}
//                             >
//                               Multi-Floor Path
//                             </Button>
//                           )}
//                         <div className="w-48">
//                           <FloorSelector
//                             floors={selectedBuilding.floors}
//                             selectedFloor={selectedFloor}
//                             onFloorSelect={handleFloorSelect}
//                           />
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {!isPublished && !selectedBuilding && (
//                   <div className="p-4 border-b bg-gray-50">
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Map Name
//                     </label>
//                     <Input
//                       placeholder="Enter map name (e.g., Office Building Floor 1)"
//                       value={mapName}
//                       onChange={(e) => setMapName(e.target.value)}
//                       className="max-w-md"
//                     />
//                   </div>
//                 )}

//                 <Toolbar
//                   isDesignMode={isDesignMode}
//                   isEditMode={isEditMode}
//                   isPreviewMode={isPreviewMode}
//                   isTagMode={isTagMode}
//                   isVerticalTagMode={isVerticalTagMode}
//                   isPublished={isPublished}
//                   onToggleDesignMode={toggleDesignMode}
//                   onToggleTagMode={toggleTagMode}
//                   onToggleVerticalTagMode={toggleVerticalTagMode}
//                   onTogglePreviewMode={togglePreviewMode}
//                   onViewPublishedMap={handleViewPublishedMap}
//                   onUndo={handleUndo}
//                   onRedo={() => {}}
//                   onClearPath={handleClearPath}
//                   onSavePath={handleSavePath}
//                   onPublishMap={handlePublishMap}
//                   canUndo={undoStack.length > 0}
//                   hasCurrentPath={currentPath.length > 0}
//                   availableLocations={getAvailableLocations()}
//                   selectedPath={selectedPath}
//                 />

//                 {/* Standardized Map Container */}
//                 <div
//                   className="flex items-center justify-center p-4 bg-gray-50"
//                   style={{
//                     minHeight: `${MAP_CONTAINER_CONFIG.minHeight + 32}px`,
//                     maxHeight: `${MAP_CONTAINER_CONFIG.maxHeight + 32}px`,
//                   }}
//                 >
//                   <div
//                     className="w-full flex items-center justify-center"
//                     style={{
//                       maxWidth: `${MAP_CONTAINER_CONFIG.maxWidth}px`,
//                       aspectRatio: `${MAP_CONTAINER_CONFIG.aspectRatio}`,
//                     }}
//                   >
//                     <MapCanvas
//                       imageUrl={mapImage}
//                       currentPath={currentPath}
//                       isDesignMode={isDesignMode}
//                       isEditMode={isEditMode}
//                       isPreviewMode={isPreviewMode}
//                       isTagMode={isTagMode}
//                       isVerticalTagMode={isVerticalTagMode}
//                       selectedShapeType={selectedShapeType}
//                       onCanvasClick={handleCanvasClick}
//                       onDotDrag={handleDotDrag}
//                       onShapeDrawn={handleShapeDrawn}
//                       onVerticalShapeDrawn={handleVerticalShapeDrawn}
//                       paths={(() => {
//                         // Filter paths based on current floor
//                         const floorFilteredPaths = paths.filter((path) => {
//                           if (path.isMultiFloor && path.segments) {
//                             return path.segments.some(
//                               (segment) => segment.floorId === selectedFloor?.id
//                             );
//                           }
//                           return (
//                             !selectedFloor?.id ||
//                             path.floorId === selectedFloor.id ||
//                             !path.floorId
//                           );
//                         });

//                         // In design/edit mode: show ALL paths (published and unpublished)
//                         if (isDesignMode || isEditMode) {
//                           return floorFilteredPaths;
//                         }

//                         // In preview mode: show only selected/animated path, and only if it's published
//                         if (isPreviewMode) {
//                           if (selectedPathForAnimation && animatedPath) {
//                             return floorFilteredPaths.filter(
//                               (path) =>
//                                 path.id === selectedPathForAnimation.id &&
//                                 path.isPublished
//                             );
//                           }
//                           return []; // Show no paths if nothing is selected in preview
//                         }

//                         // Default: show published paths only
//                         return floorFilteredPaths.filter(
//                           (path) => path.isPublished
//                         );
//                       })()}
//                       animatedPath={animatedPath}
//                       tags={tags.filter(
//                         (tag) =>
//                           !selectedFloor?.id ||
//                           tag.floorId === selectedFloor.id ||
//                           !tag.floorId
//                       )}
//                       verticalConnectors={verticalConnectors.filter(
//                         (c) => c.floorId === selectedFloor?.id
//                       )}
//                       onTagUpdate={handleTagUpdate}
//                       selectedPathForAnimation={selectedPathForAnimation}
//                     />
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Sidebar */}
//             <div className="lg:col-span-1 space-y-4">
//               {isPreviewMode ? (
//                 <RouteSearch
//                   paths={paths.filter((p) => p.isPublished)}
//                   onRouteSelect={handleRouteSelect}
//                   availableLocations={getAvailableLocations()}
//                 />
//               ) : isTagMode ? (
//                 <>
//                   <LocationTagger
//                     isTagMode={isTagMode}
//                     selectedShapeType={selectedShapeType}
//                     onShapeTypeChange={setSelectedShapeType}
//                     tags={tags}
//                     onEditTag={handleEditTag}
//                     onDeleteTag={handleDeleteTag}
//                     currentFloorId={selectedFloor?.id}
//                   />
//                   {tags.filter(
//                     (tag) =>
//                       !selectedFloor?.id ||
//                       tag.floorId === selectedFloor.id ||
//                       !tag.floorId
//                   ).length > 0 && (
//                     <ColorCustomizer
//                       tags={tags.filter(
//                         (tag) =>
//                           !selectedFloor?.id ||
//                           tag.floorId === selectedFloor.id ||
//                           !tag.floorId
//                       )}
//                       paths={[]}
//                       onTagColorChange={handleTagColorChange}
//                       onPathColorChange={handlePathColorChange}
//                     />
//                   )}
//                 </>
//               ) : isVerticalTagMode ? (
//                 <>
//                   <VerticalConnectorTagger
//                     isVerticalTagMode={isVerticalTagMode}
//                     selectedShapeType={selectedShapeType}
//                     onShapeTypeChange={setSelectedShapeType}
//                     connectors={verticalConnectors}
//                     onEditConnector={handleEditVerticalConnector}
//                     onDeleteConnector={handleDeleteVerticalConnector}
//                     currentFloorId={selectedFloor?.id || ""}
//                   />
//                 </>
//               ) : (
//                 <>
//                   <PathManager
//                     paths={paths}
//                     onEditPath={handleEditPath}
//                     onDeletePath={handleDeletePath}
//                   />
//                   {(tags.filter(
//                     (tag) =>
//                       !selectedFloor?.id ||
//                       tag.floorId === selectedFloor.id ||
//                       !tag.floorId
//                   ).length > 0 ||
//                     paths.length > 0) && (
//                     <ColorCustomizer
//                       tags={tags.filter(
//                         (tag) =>
//                           !selectedFloor?.id ||
//                           tag.floorId === selectedFloor.id ||
//                           !tag.floorId
//                       )}
//                       paths={paths}
//                       onTagColorChange={handleTagColorChange}
//                       onPathColorChange={handlePathColorChange}
//                     />
//                   )}
//                 </>
//               )}
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Tag Creation Dialog */}
//       <TagCreationDialog
//         isOpen={showTagDialog}
//         onClose={() => {
//           setShowTagDialog(false);
//           setPendingShape(null);
//         }}
//         onSave={handleCreateTag}
//         currentFloorId={selectedFloor?.id}
//       />

//       {/* Vertical Connector Creation Dialog */}
//       <VerticalConnectorCreationDialog
//         isOpen={showVerticalConnectorDialog}
//         onClose={() => {
//           setShowVerticalConnectorDialog(false);
//           setPendingVerticalShape(null);
//         }}
//         onSave={handleCreateVerticalConnector}
//       />
//     </div>
//   );
// };

// export default Index;









"use client";

import React, { useState, useEffect } from "react";
import { MapCanvas } from "@/components/MapCanvas";
import { Toolbar } from "@/components/Toolbar";
import { PathManager } from "@/components/PathManager";
import { RouteSearch } from "@/components/RouteSearch";
import { MapUpload } from "@/components/MapUpload";
import { LocationTagger, TaggedLocation } from "@/components/LocationTagger";
import { TagCreationDialog } from "@/components/TagCreationDialog";
import { ColorCustomizer } from "@/components/ColorCustomizer";

import {
  Navigation,
  MapPin,
  Route,
  Building as BuildingIcon,
} from "lucide-react";
import { saveMapToStorage, SavedMap } from "@/lib/data";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { FloorSelector } from "@/components/FloorSelector";
import { Building, Floor } from "@/types/building";
import {
  loadBuildingsFromStorage,
  loadVerticalConnectorsFromStorage,
  saveVerticalConnectorsToStorage,
  addVerticalConnector,
  updateVerticalConnector,
  removeVerticalConnector,
} from "@/lib/buildingData"
import {
  VerticalConnectorTagger,
  VerticalConnector,
} from "@/components/VerticalConnectorTagger";
import { VerticalConnectorCreationDialog } from "@/components/VerticalConnectorCreationDialog";

interface PathSegment {
  id: string;
  floorId: string;
  points: { x: number; y: number }[];
  connectorId?: string;
}

interface Path {
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

const MAP_CONTAINER_CONFIG = {
  aspectRatio: 16 / 9,
  maxWidth: 1200,
  maxHeight: 675,
  minWidth: 800,
  minHeight: 450,
};

const Index = () => {
  const [mapImage, setMapImage] = useState<string | null>(null);
  const [mapName, setMapName] = useState<string>("");
  const [currentMapId, setCurrentMapId] = useState<string | null>(null);
  const [paths, setPaths] = useState<Path[]>([]);
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);
  const [undoStack, setUndoStack] = useState<{ x: number; y: number }[][]>([]);
  const [isDesignMode, setIsDesignMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isTagMode, setIsTagMode] = useState(false);
  const [selectedShapeType, setSelectedShapeType] = useState<"circle" | "rectangle">("circle");
  const [isPublished, setIsPublished] = useState(false);
  const [selectedPath, setSelectedPath] = useState<Path | null>(null);
  const [animatedPath, setAnimatedPath] = useState<{ x: number; y: number }[] | null>(null);
  const [tags, setTags] = useState<TaggedLocation[]>([]);
  const [pendingShape, setPendingShape] = useState<Omit<TaggedLocation, "id" | "name" | "category" | "floorId"> | null>(null);
  const [showTagDialog, setShowTagDialog] = useState(false);
  const [selectedPathForAnimation, setSelectedPathForAnimation] = useState<Path | null>(null);

  // Building-related state (read-only for floor selection)
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<Floor | null>(null);

  // Vertical connectors state
  const [verticalConnectors, setVerticalConnectors] = useState<VerticalConnector[]>([]);
  const [isVerticalTagMode, setIsVerticalTagMode] = useState(false);
  const [pendingVerticalShape, setPendingVerticalShape] = useState<Omit<VerticalConnector, "id" | "name" | "type" | "sharedId" | "createdAt"> | null>(null);
  const [showVerticalConnectorDialog, setShowVerticalConnectorDialog] = useState(false);

  // Multi-floor path state
  const [isCreatingMultiFloorPath, setIsCreatingMultiFloorPath] = useState(false);
  const [multiFloorPathSegments, setMultiFloorPathSegments] = useState<PathSegment[]>([]);
  const [currentSegmentFloorId, setCurrentSegmentFloorId] = useState<string | null>(null);
  const [pendingConnectorSelection, setPendingConnectorSelection] = useState<VerticalConnector | null>(null);
  const [multiFloorPathSource, setMultiFloorPathSource] = useState<string>("");
  const [multiFloorPathDestination, setMultiFloorPathDestination] = useState<string>("");
  const [lastConnectorInteraction, setLastConnectorInteraction] = useState<string | null>(null);
  const [isConnectorPromptActive, setIsConnectorPromptActive] = useState(false);

  // Load buildings on component mount (read-only)
  useEffect(() => {
    const savedBuildings = loadBuildingsFromStorage();
    setBuildings(savedBuildings);
  }, []);

  // Load vertical connectors on component mount
  useEffect(() => {
    const savedConnectors = loadVerticalConnectorsFromStorage();
    setVerticalConnectors(savedConnectors);
  }, []);

  // Save vertical connectors whenever they change
  useEffect(() => {
    saveVerticalConnectorsToStorage(verticalConnectors);
  }, [verticalConnectors]);

  const handleImageUpload = (imageUrl: string) => {
    setMapImage(imageUrl);
    setIsDesignMode(false);
    setIsEditMode(false);
    setIsPreviewMode(false);
    setIsTagMode(false);
    setIsVerticalTagMode(false);
    setCurrentPath([]);
    setUndoStack([]);
    setSelectedPath(null);
    setAnimatedPath(null);
    setIsPublished(false);
    setPaths([]);
    setTags([]);
    setSelectedPathForAnimation(null);

    // Clear building context when uploading single map
    setSelectedBuilding(null);
    setSelectedFloor(null);

    // Clear multi-floor path state
    setIsCreatingMultiFloorPath(false);
    setMultiFloorPathSegments([]);
    setCurrentSegmentFloorId(null);
    setPendingConnectorSelection(null);

    // Generate new map ID
    setCurrentMapId(Date.now().toString());
  };

  // Building selection handlers (simplified - no management functionality)
  const handleBuildingSelect = (building: Building) => {
    setSelectedBuilding(building);
    setSelectedFloor(building.floors.length > 0 ? building.floors[0] : null);
    if (building.floors.length > 0) {
      setMapImage(building.floors[0].imageUrl);
    }
    // Clear current work when switching buildings
    setCurrentPath([]);
    setUndoStack([]);
    setSelectedPath(null);
    setAnimatedPath(null);
    setSelectedPathForAnimation(null);
    setIsDesignMode(false);
    setIsEditMode(false);
    setIsPreviewMode(false);
    setIsTagMode(false);
    setIsVerticalTagMode(false);
  };

  const handleFloorSelect = (floor: Floor) => {
    setSelectedFloor(floor);
    setMapImage(floor.imageUrl);
    setIsDesignMode(false);
    setIsEditMode(false);
    setIsPreviewMode(false);
    setIsTagMode(false);
    setIsVerticalTagMode(false);
    setCurrentPath([]);
    setUndoStack([]);
    setSelectedPath(null);
    setAnimatedPath(null);
    setSelectedPathForAnimation(null);
  };


  const handleCanvasClick = (x: number, y: number) => {
    if (!isDesignMode && !isEditMode) return;

    const newPoint = { x, y };
    setUndoStack([...undoStack, [...currentPath]]);
    setCurrentPath([...currentPath, newPoint]);

    // Enhanced strict connector detection for multi-floor paths
    if (
      (isDesignMode || isEditMode) &&
      selectedFloor &&
      selectedBuilding &&
      !isConnectorPromptActive
    ) {
      const floorConnectors = verticalConnectors.filter(
        (c) => c.floorId === selectedFloor.id
      );
      const clickedConnector = floorConnectors.find((connector) => {
        const canvasSize = { width: 1200, height: 800 };
        const connectorCanvasX = connector.x * canvasSize.width;
        const connectorCanvasY = connector.y * canvasSize.height;
        const clickCanvasX = x * canvasSize.width;
        const clickCanvasY = y * canvasSize.height;

        const distance = Math.sqrt(
          Math.pow(connectorCanvasX - clickCanvasX, 2) +
            Math.pow(connectorCanvasY - clickCanvasY, 2)
        );

        let threshold = 15;

        if (connector.shape === "circle" && connector.radius) {
          threshold = Math.max(15, connector.radius * canvasSize.width * 0.8);
        } else if (
          connector.shape === "rectangle" &&
          connector.width &&
          connector.height
        ) {
          const avgSize =
            (connector.width * canvasSize.width +
              connector.height * canvasSize.height) /
            2;
          threshold = Math.max(15, avgSize * 0.4);
        }

        return distance <= threshold;
      });

      if (
        clickedConnector &&
        clickedConnector.id !== lastConnectorInteraction
      ) {
        console.log(
          "Explicit click detected on connector:",
          clickedConnector.name
        );
        setIsConnectorPromptActive(true);
        handleConnectorClick(clickedConnector);
      }
    }
  };

  const handleConnectorClick = (connector: VerticalConnector) => {
    if (!selectedFloor || !selectedBuilding) return;

    console.log("Processing explicit connector click for:", connector.name);

    const matchingConnectors = verticalConnectors.filter(
      (c) => c.sharedId === connector.sharedId && c.floorId !== selectedFloor.id
    );

    console.log("Found matching connectors:", matchingConnectors.length);

    if (matchingConnectors.length === 0) {
      setIsConnectorPromptActive(false);
      alert(
        `No matching connector "${connector.name}" found on other floors. Please ensure the connector exists on multiple floors with the same Shared ID.`
      );
      return;
    }

    const availableFloors = selectedBuilding.floors.filter((floor) =>
      matchingConnectors.some((c) => c.floorId === floor.id)
    );

    console.log(
      "Available floors for connection:",
      availableFloors.map((f) => f.label)
    );

    if (availableFloors.length === 0) {
      setIsConnectorPromptActive(false);
      alert("No other floors available for this connector.");
      return;
    }

    const shouldSwitch = confirm(
      `You've reached "${connector.name}". Do you want to continue this path on another floor?\n\nClick OK to switch floors, or Cancel to continue on the current floor.`
    );

    if (!shouldSwitch) {
      setIsConnectorPromptActive(false);
      setLastConnectorInteraction(connector.id);
      console.log("User chose to stay on current floor");
      return;
    }

    let selectedFloorLabel: string | null = null;

    if (availableFloors.length === 1) {
      selectedFloorLabel = availableFloors[0].label;
    } else {
      const floorOptions = availableFloors.map((f) => f.label).join("\n");
      selectedFloorLabel = prompt(
        `Connect to which floor via "${connector.name}"?\n\nAvailable floors:\n${floorOptions}\n\nEnter the floor name:`
      );
    }

    if (selectedFloorLabel) {
      const targetFloor = availableFloors.find(
        (f) => f.label.toLowerCase() === selectedFloorLabel.toLowerCase()
      );

      if (targetFloor) {
        handleFloorTransition(targetFloor, connector);
      } else {
        setIsConnectorPromptActive(false);
        alert(`Floor "${selectedFloorLabel}" not found. Please try again.`);
      }
    } else {
      setIsConnectorPromptActive(false);
    }
  };

  const handleFloorTransition = (
    targetFloor: Floor,
    sourceConnector: VerticalConnector
  ) => {
    if (!selectedFloor) return;

    console.log(
      `Transitioning from ${selectedFloor.label} to ${targetFloor.label}`
    );

    const pathWithConnector = [
      ...currentPath,
      { x: sourceConnector.x, y: sourceConnector.y },
    ];

    const currentSegment: PathSegment = {
      id: Date.now().toString(),
      floorId: selectedFloor.id,
      points: pathWithConnector,
      connectorId: sourceConnector.id,
    };

    setMultiFloorPathSegments((prev) => [...prev, currentSegment]);
    setIsCreatingMultiFloorPath(true);

    setSelectedFloor(targetFloor);
    setMapImage(targetFloor.imageUrl);

    const targetConnector = verticalConnectors.find(
      (c) =>
        c.sharedId === sourceConnector.sharedId && c.floorId === targetFloor.id
    );

    if (targetConnector) {
      setCurrentPath([{ x: targetConnector.x, y: targetConnector.y }]);
      setCurrentSegmentFloorId(targetFloor.id);
      setLastConnectorInteraction(targetConnector.id);
      setIsConnectorPromptActive(false);

      console.log(
        `Started new path segment on ${targetFloor.label} from connector`,
        targetConnector.name
      );

      setTimeout(() => {
        alert(
          `✅ Switched to ${targetFloor.label}.\n\nContinue your path from "${sourceConnector.name}" connector.\nYou can now place dots freely on this floor.`
        );
      }, 100);
    } else {
      setIsConnectorPromptActive(false);
      alert(`Error: Could not find matching connector on ${targetFloor.label}`);
    }
  };

  const handleDotDrag = (index: number, x: number, y: number) => {
    if (!isEditMode) return;

    const newPath = [...currentPath];
    newPath[index] = { x, y };
    setCurrentPath(newPath);
  };

  const handleUndo = () => {
    if (undoStack.length > 0) {
      const previousState = undoStack[undoStack.length - 1];
      setCurrentPath(previousState);
      setUndoStack(undoStack.slice(0, -1));
    }
  };

  const handleShapeDrawn = (
    shape: Omit<TaggedLocation, "id" | "name" | "category">
  ) => {
    setPendingShape(shape);
    setShowTagDialog(true);
  };

  const handleCreateTag = (
    name: string,
    category: string,
    floorId?: string
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
      setPendingShape(null);
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

  const handleSavePath = (source: string, destination: string) => {
    if (currentPath.length === 0 && multiFloorPathSegments.length === 0) return;

    const sourceTag = tags.find(
      (tag) => tag.name.toLowerCase() === source.toLowerCase()
    );
    const destinationTag = tags.find(
      (tag) => tag.name.toLowerCase() === destination.toLowerCase()
    );

    const pathId = selectedPath?.id || Date.now().toString();

    if (isCreatingMultiFloorPath && multiFloorPathSegments.length > 0) {
      const finalSegment: PathSegment = {
        id: Date.now().toString(),
        floorId: selectedFloor?.id || "",
        points: [...currentPath],
      };

      const allSegments = [...multiFloorPathSegments, finalSegment];

      const newPath: Path = {
        id: pathId,
        name: `${source} to ${destination}`,
        source,
        destination,
        points: [],
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

      if (selectedPath) {
        setPaths(paths.map((p) => (p.id === pathId ? newPath : p)));
      } else {
        setPaths([...paths, newPath]);
      }

      setIsCreatingMultiFloorPath(false);
      setMultiFloorPathSegments([]);
      setCurrentSegmentFloorId(null);
      setMultiFloorPathSource("");
      setMultiFloorPathDestination("");

      console.log(
        "Saved multi-floor path with",
        allSegments.length,
        "segments"
      );
    } else {
      const newPath: Path = {
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

      console.log("Saved single-floor path");
    }

    setCurrentPath([]);
    setUndoStack([]);
    setIsDesignMode(false);
    setIsEditMode(false);
    setSelectedPath(null);
  };

  const handleClearPath = () => {
    setCurrentPath([]);
    setUndoStack([]);

    if (isCreatingMultiFloorPath) {
      setIsCreatingMultiFloorPath(false);
      setMultiFloorPathSegments([]);
      setCurrentSegmentFloorId(null);
      setMultiFloorPathSource("");
      setMultiFloorPathDestination("");
    }

    setLastConnectorInteraction(null);
    setIsConnectorPromptActive(false);
  };

  const handleEditPath = (path: Path) => {
    setSelectedPath(path);

    if (path.isMultiFloor && path.segments) {
      setIsCreatingMultiFloorPath(true);
      setMultiFloorPathSegments(path.segments.slice(0, -1));
      setCurrentPath([...path.segments[path.segments.length - 1].points]);

      const lastSegment = path.segments[path.segments.length - 1];
      const targetFloor = selectedBuilding?.floors.find(
        (f) => f.id === lastSegment.floorId
      );
      if (targetFloor) {
        setSelectedFloor(targetFloor);
        setMapImage(targetFloor.imageUrl);
      }
    } else {
      setCurrentPath([...path.points]);

      if (path.floorId && selectedFloor?.id !== path.floorId) {
        const targetFloor = selectedBuilding?.floors.find(
          (f) => f.id === path.floorId
        );
        if (targetFloor) {
          setSelectedFloor(targetFloor);
          setMapImage(targetFloor.imageUrl);
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




  const handlePublishMap = () => {
    if (selectedBuilding) {
      if (selectedBuilding.floors.length === 0) {
        alert(
          "Please add at least one floor to the building before publishing"
        );
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

      const allPathsPublished = paths.every((path) => path.isPublished);
      if (allPathsPublished) {
        setIsPublished(true);
      }

      alert(
        `Building "${selectedBuilding.name}" has been published successfully!`
      );
      return;
    }

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

    const allPathsPublished = paths.every((path) => path.isPublished);
    if (allPathsPublished) {
      setIsPublished(true);
    }

    alert(`Map "${mapName}" has been published successfully!`);
  };

  const toggleDesignMode = () => {
    if (isPreviewMode || isTagMode) return;

    const newDesignMode = !isDesignMode && !isEditMode;
    setIsDesignMode(newDesignMode);
    setIsEditMode(false);

    if (!newDesignMode) {
      setCurrentPath([]);
      setUndoStack([]);
      setSelectedPath(null);

      if (isCreatingMultiFloorPath) {
        setIsCreatingMultiFloorPath(false);
        setMultiFloorPathSegments([]);
        setCurrentSegmentFloorId(null);
      }

      setLastConnectorInteraction(null);
      setIsConnectorPromptActive(false);
    } else {
      setLastConnectorInteraction(null);
      setIsConnectorPromptActive(false);
    }
  };

  const startMultiFloorPath = () => {
    setIsCreatingMultiFloorPath(true);
    setMultiFloorPathSegments([]);
    setCurrentSegmentFloorId(selectedFloor?.id || null);
    setIsDesignMode(true);
    setIsEditMode(false);
    setLastConnectorInteraction(null);
    setIsConnectorPromptActive(false);
    alert(
      "Multi-floor path mode activated.\n\n• Place dots freely on the current floor\n• Click directly on vertical connectors (elevators, stairs) to switch floors\n• You will only be prompted when clicking on a connector"
    );
  };

  const toggleTagMode = () => {
    setIsTagMode(!isTagMode);
    setIsDesignMode(false);
    setIsEditMode(false);
    setIsPreviewMode(false);
    setCurrentPath([]);
    setUndoStack([]);
    setSelectedPath(null);
    setAnimatedPath(null);
    setSelectedPathForAnimation(null);
  };

  const togglePreviewMode = () => {
    setIsPreviewMode(!isPreviewMode);
    setIsDesignMode(false);
    setIsEditMode(false);
    setCurrentPath([]);
    setUndoStack([]);
    setSelectedPath(null);
    setAnimatedPath(null);
    setSelectedPathForAnimation(null);
  };

  const handleViewPublishedMap = () => {
    setIsPreviewMode(true);
    setIsDesignMode(false);
    setIsEditMode(false);
    setCurrentPath([]);
    setSelectedPath(null);
    setSelectedPathForAnimation(null);
  };

  const handleVerticalShapeDrawn = (
    shape: Omit<
      VerticalConnector,
      "id" | "name" | "type" | "sharedId" | "createdAt"
    >
  ) => {
    setPendingVerticalShape(shape);
    setShowVerticalConnectorDialog(true);
  };

  const handleCreateVerticalConnector = (
    name: string,
    type: any,
    sharedId: string
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
      setPendingVerticalShape(null);
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
      const targetSegment = path.segments[segmentIndex];
      if (!targetSegment) return;

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

      setAnimatedPath(targetSegment.points);

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
      const firstSegment = path.segments[0];
      if (firstSegment && selectedFloor?.id !== firstSegment.floorId) {
        const startFloor = selectedBuilding?.floors.find(
          (f) => f.id === firstSegment.floorId
        );
        if (startFloor) {
          setSelectedFloor(startFloor);
          setMapImage(startFloor.imageUrl);
        }
      }

      setAnimatedPath(firstSegment ? firstSegment.points : null);
    } else {
      if (path.floorId && selectedFloor?.id !== path.floorId) {
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

  const getAvailableLocations = () => {
    if (selectedBuilding) {
      return [
        ...new Set([
          ...tags.map((tag) => tag.name),
          ...paths.flatMap((path) => [path.source, path.destination]),
        ]),
      ];
    } else {
      const currentFloorTags = selectedFloor?.id
        ? tags.filter((tag) => tag.floorId === selectedFloor.id || !tag.floorId)
        : tags;

      const tagLocations = currentFloorTags.map((tag) => tag.name);
      const pathLocations = paths.flatMap((path) => [
        path.source,
        path.destination,
      ]);
      return [...new Set([...tagLocations, ...pathLocations])];
    }
  };

  const handleTagColorChange = (tagId: string, color: string) => {
    setTags(tags.map((tag) => (tag.id === tagId ? { ...tag, color } : tag)));
  };

  const handlePathColorChange = (pathId: string, color: string) => {
    setPaths(
      paths.map((path) => (path.id === pathId ? { ...path, color } : path))
    );
  };

  const toggleVerticalTagMode = () => {
    setIsVerticalTagMode(!isVerticalTagMode);
    setIsDesignMode(false);
    setIsEditMode(false);
    setIsPreviewMode(false);
    setIsTagMode(false);
    setCurrentPath([]);
    setUndoStack([]);
    setSelectedPath(null);
    setAnimatedPath(null);
    setSelectedPathForAnimation(null);
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Link href="/">
                  <Navigation className="h-6 w-6 text-white" />
                </Link>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Way Finder</h1>
                <p className="text-sm text-gray-500">
                  {isPreviewMode
                    ? "Preview Mode"
                    : isTagMode
                    ? "Location Tagging"
                    : isVerticalTagMode
                    ? "Vertical Connector Tagging"
                    : isCreatingMultiFloorPath
                    ? "Multi-Floor Path Designer"
                    : "Interactive Path Designer"}
                  {isPublished &&
                    !isPreviewMode &&
                    " (Published)"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>
                {selectedBuilding ? `${selectedBuilding.name} • ` : ""}
                {paths.length} paths • {tags.length} tags •{" "}
                {
                  verticalConnectors.filter(
                    (c) => c.floorId === selectedFloor?.id
                  ).length
                }{" "}
                vertical connectors
              </span>
              {isPublished && (
                <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                  Published
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!mapImage ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="bg-blue-100 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <Route className="h-10 w-10 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Start Creating Your Wayfinding Map
              </h2>
              <p className="text-gray-600 mb-8">
                Upload a single map or select from existing buildings
              </p>
              <div className="flex flex-col space-y-4">
                <MapUpload onImageUpload={handleImageUpload} />
                
                {/* Building Selection */}
                {buildings.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Or select an existing building:
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {buildings.map((building) => (
                        <div
                          key={building.id}
                          className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => handleBuildingSelect(building)}
                        >
                          <div className="flex items-center space-x-3">
                            <BuildingIcon className="h-8 w-8 text-blue-600" />
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {building.name}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {building.floors.length} floors
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mt-6">
                  <Link href="/manage-buildings">
                    <Button className="w-full">
                      <BuildingIcon className="h-4 w-4 mr-2" />
                      Manage Buildings
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Canvas Area */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Building/Floor Info */}
                {selectedBuilding && selectedFloor && (
                  <div className="p-4 border-b bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {selectedBuilding.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Current floor: {selectedFloor.label}
                        </p>
                        {isCreatingMultiFloorPath && (
                          <p className="text-sm text-blue-600 font-medium">
                            Multi-floor path mode active • Click near connectors
                            to switch floors
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Link href="/manage-buildings">
                          <Button
                            variant="outline"
                            size="sm"
                          >
                            <BuildingIcon className="h-4 w-4 mr-2" />
                            Manage Building
                          </Button>
                        </Link>
                        {selectedBuilding.floors.length > 1 &&
                          !isCreatingMultiFloorPath &&
                          (isDesignMode || isEditMode) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={startMultiFloorPath}
                            >
                              Multi-Floor Path
                            </Button>
                          )}
                        <div className="w-48">
                          <FloorSelector
                            floors={selectedBuilding.floors}
                            selectedFloor={selectedFloor}
                            onFloorSelect={handleFloorSelect}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {!isPublished && !selectedBuilding && (
                  <div className="p-4 border-b bg-gray-50">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Map Name
                    </label>
                    <Input
                      placeholder="Enter map name (e.g., Office Building Floor 1)"
                      value={mapName}
                      onChange={(e) => setMapName(e.target.value)}
                      className="max-w-md"
                    />
                  </div>
                )}

                <Toolbar
                  isDesignMode={isDesignMode}
                  isEditMode={isEditMode}
                  isPreviewMode={isPreviewMode}
                  isTagMode={isTagMode}
                  isVerticalTagMode={isVerticalTagMode}
                  isPublished={isPublished}
                  onToggleDesignMode={toggleDesignMode}
                  onToggleTagMode={toggleTagMode}
                  onToggleVerticalTagMode={toggleVerticalTagMode}
                  onTogglePreviewMode={togglePreviewMode}
                  onViewPublishedMap={handleViewPublishedMap}
                  onUndo={handleUndo}
                  onRedo={() => {}}
                  onClearPath={handleClearPath}
                  onSavePath={handleSavePath}
                  onPublishMap={handlePublishMap}
                  canUndo={undoStack.length > 0}
                  hasCurrentPath={currentPath.length > 0}
                  availableLocations={getAvailableLocations()}
                  selectedPath={selectedPath}
                />

                {/* Standardized Map Container */}
                <div
                  className="flex items-center justify-center p-4 bg-gray-50"
                  style={{
                    minHeight: `${MAP_CONTAINER_CONFIG.minHeight + 32}px`,
                    maxHeight: `${MAP_CONTAINER_CONFIG.maxHeight + 32}px`,
                  }}
                >
                  <div
                    className="w-full flex items-center justify-center"
                    style={{
                      maxWidth: `${MAP_CONTAINER_CONFIG.maxWidth}px`,
                      aspectRatio: `${MAP_CONTAINER_CONFIG.aspectRatio}`,
                    }}
                  >
                    <MapCanvas
                      imageUrl={mapImage}
                      currentPath={currentPath}
                      isDesignMode={isDesignMode}
                      isEditMode={isEditMode}
                      isPreviewMode={isPreviewMode}
                      isTagMode={isTagMode}
                      isVerticalTagMode={isVerticalTagMode}
                      selectedShapeType={selectedShapeType}
                      onCanvasClick={handleCanvasClick}
                      onDotDrag={handleDotDrag}
                      onShapeDrawn={handleShapeDrawn}
                      onVerticalShapeDrawn={handleVerticalShapeDrawn}
                      paths={(() => {
                        // Filter paths based on current floor
                        const floorFilteredPaths = paths.filter((path) => {
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

                        // In design/edit mode: show ALL paths (published and unpublished)
                        if (isDesignMode || isEditMode) {
                          return floorFilteredPaths;
                        }

                        // In preview mode: show only selected/animated path, and only if it's published
                        if (isPreviewMode) {
                          if (selectedPathForAnimation && animatedPath) {
                            return floorFilteredPaths.filter(
                              (path) =>
                                path.id === selectedPathForAnimation.id &&
                                path.isPublished
                            );
                          }
                          return []; // Show no paths if nothing is selected in preview
                        }

                        // Default: show published paths only
                        return floorFilteredPaths.filter(
                          (path) => path.isPublished
                        );
                      })()}
                      animatedPath={animatedPath}
                      tags={tags.filter(
                        (tag) =>
                          !selectedFloor?.id ||
                          tag.floorId === selectedFloor.id ||
                          !tag.floorId
                      )}
                      verticalConnectors={verticalConnectors.filter(
                        (c) => c.floorId === selectedFloor?.id
                      )}
                      onTagUpdate={handleTagUpdate}
                      selectedPathForAnimation={selectedPathForAnimation}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              {isPreviewMode ? (
                <RouteSearch
                  paths={paths.filter((p) => p.isPublished)}
                  onRouteSelect={handleRouteSelect}
                  availableLocations={getAvailableLocations()}
                />
              ) : isTagMode ? (
                <>
                  <LocationTagger
                    isTagMode={isTagMode}
                    selectedShapeType={selectedShapeType}
                    onShapeTypeChange={setSelectedShapeType}
                    tags={tags}
                    onEditTag={handleEditTag}
                    onDeleteTag={handleDeleteTag}
                    currentFloorId={selectedFloor?.id}
                  />
                  {tags.filter(
                    (tag) =>
                      !selectedFloor?.id ||
                      tag.floorId === selectedFloor.id ||
                      !tag.floorId
                  ).length > 0 && (
                    <ColorCustomizer
                      tags={tags.filter(
                        (tag) =>
                          !selectedFloor?.id ||
                          tag.floorId === selectedFloor.id ||
                          !tag.floorId
                      )}
                      paths={[]}
                      onTagColorChange={handleTagColorChange}
                      onPathColorChange={handlePathColorChange}
                    />
                  )}
                </>
              ) : isVerticalTagMode ? (
                <>
                  <VerticalConnectorTagger
                    isVerticalTagMode={isVerticalTagMode}
                    selectedShapeType={selectedShapeType}
                    onShapeTypeChange={setSelectedShapeType}
                    connectors={verticalConnectors}
                    onEditConnector={handleEditVerticalConnector}
                    onDeleteConnector={handleDeleteVerticalConnector}
                    currentFloorId={selectedFloor?.id || ""}
                  />
                </>
              ) : (
                <>
                  <PathManager
                    paths={paths}
                    onEditPath={handleEditPath}
                    onDeletePath={handleDeletePath}
                  />
                  {(tags.filter(
                    (tag) =>
                      !selectedFloor?.id ||
                      tag.floorId === selectedFloor.id ||
                      !tag.floorId
                  ).length > 0 ||
                    paths.length > 0) && (
                    <ColorCustomizer
                      tags={tags.filter(
                        (tag) =>
                          !selectedFloor?.id ||
                          tag.floorId === selectedFloor.id ||
                          !tag.floorId
                      )}
                      paths={paths}
                      onTagColorChange={handleTagColorChange}
                      onPathColorChange={handlePathColorChange}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tag Creation Dialog */}
      <TagCreationDialog
        isOpen={showTagDialog}
        onClose={() => {
          setShowTagDialog(false);
          setPendingShape(null);
        }}
        onSave={handleCreateTag}
        currentFloorId={selectedFloor?.id}
      />

      {/* Vertical Connector Creation Dialog */}
      <VerticalConnectorCreationDialog
        isOpen={showVerticalConnectorDialog}
        onClose={() => {
          setShowVerticalConnectorDialog(false);
          setPendingVerticalShape(null);
        }}
        onSave={handleCreateVerticalConnector}
      />
    </div>
  );
};

export default Index;
