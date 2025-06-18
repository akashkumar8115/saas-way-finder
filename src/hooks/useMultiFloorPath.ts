"use client";
import { useState } from "react";
import { MultiFloorState, PathSegment } from "@/types/map-editor";
import { VerticalConnector } from "@/components/VerticalConnectorTagger";
import { Building, Floor } from "@/types/building";

export const useMultiFloorPath = () => {
  const [multiFloorState, setMultiFloorState] = useState<MultiFloorState>({
    isCreatingMultiFloorPath: false,
    multiFloorPathSegments: [],
    currentSegmentFloorId: null,
    pendingConnectorSelection: null,
    multiFloorPathSource: "",
    multiFloorPathDestination: "",
    lastConnectorInteraction: null,
    isConnectorPromptActive: false,
  });

  const updateMultiFloorState = (updates: Partial<MultiFloorState>) => {
    setMultiFloorState(prev => ({ ...prev, ...updates }));
  };

  const resetMultiFloorState = () => {
    setMultiFloorState({
      isCreatingMultiFloorPath: false,
      multiFloorPathSegments: [],
      currentSegmentFloorId: null,
      pendingConnectorSelection: null,
      multiFloorPathSource: "",
      multiFloorPathDestination: "",
      lastConnectorInteraction: null,
      isConnectorPromptActive: false,
    });
  };

  const handleFloorTransition = (
    targetFloor: Floor,
    sourceConnector: VerticalConnector,
    currentPath: { x: number; y: number }[],
    selectedFloor: Floor | null,
    verticalConnectors: VerticalConnector[],
    onFloorChange: (floor: Floor, imageUrl: string) => void,
    onPathChange: (path: { x: number; y: number }[]) => void
  ) => {
    if (!selectedFloor) return;

    console.log(`Transitioning from ${selectedFloor.label} to ${targetFloor.label}`);

    // Save current segment INCLUDING the connector point as the final point
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

    updateMultiFloorState({
      multiFloorPathSegments: [...multiFloorState.multiFloorPathSegments, currentSegment],
      isCreatingMultiFloorPath: true,
      currentSegmentFloorId: targetFloor.id,
      lastConnectorInteraction: null,
      isConnectorPromptActive: false,
    });

    // Switch to target floor
    onFloorChange(targetFloor, targetFloor.imageUrl);

    // Find matching connector on target floor
    const targetConnector = verticalConnectors.find(
      (c) => c.sharedId === sourceConnector.sharedId && c.floorId === targetFloor.id
    );

    if (targetConnector) {
      // Start new path from the connector location on the new floor
      onPathChange([{ x: targetConnector.x, y: targetConnector.y }]);

      console.log(`Started new path segment on ${targetFloor.label} from connector`, targetConnector.name);

      // Show success message
      setTimeout(() => {
        alert(
          `✅ Switched to ${targetFloor.label}.\n\nContinue your path from "${sourceConnector.name}" connector.\nYou can now place dots freely on this floor.`
        );
      }, 100);
    } else {
      alert(`Error: Could not find matching connector on ${targetFloor.label}`);
    }
  };

  return {
    multiFloorState,
    updateMultiFloorState,
    resetMultiFloorState,
    handleFloorTransition,
  };
};
