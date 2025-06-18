"use client";
import { useState, useEffect } from "react";
import { MapEditorState, Path } from "@/types/map-editor";
import { TaggedLocation } from "@/components/LocationTagger";
import { Building, Floor } from "@/types/building";
import { VerticalConnector } from "@/components/VerticalConnectorTagger";
import {
  loadBuildingsFromStorage,
  saveBuildingsToStorage,
  loadVerticalConnectorsFromStorage,
  saveVerticalConnectorsToStorage,
} from "@/lib/buildingData";

export const useMapEditor = () => {
  const [state, setState] = useState<MapEditorState>({
    mapImage: null,
    mapName: "",
    currentMapId: null,
    paths: [],
    currentPath: [],
    undoStack: [],
    isDesignMode: false,
    isEditMode: false,
    isPreviewMode: false,
    isTagMode: false,
    isVerticalTagMode: false,
    isBuildingMode: false,
    selectedShapeType: "circle",
    isPublished: false,
    selectedPath: null,
    animatedPath: null,
    selectedPathForAnimation: null,
  });

  const [tags, setTags] = useState<TaggedLocation[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<Floor | null>(null);
  const [verticalConnectors, setVerticalConnectors] = useState<VerticalConnector[]>([]);

  // Load data on mount
  useEffect(() => {
    const savedBuildings = loadBuildingsFromStorage();
    const savedConnectors = loadVerticalConnectorsFromStorage();
    setBuildings(savedBuildings);
    setVerticalConnectors(savedConnectors);
  }, []);

  // Save data when changed
  useEffect(() => {
    saveBuildingsToStorage(buildings);
  }, [buildings]);

  useEffect(() => {
    saveVerticalConnectorsToStorage(verticalConnectors);
  }, [verticalConnectors]);

  const updateState = (updates: Partial<MapEditorState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const resetModes = () => {
    updateState({
      isDesignMode: false,
      isEditMode: false,
      isPreviewMode: false,
      isTagMode: false,
      isVerticalTagMode: false,
      isBuildingMode: false,
      currentPath: [],
      undoStack: [],
      selectedPath: null,
      animatedPath: null,
      selectedPathForAnimation: null,
    });
  };

  return {
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
  };
};
