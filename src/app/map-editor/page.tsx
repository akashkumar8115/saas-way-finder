"use client";
import React, { useState, useMemo } from "react";
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
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { BuildingManager } from "@/components/BuildingManager";
import { FloorSelector } from "@/components/FloorSelector";
import { Building, Floor } from "@/types/building";
import {
  VerticalConnectorTagger,
  VerticalConnector,
} from "@/components/VerticalConnectorTagger";
import { VerticalConnectorCreationDialog } from "@/components/VerticalConnectorCreationDialog";

// Import custom hooks and utilities
import { useMapEditor } from "@/hooks/useMapEditor";
import { useMultiFloorPath } from "@/hooks/useMultiFloorPath";
import { useMapEditorActions } from "@/handlers/mapEditorActions";
import { useBuildingHandlers } from "@/handlers/buildingHandlers";
import { useRouteHandlers } from "@/handlers/routeHandlers";
import { handleConnectorDetection, handleConnectorInteraction } from "@/handlers/canvasHandlers";
import { getPathsForDisplay } from "@/utils/pathUtils";
import { MAP_CONTAINER_CONFIG } from "@/types/map-editor";
import { getSavedMapsFromState } from "@/utils/mapUtils";

const MapEditorPage = () => {
  // Main state management with error handling
  const {
    state,
    updateState,
    resetModes,
    tags,
    setTags,
    buildings,
    setBuildings,
    selectedBuilding,
    setSelectedBuilding,
    selectedFloor,
    setSelectedFloor,
    verticalConnectors,
    setVerticalConnectors,
  } = useMapEditor();

  // Multi-floor path management
  const {
    multiFloorState,
    updateMultiFloorState,
    resetMultiFloorState,
    handleFloorTransition,
  } = useMultiFloorPath();

  // Dialog states
  const [pendingShape, setPendingShape] = useState<Omit<
    TaggedLocation,
    "id" | "name" | "category" | "floorId"
  > | null>(null);
  const [showTagDialog, setShowTagDialog] = useState(false);
  const [pendingVerticalShape, setPendingVerticalShape] = useState<Omit<
    VerticalConnector,
    "id" | "name" | "type" | "sharedId" | "createdAt"
  > | null>(null);
  const [showVerticalConnectorDialog, setShowVerticalConnectorDialog] = useState(false);

  // Safely get saved maps with error handling
  const savedMaps = useMemo(() => {
    try {
      return getSavedMapsFromState(
        buildings,
        state.paths || [],
        tags || [],
        verticalConnectors || [],
        state.mapImage,
        state.mapName,
        state.isPublished
      );
    } catch (error) {
      console.error('Error getting saved maps:', error);
      return [];
    }
  }, [buildings, state.paths, tags, verticalConnectors, state.mapImage, state.mapName, state.isPublished]);

  // Action handlers
  const mapEditorActions = useMapEditorActions(
    state.paths,
    (paths) => updateState({ paths }),
    tags,
    setTags,
    verticalConnectors,
    setVerticalConnectors,
    selectedBuilding,
    selectedFloor
  );

  // Building handlers
  const buildingHandlers = useBuildingHandlers(
    buildings,
    setBuildings,
    selectedBuilding,
    setSelectedBuilding,
    selectedFloor,
    setSelectedFloor,
    (image) => updateState({ mapImage: image })
  );

  // Route handlers
  const routeHandlers = useRouteHandlers(
    selectedBuilding,
    selectedFloor,
    setSelectedFloor,
    (image) => updateState({ mapImage: image }),
    (path) => updateState({ animatedPath: path }),
    (path) => updateState({ selectedPathForAnimation: path })
  );

  // Canvas interaction handlers
  const handleCanvasClick = (x: number, y: number) => {
    if (!state.isDesignMode && !state.isEditMode) return;

    const newPoint = { x, y };
    updateState({
      undoStack: [...state.undoStack, [...state.currentPath]],
      currentPath: [...state.currentPath, newPoint],
    });

    // Enhanced connector detection for multi-floor paths
    if (
      (state.isDesignMode || state.isEditMode) &&
      selectedFloor &&
      selectedBuilding &&
      !multiFloorState.isConnectorPromptActive
    ) {
      const clickedConnector = handleConnectorDetection(
        x,
        y,
        verticalConnectors,
        selectedFloor,
        multiFloorState.lastConnectorInteraction,
        multiFloorState.isConnectorPromptActive
      );

      if (clickedConnector) {
        console.log("Explicit click detected on connector:", clickedConnector.name);
        updateMultiFloorState({ isConnectorPromptActive: true });
        handleConnectorClick(clickedConnector);
      }
    }
  };

  const handleConnectorClick = (connector: VerticalConnector) => {
    const interaction = handleConnectorInteraction(
      connector,
      selectedBuilding,
      selectedFloor,
      verticalConnectors
    );

    if (!interaction.shouldProceed) {
      updateMultiFloorState({ isConnectorPromptActive: false });
      if (interaction.availableFloors.length > 0) {
        updateMultiFloorState({ lastConnectorInteraction: connector.id });
      }
      return;
    }

    if (interaction.selectedFloorLabel) {
      const targetFloor = interaction.availableFloors.find(
        (f) => f.label.toLowerCase() === interaction.selectedFloorLabel!.toLowerCase()
      );

      if (targetFloor) {
        handleFloorTransition(
          targetFloor,
          connector,
          state.currentPath,
          selectedFloor,
          verticalConnectors,
          (floor, imageUrl) => {
            setSelectedFloor(floor);
            updateState({ mapImage: imageUrl });
          },
          (path) => updateState({ currentPath: path })
        );
      }
    }
  };

  const handleDotDrag = (index: number, x: number, y: number) => {
    if (!state.isEditMode) return;

    const newPath = [...state.currentPath];
    newPath[index] = { x, y };
    updateState({ currentPath: newPath });
  };

  const handleUndo = () => {
    if (state.undoStack.length > 0) {
      const previousState = state.undoStack[state.undoStack.length - 1];
      updateState({
        currentPath: previousState,
        undoStack: state.undoStack.slice(0, -1),
      });
    }
  };

  const handleImageUpload = (imageUrl: string) => {
    updateState({
      mapImage: imageUrl,
      currentMapId: Date.now().toString(),
      paths: [],
      currentPath: [],
      undoStack: [],
      selectedPath: null,
      animatedPath: null,
      selectedPathForAnimation: null,
      isPublished: false,
    });
    setTags([]);
    setSelectedBuilding(null);
    setSelectedFloor(null);
    resetModes();
    resetMultiFloorState();
  };

  const handleShapeDrawn = (
    shape: Omit<TaggedLocation, "id" | "name" | "category">
  ) => {
    setPendingShape(shape);
    setShowTagDialog(true);
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

  const handleCreateTag = (
    name: string,
    category: string,
    floorId?: string
  ) => {
    mapEditorActions.handleCreateTag(name, category, floorId, pendingShape);
    setPendingShape(null);
  };

  const handleCreateVerticalConnector = (
    name: string,
    type: any,
    sharedId: string
  ) => {
    mapEditorActions.handleCreateVerticalConnector(
      name,
      type,
      sharedId,
      pendingVerticalShape
    );
    setPendingVerticalShape(null);
  };

  const handleSavePath = (source: string, destination: string) => {
    mapEditorActions.handleSavePath(
      source,
      destination,
      state.currentPath,
      state.selectedPath,
      multiFloorState.isCreatingMultiFloorPath,
      multiFloorState.multiFloorPathSegments,
      () => {
        updateState({
          currentPath: [],
          undoStack: [],
          isDesignMode: false,
          isEditMode: false,
          selectedPath: null,
        });
        resetMultiFloorState();
      }
    );
  };

  const handleClearPath = () => {
    updateState({ currentPath: [], undoStack: [] });
    resetMultiFloorState();
    updateMultiFloorState({
      lastConnectorInteraction: null,
      isConnectorPromptActive: false,
    });
  };

  const handleEditPath = (path: any) => {
    mapEditorActions.handleEditPath(
      path,
      (currentPath) => updateState({ currentPath }),
      (selectedPath) => updateState({ selectedPath }),
      (isEditMode) => updateState({ isEditMode }),
      (isDesignMode) => updateState({ isDesignMode }),
      (isPreviewMode) => updateState({ isPreviewMode }),
      (undoStack) => updateState({ undoStack }),
      (floor, imageUrl) => {
        setSelectedFloor(floor);
        updateState({ mapImage: imageUrl });
      },
      (isCreating) => updateMultiFloorState({ isCreatingMultiFloorPath: isCreating }),
      (segments) => updateMultiFloorState({ multiFloorPathSegments: segments })
    );
  };

  const toggleDesignMode = () => {
    if (state.isPreviewMode || state.isTagMode) return;

    const newDesignMode = !state.isDesignMode && !state.isEditMode;
    updateState({
      isDesignMode: newDesignMode,
      isEditMode: false,
    });

    if (!newDesignMode) {
      updateState({
        currentPath: [],
        undoStack: [],
        selectedPath: null,
      });
      resetMultiFloorState();
    }

    updateMultiFloorState({
      lastConnectorInteraction: null,
      isConnectorPromptActive: false,
    });
  };

  const startMultiFloorPath = () => {
    updateMultiFloorState({
      isCreatingMultiFloorPath: true,
      multiFloorPathSegments: [],
      currentSegmentFloorId: selectedFloor?.id || null,
      lastConnectorInteraction: null,
      isConnectorPromptActive: false,
    });
    updateState({ isDesignMode: true, isEditMode: false });

    alert(
      "Multi-floor path mode activated.\n\n• Place dots freely on the current floor\n• Click directly on vertical connectors (elevators, stairs) to switch floors\n• You will only be prompted when clicking on a connector"
    );
  };

  const toggleTagMode = () => {
    updateState({
      isTagMode: !state.isTagMode,
      isDesignMode: false,
      isEditMode: false,
      isPreviewMode: false,
      currentPath: [],
      undoStack: [],
      selectedPath: null,
      animatedPath: null,
      selectedPathForAnimation: null,
    });
  };

  const toggleVerticalTagMode = () => {
    updateState({
      isVerticalTagMode: !state.isVerticalTagMode,
      isDesignMode: false,
      isEditMode: false,
      isPreviewMode: false,
      isTagMode: false,
      currentPath: [],
      undoStack: [],
      selectedPath: null,
      animatedPath: null,
      selectedPathForAnimation: null,
    });
  };

  const togglePreviewMode = () => {
    updateState({
      isPreviewMode: !state.isPreviewMode,
      isDesignMode: false,
      isEditMode: false,
      currentPath: [],
      undoStack: [],
      selectedPath: null,
      animatedPath: null,
      selectedPathForAnimation: null,
    });
  };

  const toggleBuildingMode = () => {
    updateState({
      isBuildingMode: !state.isBuildingMode,
      isDesignMode: false,
      isEditMode: false,
      isPreviewMode: false,
      isTagMode: false,
      isVerticalTagMode: false,
    });
  };

  const handleViewPublishedMap = () => {
    updateState({
      isPreviewMode: true,
      isDesignMode: false,
      isEditMode: false,
      currentPath: [],
      selectedPath: null,
      selectedPathForAnimation: null,
    });
  };

  const getAvailableLocations = () => {
    try {
      if (selectedBuilding) {
        return [
          ...new Set([
            ...tags.map((tag) => tag.name),
            ...state.paths.flatMap((path) => [path.source, path.destination]),
          ]),
        ];
      } else {
        const currentFloorTags = selectedFloor?.id
          ? tags.filter((tag) => tag.floorId === selectedFloor.id || !tag.floorId)
          : tags;

        const tagLocations = currentFloorTags.map((tag) => tag.name);
        const pathLocations = state.paths.flatMap((path) => [
          path.source,
          path.destination,
        ]);
        return [...new Set([...tagLocations, ...pathLocations])];
      }
    } catch (error) {
      console.error('Error getting available locations:', error);
      return [];
    }
  };

  const getFilteredTags = () => {
    try {
      return tags.filter(
        (tag) =>
          !selectedFloor?.id ||
          tag.floorId === selectedFloor.id ||
          !tag.floorId
      );
    } catch (error) {
      console.error('Error filtering tags:', error);
      return [];
    }
  };

  const getFilteredVerticalConnectors = () => {
    try {
      return verticalConnectors.filter((c) => c.floorId === selectedFloor?.id);
    } catch (error) {
      console.error('Error filtering vertical connectors:', error);
      return [];
    }
  };

  const getPathsForCanvas = () => {
    try {
      return getPathsForDisplay(
        state.paths,
        selectedFloor,
        state.isDesignMode,
        state.isEditMode,
        state.isPreviewMode,
        state.selectedPathForAnimation,
        state.animatedPath
      );
    } catch (error) {
      console.error('Error getting paths for canvas:', error);
      return [];
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Link href="/dashboard" passHref>
                  <Navigation className="h-6 w-6 text-white" />
                </Link>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Way Finder</h1>
                <p className="text-sm text-gray-500">
                  {state.isBuildingMode
                    ? "Building Management"
                    : state.isPreviewMode
                      ? "Preview Mode"
                      : state.isTagMode
                        ? "Location Tagging"
                        : state.isVerticalTagMode
                          ? "Vertical Connector Tagging"
                          : multiFloorState.isCreatingMultiFloorPath
                            ? "Multi-Floor Path Designer"
                            : "Interactive Path Designer"}
                  {state.isPublished &&
                    !state.isPreviewMode &&
                    !state.isBuildingMode &&
                    " (Published)"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>
                {selectedBuilding ? `${selectedBuilding.name} • ` : ""}
                {state.paths.length} paths • {tags.length} tags •{" "}
                {getFilteredVerticalConnectors().length} vertical connectors
              </span>
              {state.isPublished && (
                <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                  Published
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!state.mapImage && !state.isBuildingMode ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="bg-blue-100 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <Route className="h-10 w-10 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Start Creating Your Wayfinding Map
              </h2>
              <p className="text-gray-600 mb-8">
                Upload a single map or manage multi-floor buildings
              </p>
              <div className="flex space-x-4">
                <MapUpload onImageUpload={handleImageUpload} />
                <Button
                  onClick={toggleBuildingMode}
                  variant="outline"
                  className="mt-4"
                >
                  <BuildingIcon className="h-4 w-4 mr-2" />
                  Manage Buildings
                </Button>
              </div>
            </div>
          </div>
        ) : state.isBuildingMode ? (
          <div className="max-w-4xl mx-auto">
            <BuildingManager
              buildings={buildings}
              selectedBuilding={selectedBuilding}
              onBuildingSelect={buildingHandlers.handleBuildingSelect}
              onBuildingCreate={buildingHandlers.handleBuildingCreate}
              onBuildingDelete={buildingHandlers.handleBuildingDelete}
              onFloorAdd={buildingHandlers.handleFloorAdd}
              onFloorDelete={buildingHandlers.handleFloorDelete}
              onFloorReorder={buildingHandlers.handleFloorReorder}
              onExit={() => updateState({ isBuildingMode: false })}
            />
            <div className="mt-6 text-center">
              <Button onClick={toggleBuildingMode} variant="outline">
                Back to Map Editor
              </Button>
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
                        {multiFloorState.isCreatingMultiFloorPath && (
                          <p className="text-sm text-blue-600 font-medium">
                            Multi-floor path mode active • Click near connectors
                            to switch floors
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={toggleBuildingMode}
                        >
                          <BuildingIcon className="h-4 w-4 mr-2" />
                          Manage Building
                        </Button>
                        {selectedBuilding.floors.length > 1 &&
                          !multiFloorState.isCreatingMultiFloorPath &&
                          (state.isDesignMode || state.isEditMode) && (
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
                            onFloorSelect={(floor) =>
                              buildingHandlers.handleFloorSelect(floor, resetModes)
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {!state.isPublished && !selectedBuilding && (
                  <div className="p-4 border-b bg-gray-50">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Map Name
                    </label>
                    <Input
                      placeholder="Enter map name (e.g., Office Building Floor 1)"
                      value={state.mapName}
                      onChange={(e) => updateState({ mapName: e.target.value })}
                      className="max-w-md"
                    />
                  </div>
                )}

                <Toolbar
                  isDesignMode={state.isDesignMode}
                  isEditMode={state.isEditMode}
                  isPreviewMode={state.isPreviewMode}
                  isTagMode={state.isTagMode}
                  isVerticalTagMode={state.isVerticalTagMode}
                  isPublished={state.isPublished}
                  onToggleDesignMode={toggleDesignMode}
                  onToggleTagMode={toggleTagMode}
                  onToggleVerticalTagMode={toggleVerticalTagMode}
                  onTogglePreviewMode={togglePreviewMode}
                  onViewPublishedMap={handleViewPublishedMap}
                  onUndo={handleUndo}
                  onRedo={() => { }}
                  onClearPath={handleClearPath}
                  onSavePath={handleSavePath}
                  onPublishMap={() =>
                    mapEditorActions.handlePublishMap(
                      state.mapImage,
                      state.currentMapId,
                      state.mapName,
                      (published) => updateState({ isPublished: published })
                    )
                  }
                  canUndo={state.undoStack.length > 0}
                  hasCurrentPath={state.currentPath.length > 0}
                  availableLocations={getAvailableLocations()}
                  selectedPath={state.selectedPath}
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
                      imageUrl={state.mapImage}
                      currentPath={state.currentPath}
                      isDesignMode={state.isDesignMode}
                      isEditMode={state.isEditMode}
                      isPreviewMode={state.isPreviewMode}
                      isTagMode={state.isTagMode}
                      isVerticalTagMode={state.isVerticalTagMode}
                      selectedShapeType={state.selectedShapeType}
                      onCanvasClick={handleCanvasClick}
                      onDotDrag={handleDotDrag}
                      onShapeDrawn={handleShapeDrawn}
                      onVerticalShapeDrawn={handleVerticalShapeDrawn}
                      paths={getPathsForCanvas()}
                      animatedPath={state.animatedPath}
                      tags={getFilteredTags()}
                      verticalConnectors={getFilteredVerticalConnectors()}
                      onTagUpdate={mapEditorActions.handleTagUpdate}
                      selectedPathForAnimation={state.selectedPathForAnimation}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              {state.isPreviewMode ? (
                <RouteSearch
                  paths={state.paths.filter((p) => p.isPublished)}
                  onRouteSelect={routeHandlers.handleRouteSelect}
                  availableLocations={getAvailableLocations()}
                />
              ) : state.isTagMode ? (
                <>
                  <LocationTagger
                    isTagMode={state.isTagMode}
                    selectedShapeType={state.selectedShapeType}
                    onShapeTypeChange={(type) =>
                      updateState({ selectedShapeType: type })
                    }
                    tags={tags}
                    onEditTag={mapEditorActions.handleEditTag}
                    onDeleteTag={mapEditorActions.handleDeleteTag}
                    currentFloorId={selectedFloor?.id}
                  />
                  {getFilteredTags().length > 0 && (
                    <ColorCustomizer
                      tags={getFilteredTags()}
                      paths={[]}
                      onTagColorChange={mapEditorActions.handleTagColorChange}
                      onPathColorChange={mapEditorActions.handlePathColorChange}
                    />
                  )}
                </>
              ) : state.isVerticalTagMode ? (
                <>
                  <VerticalConnectorTagger
                    isVerticalTagMode={state.isVerticalTagMode}
                    selectedShapeType={state.selectedShapeType}
                    onShapeTypeChange={(type) =>
                      updateState({ selectedShapeType: type })
                    }
                    connectors={verticalConnectors}
                    onEditConnector={mapEditorActions.handleEditVerticalConnector}
                    onDeleteConnector={mapEditorActions.handleDeleteVerticalConnector}
                    currentFloorId={selectedFloor?.id || ""}
                  />
                </>
              ) : (
                <>
                  <PathManager
                    paths={state.paths}
                    onEditPath={handleEditPath}
                    onDeletePath={mapEditorActions.handleDeletePath}
                  />
                  {(getFilteredTags().length > 0 || state.paths.length > 0) && (
                    <ColorCustomizer
                      tags={getFilteredTags()}
                      paths={state.paths}
                      onTagColorChange={mapEditorActions.handleTagColorChange}
                      onPathColorChange={mapEditorActions.handlePathColorChange}
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

export default MapEditorPage;


