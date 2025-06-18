import { VerticalConnector } from "@/components/VerticalConnectorTagger";
import { Floor } from "@/types/building";

export const filterConnectorsByFloor = (
  connectors: VerticalConnector[],
  selectedFloor: Floor | null
): VerticalConnector[] => {
  return connectors.filter((c) => c.floorId === selectedFloor?.id);
};

export const getConnectorsBySharedId = (
  connectors: VerticalConnector[],
  sharedId: string
): VerticalConnector[] => {
  return connectors.filter((c) => c.sharedId === sharedId);
};

export const findMatchingConnectors = (
  connectors: VerticalConnector[],
  sourceConnector: VerticalConnector,
  excludeFloorId: string
): VerticalConnector[] => {
  return connectors.filter(
    (c) => c.sharedId === sourceConnector.sharedId && c.floorId !== excludeFloorId
  );
};

export const calculateConnectorDistance = (
  clickX: number,
  clickY: number,
  connector: VerticalConnector,
  canvasSize: { width: number; height: number }
): number => {
  const connectorCanvasX = connector.x * canvasSize.width;
  const connectorCanvasY = connector.y * canvasSize.height;
  const clickCanvasX = clickX * canvasSize.width;
  const clickCanvasY = clickY * canvasSize.height;

  return Math.sqrt(
    Math.pow(connectorCanvasX - clickCanvasX, 2) +
    Math.pow(connectorCanvasY - clickCanvasY, 2)
  );
};

export const getConnectorThreshold = (
  connector: VerticalConnector,
  canvasSize: { width: number; height: number }
): number => {
  let threshold = 15; // Base threshold in pixels

  if (connector.shape === "circle" && connector.radius) {
    threshold = Math.max(15, connector.radius * canvasSize.width * 0.8);
  } else if (
    connector.shape === "rectangle" &&
    connector.width &&
    connector.height
  ) {
    const avgSize =
      (connector.width * canvasSize.width +
        connector.height * canvasSize.height) / 2;
    threshold = Math.max(15, avgSize * 0.4);
  }

  return threshold;
};
