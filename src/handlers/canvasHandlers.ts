import { VerticalConnector } from "@/components/VerticalConnectorTagger";
import { Building, Floor } from "@/types/building";

export const handleConnectorDetection = (
  x: number,
  y: number,
  verticalConnectors: VerticalConnector[],
  selectedFloor: Floor | null,
  lastConnectorInteraction: string | null,
  isConnectorPromptActive: boolean
): VerticalConnector | null => {
  if (!selectedFloor || isConnectorPromptActive) return null;

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

  return clickedConnector && clickedConnector.id !== lastConnectorInteraction
    ? clickedConnector
    : null;
};

export const handleConnectorInteraction = (
  connector: VerticalConnector,
  selectedBuilding: Building | null,
  selectedFloor: Floor | null,
  verticalConnectors: VerticalConnector[]
): { shouldProceed: boolean; availableFloors: Floor[]; selectedFloorLabel?: string } => {
  if (!selectedFloor || !selectedBuilding) {
    return { shouldProceed: false, availableFloors: [] };
  }

  console.log("Processing explicit connector click for:", connector.name);

  // Find matching connectors on other floors
  const matchingConnectors = verticalConnectors.filter(
    (c) => c.sharedId === connector.sharedId && c.floorId !== selectedFloor.id
  );

  console.log("Found matching connectors:", matchingConnectors.length);

  if (matchingConnectors.length === 0) {
    alert(
      `No matching connector "${connector.name}" found on other floors. Please ensure the connector exists on multiple floors with the same Shared ID.`
    );
    return { shouldProceed: false, availableFloors: [] };
  }

  // Get available floors that have this connector
  const availableFloors = selectedBuilding.floors.filter((floor) =>
    matchingConnectors.some((c) => c.floorId === floor.id)
  );

  console.log("Available floors for connection:", availableFloors.map((f) => f.label));

  if (availableFloors.length === 0) {
    alert("No other floors available for this connector.");
    return { shouldProceed: false, availableFloors: [] };
  }

  // Show confirmation modal first
  const shouldSwitch = confirm(
    `You've reached "${connector.name}". Do you want to continue this path on another floor?\n\nClick OK to switch floors, or Cancel to continue on the current floor.`
  );

  if (!shouldSwitch) {
    console.log("User chose to stay on current floor");
    return { shouldProceed: false, availableFloors };
  }

  // Prompt user to select target floor
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
      return { shouldProceed: true, availableFloors, selectedFloorLabel };
    } else {
      alert(`Floor "${selectedFloorLabel}" not found. Please try again.`);
    }
  }

  return { shouldProceed: false, availableFloors };
};
