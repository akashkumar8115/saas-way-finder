import { useState, useCallback, useEffect } from 'react';
import { TaggedLocation } from '@/components/LocationTagger';
import { VerticalConnector } from '@/components/VerticalConnectorTagger';
import { Building, Floor } from '@/types/building';

export interface MapEditorState {
  mapImage: string;
  mapName: string;
  currentMapId: string;
  paths: any[];
  currentPath: { x: number; y: number }[];
  undoStack: { x: number; y: number }[][];
  selectedPath: any | null;
  animatedPath: { x: number; y: number }[] | null;
  selectedPathForAnimation: any | null;
  isDesignMode: boolean;
  isEditMode: boolean;
  isPreviewMode: boolean;
  isTagMode: boolean;
  isVerticalTagMode: boolean;
  isBuildingMode: boolean;
  isPublished: boolean;
  selectedShapeType: 'rectangle' | 'circle' | 'polygon';
}

const initialState: MapEditorState = {
  mapImage: '',
  mapName: '',
  currentMapId: '',
  paths: [],
  currentPath: [],
  undoStack: [],
  selectedPath: null,
  animatedPath: null,
  selectedPathForAnimation: null,
  isDesignMode: false,
  isEditMode: false,
  isPreviewMode: false,
  isTagMode: false,
  isVerticalTagMode: false,
  isBuildingMode: false,
  isPublished: false,
  selectedShapeType: 'rectangle',
};

export const useMapEditor = () => {
  const [state, setState] = useState<MapEditorState>(initialState);
  const [tags, setTags] = useState<TaggedLocation[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<Floor | null>(null);
  const [verticalConnectors, setVerticalConnectors] = useState<VerticalConnector[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedBuildings = localStorage.getItem('wayfinder-buildings');
      const savedTags = localStorage.getItem('wayfinder-tags');
      const savedConnectors = localStorage.getItem('wayfinder-connectors');
      const savedState = localStorage.getItem('wayfinder-state');

      if (savedBuildings) {
        const parsedBuildings = JSON.parse(savedBuildings);
        if (Array.isArray(parsedBuildings)) {
          setBuildings(parsedBuildings);
        }
      }

      if (savedTags) {
        const parsedTags = JSON.parse(savedTags);
        if (Array.isArray(parsedTags)) {
          setTags(parsedTags);
        }
      }

      if (savedConnectors) {
        const parsedConnectors = JSON.parse(savedConnectors);
        if (Array.isArray(parsedConnectors)) {
          setVerticalConnectors(parsedConnectors);
        }
      }

      if (savedState) {
        const parsedState = JSON.parse(savedState);
        setState(prevState => ({ ...prevState, ...parsedState }));
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
      // Reset to initial state if there's an error
      setBuildings([]);
      setTags([]);
      setVerticalConnectors([]);
      setState(initialState);
    }
  }, []);

  // Save data to localStorage when state changes
  useEffect(() => {
    try {
      localStorage.setItem('wayfinder-buildings', JSON.stringify(buildings));
    } catch (error) {
      console.error('Error saving buildings:', error);
    }
  }, [buildings]);

  useEffect(() => {
    try {
      localStorage.setItem('wayfinder-tags', JSON.stringify(tags));
    } catch (error) {
      console.error('Error saving tags:', error);
    }
  }, [tags]);

  useEffect(() => {
    try {
      localStorage.setItem('wayfinder-connectors', JSON.stringify(verticalConnectors));
    } catch (error) {
      console.error('Error saving connectors:', error);
    }
  }, [verticalConnectors]);

  useEffect(() => {
    try {
      localStorage.setItem('wayfinder-state', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving state:', error);
    }
  }, [state]);

  const updateState = useCallback((updates: Partial<MapEditorState>) => {
    setState(prevState => ({ ...prevState, ...updates }));
  }, []);

  const resetModes = useCallback(() => {
    updateState({
      isDesignMode: false,
      isEditMode: false,
      isPreviewMode: false,
      isTagMode: false,
      isVerticalTagMode: false,
      currentPath: [],
      undoStack: [],
      selectedPath: null,
      animatedPath: null,
      selectedPathForAnimation: null,
    });
  }, [updateState]);

  const resetAll = useCallback(() => {
    setState(initialState);
    setTags([]);
    setBuildings([]);
    setSelectedBuilding(null);
    setSelectedFloor(null);
    setVerticalConnectors([]);

    // Clear localStorage
    try {
      localStorage.removeItem('wayfinder-buildings');
      localStorage.removeItem('wayfinder-tags');
      localStorage.removeItem('wayfinder-connectors');
      localStorage.removeItem('wayfinder-state');
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }, []);

  return {
    state,
    updateState,
    resetModes,
    resetAll,
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
