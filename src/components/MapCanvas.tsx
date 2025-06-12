"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { TaggedLocation } from "./LocationTagger";
import { VerticalConnector } from "./VerticalConnectorTagger";

interface Point {
  x: number;
  y: number;
}

interface Path {
  id: string;
  name: string;
  source: string;
  destination: string;
  points: Point[];
  isPublished: boolean;
  sourceTagId?: string;
  destinationTagId?: string;
  color?: string; // Add color property
}

interface MapCanvasProps {
  imageUrl: string | null;
  currentPath: Point[];
  isDesignMode: boolean;
  isEditMode: boolean;
  isPreviewMode: boolean;
  isTagMode: boolean;
  isVerticalTagMode: boolean;
  selectedShapeType: "circle" | "rectangle";
  onCanvasClick: (x: number, y: number) => void;
  onDotDrag: (index: number, x: number, y: number) => void;
  onShapeDrawn: (
    shape: Omit<TaggedLocation, "id" | "name" | "category">
  ) => void;
  onVerticalShapeDrawn: (
    shape: Omit<
      VerticalConnector,
      "id" | "name" | "type" | "sharedId" | "createdAt"
    >
  ) => void;
  paths: Path[];
  selectedSource?: string;
  selectedDestination?: string;
  animatedPath?: Point[] | null;
  tags: TaggedLocation[];
  verticalConnectors: VerticalConnector[];
  onTagUpdate?: (tag: TaggedLocation) => void;
  selectedPathForAnimation?: Path | null; // New prop for specific path animation
}

// Standardized map dimensions
const STANDARD_MAP_CONFIG = {
  maxWidth: 1200,
  maxHeight: 800,
  aspectRatio: 16 / 9, // Standard aspect ratio
  minWidth: 600,
  minHeight: 400,
};

export const MapCanvas: React.FC<MapCanvasProps> = ({
  imageUrl,
  currentPath,
  isDesignMode,
  isEditMode,
  isPreviewMode,
  isTagMode,
  isVerticalTagMode,
  selectedShapeType,
  onCanvasClick,
  onDotDrag,
  onShapeDrawn,
  onVerticalShapeDrawn,
  paths,
  selectedSource,
  selectedDestination,
  animatedPath,
  tags,
  verticalConnectors,
  onTagUpdate,
  selectedPathForAnimation,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [canvasSize, setCanvasSize] = useState({
    width: STANDARD_MAP_CONFIG.minWidth,
    height: STANDARD_MAP_CONFIG.minHeight,
  });
  const [draggedDotIndex, setDraggedDotIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [imageNaturalSize, setImageNaturalSize] = useState({
    width: 0,
    height: 0,
  });
  const [hoveredConnector, setHoveredConnector] =
    useState<VerticalConnector | null>(null);

  // Shape drawing state
  const [isDrawingShape, setIsDrawingShape] = useState(false);
  const [shapeStart, setShapeStart] = useState<Point | null>(null);
  const [currentShapeEnd, setCurrentShapeEnd] = useState<Point | null>(null);

  // Tag manipulation state
  const [draggedTag, setDraggedTag] = useState<TaggedLocation | null>(null);
  const [resizingTag, setResizingTag] = useState<TaggedLocation | null>(null);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [tagAnimations, setTagAnimations] = useState<Map<string, number>>(
    new Map()
  );
  const [isEditingTag, setIsEditingTag] = useState(false);

  // Animation for tagged locations
  useEffect(() => {
    const interval = setInterval(() => {
      setTagAnimations((prev) => {
        const newMap = new Map(prev);
        tags.forEach((tag) => {
          const current = newMap.get(tag.id) || 0;
          newMap.set(tag.id, (current + 1) % 100);
        });
        return newMap;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [tags]);

  // Load and cache image
  useEffect(() => {
    if (!imageUrl) return;

    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      const container = containerRef.current;
      if (container) {
        const containerWidth =
          container.clientWidth || STANDARD_MAP_CONFIG.minWidth;
        const dimensions = calculateCanvasDimensions(
          containerWidth,
          img.width,
          img.height
        );
        setCanvasSize(dimensions);
        setImageNaturalSize({ width: img.width, height: img.height });
      }
      setImageLoaded(true);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Calculate standardized canvas dimensions
  const calculateCanvasDimensions = (
    containerWidth: number,
    imageWidth: number,
    imageHeight: number
  ) => {
    const imageAspectRatio = imageHeight / imageWidth;

    // Use container width but respect max dimensions
    let canvasWidth = Math.min(
      containerWidth - 32,
      STANDARD_MAP_CONFIG.maxWidth
    );
    canvasWidth = Math.max(canvasWidth, STANDARD_MAP_CONFIG.minWidth);

    let canvasHeight = canvasWidth * imageAspectRatio;

    // Ensure height doesn't exceed max
    if (canvasHeight > STANDARD_MAP_CONFIG.maxHeight) {
      canvasHeight = STANDARD_MAP_CONFIG.maxHeight;
      canvasWidth = canvasHeight / imageAspectRatio;
    }

    // Ensure minimum height
    if (canvasHeight < STANDARD_MAP_CONFIG.minHeight) {
      canvasHeight = STANDARD_MAP_CONFIG.minHeight;
      canvasWidth = canvasHeight / imageAspectRatio;
    }

    return { width: Math.round(canvasWidth), height: Math.round(canvasHeight) };
  };

  // Convert relative coordinates to canvas coordinates
  const relativeToCanvas = (relativeX: number, relativeY: number) => {
    return {
      x: relativeX * canvasSize.width,
      y: relativeY * canvasSize.height,
    };
  };

  // Convert canvas coordinates to relative coordinates
  const canvasToRelative = (canvasX: number, canvasY: number) => {
    return {
      x: canvasX / canvasSize.width,
      y: canvasY / canvasSize.height,
    };
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current;
      if (!container || !imageNaturalSize.width) return;

      const containerWidth = container.clientWidth;
      const dimensions = calculateCanvasDimensions(
        containerWidth,
        imageNaturalSize.width,
        imageNaturalSize.height
      );
      setCanvasSize(dimensions);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [imageNaturalSize]);

  const drawVerticalConnectors = (
    ctx: CanvasRenderingContext2D,
    connectors: VerticalConnector[]
  ) => {
    connectors.forEach((connector) => {
      const canvasPos = relativeToCanvas(connector.x, connector.y);

      // Use connector color based on type
      const connectorColor =
        connector.type === "elevator"
          ? "#9333ea"
          : connector.type === "stairs"
          ? "#059669"
          : connector.type === "escalator"
          ? "#dc2626"
          : "#dc2626";

      // Add glow effect if hovered during design mode
      const isHovered = hoveredConnector?.id === connector.id;
      const shouldGlow = isHovered && (isDesignMode || isEditMode);

      if (shouldGlow) {
        ctx.shadowColor = connectorColor;
        ctx.shadowBlur = 15;
        ctx.globalAlpha = 0.9;
      }

      ctx.strokeStyle = connectorColor;
      ctx.fillStyle = `${connectorColor}4D`; // 30% opacity
      ctx.lineWidth = shouldGlow ? 4 : 3;

      if (connector.shape === "circle" && connector.radius) {
        const canvasRadius = connector.radius * canvasSize.width;
        ctx.beginPath();
        ctx.arc(canvasPos.x, canvasPos.y, canvasRadius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      } else if (
        connector.shape === "rectangle" &&
        connector.width &&
        connector.height
      ) {
        const canvasWidth = connector.width * canvasSize.width;
        const canvasHeight = connector.height * canvasSize.height;
        const x = canvasPos.x - canvasWidth / 2;
        const y = canvasPos.y - canvasHeight / 2;

        ctx.fillRect(x, y, canvasWidth, canvasHeight);
        ctx.strokeRect(x, y, canvasWidth, canvasHeight);
      }

      // Reset shadow effects
      if (shouldGlow) {
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }

      // Draw connector label with enhanced visibility during design mode
      ctx.fillStyle = connectorColor;
      ctx.font = shouldGlow ? "bold 14px sans-serif" : "bold 12px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      if (shouldGlow) {
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 3;
        ctx.strokeText(connector.name, canvasPos.x, canvasPos.y - 35);
      }

      ctx.fillText(
        connector.name,
        canvasPos.x,
        canvasPos.y - (shouldGlow ? 35 : 30)
      );
    });
  };

  const drawTags = (ctx: CanvasRenderingContext2D, tags: TaggedLocation[]) => {
    tags.forEach((tag) => {
      const canvasPos = relativeToCanvas(tag.x, tag.y);
      const animation = tagAnimations.get(tag.id) || 0;
      const pulseScale = 1 + Math.sin(animation * 0.1) * 0.1;

      ctx.save();
      ctx.translate(canvasPos.x, canvasPos.y);
      ctx.scale(pulseScale, pulseScale);
      ctx.translate(-canvasPos.x, -canvasPos.y);

      // Use tag color if available, otherwise default
      const tagColor = tag.color || "#f59e0b";

      // Gradient background
      const gradient = ctx.createRadialGradient(
        canvasPos.x,
        canvasPos.y,
        0,
        canvasPos.x,
        canvasPos.y,
        50
      );
      gradient.addColorStop(0, `${tagColor}4D`); // 30% opacity
      gradient.addColorStop(1, `${tagColor}1A`); // 10% opacity

      ctx.strokeStyle = tagColor;
      ctx.fillStyle = gradient;
      ctx.lineWidth = 2;

      if (tag.shape === "circle" && tag.radius) {
        const canvasRadius = tag.radius * canvasSize.width;
        ctx.beginPath();
        ctx.arc(canvasPos.x, canvasPos.y, canvasRadius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        // Draw resize handles for circle in tag mode
        if (isTagMode && onTagUpdate) {
          const handleSize = 6;
          ctx.fillStyle = "#3b82f6";
          ctx.beginPath();
          ctx.arc(
            canvasPos.x + canvasRadius,
            canvasPos.y,
            handleSize,
            0,
            2 * Math.PI
          );
          ctx.fill();
        }
      } else if (tag.shape === "rectangle" && tag.width && tag.height) {
        const canvasWidth = tag.width * canvasSize.width;
        const canvasHeight = tag.height * canvasSize.height;
        const x = canvasPos.x - canvasWidth / 2;
        const y = canvasPos.y - canvasHeight / 2;

        ctx.fillRect(x, y, canvasWidth, canvasHeight);
        ctx.strokeRect(x, y, canvasWidth, canvasHeight);

        // Draw resize handles for rectangle in tag mode
        if (isTagMode && onTagUpdate) {
          const handleSize = 6;
          ctx.fillStyle = "#3b82f6";
          const handles = [
            { x: x, y: y },
            { x: x + canvasWidth, y: y },
            { x: x + canvasWidth, y: y + canvasHeight },
            { x: x, y: y + canvasHeight },
          ];
          handles.forEach((handle) => {
            ctx.beginPath();
            ctx.arc(handle.x, handle.y, handleSize, 0, 2 * Math.PI);
            ctx.fill();
          });
        }
      }

      // Draw logo if available
      if (tag.logoUrl) {
        const img = new Image();
        img.onload = () => {
          const logoSize = 24;
          ctx.drawImage(
            img,
            canvasPos.x - logoSize / 2,
            canvasPos.y - logoSize / 2,
            logoSize,
            logoSize
          );
        };
        img.src = tag.logoUrl;
      }

      // Draw tag label with shadow
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
      ctx.shadowBlur = 3;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      ctx.fillStyle = tagColor;
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(tag.name, canvasPos.x, canvasPos.y - 30);

      ctx.restore();
    });
  };

  // Updated to only show specific selected path in preview/published modes
  const drawAnimatedPaths = (ctx: CanvasRenderingContext2D, paths: Path[]) => {
    // In preview/published mode, only show the selected path
    const pathsToShow =
      isPreviewMode ||
      (!isDesignMode && !isEditMode && !isTagMode && !isVerticalTagMode)
        ? selectedPathForAnimation
          ? [selectedPathForAnimation]
          : []
        : paths.filter((p) => p.isPublished);

    pathsToShow.forEach((path, pathIndex) => {
      if (path.points.length < 2) return;

      const canvasPoints = path.points.map((p) => relativeToCanvas(p.x, p.y));
      const color = path.color || `hsl(${pathIndex * 60}, 70%, 50%)`;

      // Determine if this path should be animated (in preview mode or when it's the selected path)
      const shouldAnimate = isPreviewMode || path === selectedPathForAnimation;

      // Draw path line
      ctx.strokeStyle = color;
      ctx.lineWidth = shouldAnimate ? 6 : 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (shouldAnimate) {
        ctx.shadowColor = color;
        ctx.shadowBlur = 15;
        ctx.globalAlpha = 0.8;
      }

      ctx.beginPath();
      ctx.moveTo(canvasPoints[0].x, canvasPoints[0].y);
      for (let i = 1; i < canvasPoints.length; i++) {
        ctx.lineTo(canvasPoints[i].x, canvasPoints[i].y);
      }
      ctx.stroke();

      if (shouldAnimate) {
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
        drawDirectionArrows(ctx, canvasPoints, color);
      }
    });
  };

  const drawTemporaryShape = (
    ctx: CanvasRenderingContext2D,
    start: Point,
    end: Point,
    shapeType: "circle" | "rectangle"
  ) => {
    ctx.strokeStyle = "#3b82f6";
    ctx.fillStyle = "rgba(59, 130, 246, 0.2)";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);

    if (shapeType === "circle") {
      const radius = Math.sqrt((end.x - start.x) ** 2 + (end.y - start.y) ** 2);
      ctx.beginPath();
      ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    } else {
      const width = Math.abs(end.x - start.x);
      const height = Math.abs(end.y - start.y);
      const x = Math.min(start.x, end.x);
      const y = Math.min(start.y, end.y);
      ctx.fillRect(x, y, width, height);
      ctx.strokeRect(x, y, width, height);
    }

    ctx.setLineDash([]);
  };

  const drawPath = (
    ctx: CanvasRenderingContext2D,
    points: Point[],
    color: string,
    showDots: boolean,
    isAnimated = false
  ) => {
    if (points.length === 0) return;

    if (points.length > 1) {
      ctx.strokeStyle = color;
      ctx.lineWidth = isAnimated ? 6 : 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (isAnimated) {
        ctx.shadowColor = color;
        ctx.shadowBlur = 15;
        ctx.globalAlpha = 0.8;
      }

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);

      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();

      if (isAnimated) {
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
        drawDirectionArrows(ctx, points, color);
      }
    }

    if (showDots) {
      points.forEach((point, index) => {
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
        ctx.fill();

        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = color;
        ctx.font = "bold 12px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText((index + 1).toString(), point.x, point.y);
      });
    }

    if (isAnimated && points.length > 0) {
      ctx.fillStyle = "#10b981";
      ctx.beginPath();
      ctx.arc(points[0].x, points[0].y, 10, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("S", points[0].x, points[0].y);

      const lastPoint = points[points.length - 1];
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.arc(lastPoint.x, lastPoint.y, 10, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.fillText("E", lastPoint.x, lastPoint.y);
    }
  };

  const drawDirectionArrows = (
    ctx: CanvasRenderingContext2D,
    points: Point[],
    color: string
  ) => {
    if (points.length < 2) return;

    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    const time = Date.now() * 0.005;

    for (let i = 0; i < points.length - 1; i++) {
      const start = points[i];
      const end = points[i + 1];

      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);

      const arrowCount = Math.max(1, Math.floor(distance / 30));
      for (let j = 0; j < arrowCount; j++) {
        const progress = j / arrowCount + (time % 1);
        if (progress > 1) continue;

        const arrowX = start.x + dx * progress;
        const arrowY = start.y + dy * progress;

        ctx.save();
        ctx.translate(arrowX, arrowY);
        ctx.rotate(angle);

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(8, 0);
        ctx.lineTo(-4, -4);
        ctx.lineTo(-4, 4);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      }
    }
  };

  const getTagAtPosition = (x: number, y: number): TaggedLocation | null => {
    for (const tag of tags) {
      const canvasPos = relativeToCanvas(tag.x, tag.y);

      if (tag.shape === "circle" && tag.radius) {
        const canvasRadius = tag.radius * canvasSize.width;
        const distance = Math.sqrt(
          (x - canvasPos.x) ** 2 + (y - canvasPos.y) ** 2
        );
        if (distance <= canvasRadius) return tag;
      } else if (tag.shape === "rectangle" && tag.width && tag.height) {
        const canvasWidth = tag.width * canvasSize.width;
        const canvasHeight = tag.height * canvasSize.height;
        const left = canvasPos.x - canvasWidth / 2;
        const right = canvasPos.x + canvasWidth / 2;
        const top = canvasPos.y - canvasHeight / 2;
        const bottom = canvasPos.y + canvasHeight / 2;

        if (x >= left && x <= right && y >= top && y <= bottom) return tag;
      }
    }
    return null;
  };

  const getResizeHandle = (
    x: number,
    y: number,
    tag: TaggedLocation
  ): string | null => {
    const canvasPos = relativeToCanvas(tag.x, tag.y);
    const handleSize = 6;

    if (tag.shape === "circle" && tag.radius) {
      const canvasRadius = tag.radius * canvasSize.width;
      const handleX = canvasPos.x + canvasRadius;
      const handleY = canvasPos.y;
      const distance = Math.sqrt((x - handleX) ** 2 + (y - handleY) ** 2);
      if (distance <= handleSize * 2) return "radius";
    } else if (tag.shape === "rectangle" && tag.width && tag.height) {
      const canvasWidth = tag.width * canvasSize.width;
      const canvasHeight = tag.height * canvasSize.height;
      const left = canvasPos.x - canvasWidth / 2;
      const right = canvasPos.x + canvasWidth / 2;
      const top = canvasPos.y - canvasHeight / 2;
      const bottom = canvasPos.y + canvasHeight / 2;

      const handles = [
        { x: left, y: top, handle: "nw" },
        { x: right, y: top, handle: "ne" },
        { x: right, y: bottom, handle: "se" },
        { x: left, y: bottom, handle: "sw" },
      ];

      for (const h of handles) {
        const distance = Math.sqrt((x - h.x) ** 2 + (y - h.y) ** 2);
        if (distance <= handleSize * 2) return h.handle;
      }
    }
    return null;
  };

  const snapToNearestTag = (x: number, y: number): Point => {
    const snapDistance = 30; // pixels

    for (const tag of tags) {
      const canvasPos = relativeToCanvas(tag.x, tag.y);
      const distance = Math.sqrt(
        (x - canvasPos.x) ** 2 + (y - canvasPos.y) ** 2
      );

      if (distance <= snapDistance) {
        return { x: tag.x, y: tag.y };
      }
    }

    return canvasToRelative(x, y);
  };

  const getDotAtPosition = (x: number, y: number): number | null => {
    if (!isEditMode) return null;

    const canvasPoints = currentPath.map((p) => relativeToCanvas(p.x, p.y));

    for (let i = 0; i < canvasPoints.length; i++) {
      const dot = canvasPoints[i];
      const distance = Math.sqrt((x - dot.x) ** 2 + (y - dot.y) ** 2);
      if (distance <= 12) {
        return i;
      }
    }
    return null;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!imageLoaded) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isVerticalTagMode) {
      // Start drawing new vertical connector shape
      setIsDrawingShape(true);
      setShapeStart({ x, y });
      setCurrentShapeEnd({ x, y });
      return;
    }

    if (isTagMode) {
      // Check for tag manipulation first
      if (onTagUpdate) {
        for (const tag of tags) {
          const resizeHandle = getResizeHandle(x, y, tag);
          if (resizeHandle) {
            setResizingTag(tag);
            setResizeHandle(resizeHandle);
            setIsEditingTag(true);
            return;
          }

          if (getTagAtPosition(x, y) === tag) {
            setDraggedTag(tag);
            setIsEditingTag(true);
            return;
          }
        }
      }

      // Start drawing new shape
      setIsDrawingShape(true);
      setShapeStart({ x, y });
      setCurrentShapeEnd({ x, y });
      return;
    }

    if (isEditMode) {
      const dotIndex = getDotAtPosition(x, y);
      if (dotIndex !== null) {
        setDraggedDotIndex(dotIndex);
        setIsDragging(true);
        return;
      }
    }

    if (isDesignMode && !isEditMode && !isPreviewMode) {
      // Snap to nearest tag if close enough
      const snappedCoords = snapToNearestTag(x, y);
      onCanvasClick(snappedCoords.x, snappedCoords.y);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!imageLoaded) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Update hovered connector during design mode
    if (
      (isDesignMode || isEditMode) &&
      !isDrawingShape &&
      !draggedTag &&
      !resizingTag &&
      !isDragging
    ) {
      const relativeCoords = canvasToRelative(x, y);
      const canvasSize = { width: 1200, height: 800 };

      const hoveredConn = verticalConnectors.find((connector) => {
        const connectorCanvasX = connector.x * canvasSize.width;
        const connectorCanvasY = connector.y * canvasSize.height;
        const mouseCanvasX = relativeCoords.x * canvasSize.width;
        const mouseCanvasY = relativeCoords.y * canvasSize.height;

        const distance = Math.sqrt(
          Math.pow(connectorCanvasX - mouseCanvasX, 2) +
            Math.pow(connectorCanvasY - mouseCanvasY, 2)
        );

        let threshold = 25; // Slightly larger for hover detection
        if (connector.shape === "circle" && connector.radius) {
          threshold = Math.max(25, connector.radius * canvasSize.width);
        } else if (
          connector.shape === "rectangle" &&
          connector.width &&
          connector.height
        ) {
          const avgSize =
            (connector.width * canvasSize.width +
              connector.height * canvasSize.height) /
            2;
          threshold = Math.max(25, avgSize * 0.6);
        }

        return distance <= threshold;
      });

      setHoveredConnector(hoveredConn || null);
    } else {
      setHoveredConnector(null);
    }

    if (draggedTag && onTagUpdate) {
      const relativeCoords = canvasToRelative(x, y);
      const updatedTag = {
        ...draggedTag,
        x: relativeCoords.x,
        y: relativeCoords.y,
      };
      onTagUpdate(updatedTag);
      return;
    }

    if (resizingTag && resizeHandle && onTagUpdate) {
      const relativeCoords = canvasToRelative(x, y);
      const tagPos = { x: resizingTag.x, y: resizingTag.y };

      if (resizingTag.shape === "circle" && resizeHandle === "radius") {
        const distance = Math.sqrt(
          Math.pow((relativeCoords.x - tagPos.x) * canvasSize.width, 2) +
            Math.pow((relativeCoords.y - tagPos.y) * canvasSize.height, 2)
        );
        const radius = distance / canvasSize.width;
        const updatedTag = { ...resizingTag, radius };
        onTagUpdate(updatedTag);
      } else if (resizingTag.shape === "rectangle") {
        const dx = Math.abs(relativeCoords.x - tagPos.x) * 2;
        const dy = Math.abs(relativeCoords.y - tagPos.y) * 2;
        const updatedTag = { ...resizingTag, width: dx, height: dy };
        onTagUpdate(updatedTag);
      }
      return;
    }

    if (isDrawingShape && shapeStart) {
      setCurrentShapeEnd({ x, y });
      return;
    }

    if (isDragging && draggedDotIndex !== null && isEditMode) {
      const relativeCoords = canvasToRelative(x, y);
      onDotDrag(draggedDotIndex, relativeCoords.x, relativeCoords.y);
    }
  };

  const handleMouseUp = () => {
    if (
      isDrawingShape &&
      shapeStart &&
      currentShapeEnd &&
      !draggedTag &&
      !resizingTag
    ) {
      const relativeStart = canvasToRelative(shapeStart.x, shapeStart.y);
      const relativeEnd = canvasToRelative(
        currentShapeEnd.x,
        currentShapeEnd.y
      );

      if (isVerticalTagMode) {
        // Create vertical connector shape
        let shapeData: Omit<
          VerticalConnector,
          "id" | "name" | "type" | "sharedId" | "createdAt"
        >;

        if (selectedShapeType === "circle") {
          const radius =
            Math.sqrt(
              (currentShapeEnd.x - shapeStart.x) ** 2 +
                (currentShapeEnd.y - shapeStart.y) ** 2
            ) / canvasSize.width;
          shapeData = {
            shape: "circle",
            x: relativeStart.x,
            y: relativeStart.y,
            radius,
            floorId: "", // Will be set by parent component
          };
        } else {
          const width = Math.abs(relativeEnd.x - relativeStart.x);
          const height = Math.abs(relativeEnd.y - relativeStart.y);
          const centerX = (relativeStart.x + relativeEnd.x) / 2;
          const centerY = (relativeStart.y + relativeEnd.y) / 2;

          shapeData = {
            shape: "rectangle",
            x: centerX,
            y: centerY,
            width,
            height,
            floorId: "", // Will be set by parent component
          };
        }

        onVerticalShapeDrawn(shapeData);
      } else {
        // Create regular tag shape
        let shapeData: Omit<TaggedLocation, "id" | "name" | "category">;

        if (selectedShapeType === "circle") {
          const radius =
            Math.sqrt(
              (currentShapeEnd.x - shapeStart.x) ** 2 +
                (currentShapeEnd.y - shapeStart.y) ** 2
            ) / canvasSize.width;
          shapeData = {
            shape: "circle",
            x: relativeStart.x,
            y: relativeStart.y,
            radius,
          };
        } else {
          const width = Math.abs(relativeEnd.x - relativeStart.x);
          const height = Math.abs(relativeEnd.y - relativeStart.y);
          const centerX = (relativeStart.x + relativeEnd.x) / 2;
          const centerY = (relativeStart.y + relativeEnd.y) / 2;

          shapeData = {
            shape: "rectangle",
            x: centerX,
            y: centerY,
            width,
            height,
          };
        }

        onShapeDrawn(shapeData);
      }
    }

    setIsDrawingShape(false);
    setShapeStart(null);
    setCurrentShapeEnd(null);
    setDraggedTag(null);
    setResizingTag(null);
    setResizeHandle(null);
    setIsDragging(false);
    setDraggedDotIndex(null);
  };

  const getCursorStyle = () => {
    if (isTagMode || isVerticalTagMode) {
      if (draggedTag) return "cursor-grabbing";
      if (resizingTag) return "cursor-resize";
      return "cursor-crosshair";
    }
    if (isPreviewMode) return "cursor-default";
    if (isEditMode && !isDragging) return "cursor-grab";
    if (isEditMode && isDragging) return "cursor-grabbing";
    if (isDesignMode) return "cursor-crosshair";
    return "cursor-default";
  };

  const getStatusMessage = () => {
    if (isVerticalTagMode) {
      return `Vertical Connector Mode: ${
        selectedShapeType === "circle"
          ? "Click center, drag for radius"
          : "Click and drag to create rectangle"
      } - Create elevators, stairs, or escalators`;
    }
    if (isTagMode) {
      if (isEditingTag) {
        return "Editing tag - Drag to move, use handles to resize, press Escape to finish editing";
      }
      return `Tag Mode: ${
        selectedShapeType === "circle"
          ? "Click center, drag for radius"
          : "Click and drag to create rectangle"
      } - Drag tags to move, resize handles to adjust size`;
    }
    if (isDesignMode && !isEditMode && !isPreviewMode) {
      if (hoveredConnector) {
        return `Hovering over ${hoveredConnector.name} - Click to switch floors, or click elsewhere to place a normal waypoint`;
      }
      return "Click to add waypoints • Click directly on vertical connectors to switch floors • Path snaps to nearby tags";
    }
    if (isEditMode) {
      return "Drag dots to reposition them, or click to add new waypoints";
    }
    if (isPreviewMode) {
      return "Preview mode - Search for a route to see the animated path";
    }
    return "";
  };

  const getStatusColor = () => {
    if (isVerticalTagMode) return "text-purple-600";
    if (isTagMode) return "text-orange-600";
    if (isDesignMode && !isEditMode && !isPreviewMode) return "text-blue-600";
    if (isEditMode) return "text-green-600";
    if (isPreviewMode) return "text-purple-600";
    return "text-gray-600";
  };

  // Handle escape key to exit tag editing
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isEditingTag) {
        setDraggedTag(null);
        setResizingTag(null);
        setResizeHandle(null);
        setIsEditingTag(false);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isEditingTag]);

  // Optimized render function using useCallback to prevent unnecessary re-renders
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageRef.current || !imageLoaded) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions if they've changed
    if (
      canvas.width !== canvasSize.width ||
      canvas.height !== canvasSize.height
    ) {
      canvas.width = canvasSize.width;
      canvas.height = canvasSize.height;
    }

    // Clear and draw background image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imageRef.current, 0, 0, canvasSize.width, canvasSize.height);

    // Only show animated paths when there's a specific selection in preview/published mode
    if (
      (isPreviewMode ||
        (!isDesignMode && !isEditMode && !isTagMode && !isVerticalTagMode)) &&
      selectedPathForAnimation
    ) {
      drawAnimatedPaths(ctx, [selectedPathForAnimation]);
    } else if (isDesignMode || isEditMode) {
      // In design/edit modes, show all published paths
      if (paths.length > 0) {
        drawAnimatedPaths(
          ctx,
          paths.filter((p) => p.isPublished)
        );
      }
    }

    if (animatedPath && animatedPath.length > 0) {
      const canvasPoints = animatedPath.map((p) => relativeToCanvas(p.x, p.y));
      drawPath(ctx, canvasPoints, "#3b82f6", false, true);
    }

    if (currentPath.length > 0 && (isDesignMode || isEditMode)) {
      const canvasPoints = currentPath.map((p) => relativeToCanvas(p.x, p.y));
      drawPath(ctx, canvasPoints, "#3b82f6", true);
    }

    // Draw tagged locations
    drawTags(ctx, tags);

    // Draw vertical connectors
    drawVerticalConnectors(ctx, verticalConnectors);

    // Draw current shape being drawn
    if (isDrawingShape && shapeStart && currentShapeEnd) {
      drawTemporaryShape(ctx, shapeStart, currentShapeEnd, selectedShapeType);
    }
  }, [
    imageLoaded,
    canvasSize,
    currentPath,
    isDesignMode,
    isEditMode,
    isPreviewMode,
    isTagMode,
    isVerticalTagMode,
    paths,
    animatedPath,
    tags,
    verticalConnectors,
    isDrawingShape,
    shapeStart,
    currentShapeEnd,
    selectedShapeType,
    tagAnimations,
    selectedPathForAnimation,
  ]);

  // Render effect - only triggers when renderCanvas changes
  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Animation frame for smooth animations
  useEffect(() => {
    let animationId: number;

    const animate = () => {
      renderCanvas();
      animationId = requestAnimationFrame(animate);
    };

    if (
      tagAnimations.size > 0 ||
      (animatedPath && animatedPath.length > 0) ||
      selectedPathForAnimation ||
      paths.some((p) => p.isPublished)
    ) {
      animationId = requestAnimationFrame(animate);
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [
    renderCanvas,
    tagAnimations,
    animatedPath,
    paths,
    selectedPathForAnimation,
  ]);

  return (
    <div ref={containerRef} className="p-4 w-full">
      <div className="flex justify-center">
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={`border border-gray-200 rounded-lg ${getCursorStyle()}`}
          style={{
            maxWidth: "100%",
            height: "auto",
            display: "block",
          }}
        />
      </div>
      {getStatusMessage() && (
        <p className={`text-sm mt-2 text-center ${getStatusColor()}`}>
          {getStatusMessage()}
        </p>
      )}
      {isEditingTag && (
        <div className="text-center mt-2">
          <button
            onClick={() => {
              setDraggedTag(null);
              setResizingTag(null);
              setResizeHandle(null);
              setIsEditingTag(false);
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
          >
            Finish Editing Tag
          </button>
        </div>
      )}
    </div>
  );
};
