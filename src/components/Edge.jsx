import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { selectNodeById } from "../store/selectors";

/**
 * Line Type Utilities
 * Different path calculation strategies for connecting nodes
 */

// Straight line (direct connection)
export const calculateStraightPath = (startX, startY, endX, endY) => {
  return `M ${startX} ${startY} L ${endX} ${endY}`;
};

// Curved Bezier line (smooth vertical flow)
export const calculateBezierPath = (startX, startY, endX, endY) => {
  const deltaY = endY - startY;
  const controlPointOffset = Math.abs(deltaY) * 0.5;

  // Control points for smooth S-curve
  const controlY1 = startY + controlPointOffset;
  const controlY2 = endY - controlPointOffset;

  return `M ${startX} ${startY} C ${startX} ${controlY1}, ${endX} ${controlY2}, ${endX} ${endY}`;
};

// Step line (orthogonal/right-angle connections)
export const calculateStepPath = (startX, startY, endX, endY) => {
  const midY = (startY + endY) / 2;

  return `M ${startX} ${startY} L ${startX} ${midY} L ${endX} ${midY} L ${endX} ${endY}`;
};

// Enhanced Bezier with horizontal offset handling
export const calculateSmartBezierPath = (startX, startY, endX, endY) => {
  const deltaX = endX - startX;
  const deltaY = endY - startY;

  // Vertical distance determines curve intensity
  const verticalOffset = Math.max(Math.abs(deltaY) * 0.5, 50);

  // Horizontal offset handling
  if (Math.abs(deltaX) > 50) {
    // If nodes are horizontally separated, use adaptive curve
    const horizontalOffset = Math.abs(deltaX) * 0.3;
    const control1X =
      startX + (deltaX > 0 ? horizontalOffset : -horizontalOffset);
    const control2X =
      endX - (deltaX > 0 ? horizontalOffset : -horizontalOffset);

    return `M ${startX} ${startY} C ${control1X} ${
      startY + verticalOffset
    }, ${control2X} ${endY - verticalOffset}, ${endX} ${endY}`;
  }

  // Default vertical flow
  return `M ${startX} ${startY} C ${startX} ${
    startY + verticalOffset
  }, ${endX} ${endY - verticalOffset}, ${endX} ${endY}`;
};

/**
 * Edge Component - Renders a connection between two nodes
 *
 * Features:
 * - Memoized path calculations for performance
 * - Dynamic updates when node positions change
 * - Multiple line styles (straight, bezier, step)
 * - Hover and selection states
 * - Branch labels
 */
const Edge = React.memo(
  ({
    connectionId,
    fromNodeId,
    toNodeId,
    branchLabel,
    offset,
    zoom,
    lineType = "smart-bezier", // 'straight' | 'bezier' | 'step' | 'smart-bezier'
    onSelect,
    isSelected = false,
  }) => {
    // Get node data from Redux using selectors
    const fromNode = useSelector((state) => selectNodeById(fromNodeId)(state));
    const toNode = useSelector((state) => selectNodeById(toNodeId)(state));

    // Memoize position calculations
    const positions = useMemo(() => {
      if (!fromNode || !toNode) return null;

      // Calculate connection points (center-bottom of source, center-top of target)
      const nodeWidth = 144; // w-36 = 144px
      const nodeHeight = 80; // min-h-[80px]

      const startX =
        fromNode.position.x * zoom + offset.x + (nodeWidth / 2) * zoom;
      const startY = fromNode.position.y * zoom + offset.y + nodeHeight * zoom;
      const endX = toNode.position.x * zoom + offset.x + (nodeWidth / 2) * zoom;
      const endY = toNode.position.y * zoom + offset.y;

      return { startX, startY, endX, endY };
    }, [fromNode, toNode, offset, zoom]);

    // Memoize path calculation
    const path = useMemo(() => {
      if (!positions) return "";

      const { startX, startY, endX, endY } = positions;

      switch (lineType) {
        case "straight":
          return calculateStraightPath(startX, startY, endX, endY);
        case "bezier":
          return calculateBezierPath(startX, startY, endX, endY);
        case "step":
          return calculateStepPath(startX, startY, endX, endY);
        case "smart-bezier":
        default:
          return calculateSmartBezierPath(startX, startY, endX, endY);
      }
    }, [positions, lineType]);

    // Memoize label position (midpoint of path)
    const labelPosition = useMemo(() => {
      if (!positions) return null;

      const { startX, startY, endX, endY } = positions;

      return {
        x: (startX + endX) / 2,
        y: (startY + endY) / 2,
      };
    }, [positions]);

    // Don't render if nodes don't exist
    if (!fromNode || !toNode || !positions) return null;

    const handleClick = (e) => {
      e.stopPropagation();
      if (onSelect) {
        onSelect(connectionId);
      }
    };

    return (
      <g className="edge-group" onClick={handleClick}>
        {/* Invisible wider path for easier clicking/hovering */}
        <path
          d={path}
          stroke="transparent"
          strokeWidth="20"
          fill="none"
          className="cursor-pointer"
        />

        {/* Visible connection line */}
        <path
          d={path}
          stroke={isSelected ? "#3b82f6" : "#6b7280"}
          strokeWidth={isSelected ? 3 : 2}
          fill="none"
          markerEnd={`url(#arrowhead-${isSelected ? "selected" : "default"})`}
          className="transition-all duration-200 pointer-events-none"
          style={{
            filter: isSelected
              ? "drop-shadow(0 0 4px rgba(59, 130, 246, 0.5))"
              : "none",
          }}
        />

        {/* Branch label */}
        {branchLabel && labelPosition && (
          <g>
            {/* Label background */}
            <rect
              x={labelPosition.x - 25}
              y={labelPosition.y - 10}
              width={50}
              height={20}
              fill="white"
              stroke="#3b82f6"
              strokeWidth="1"
              rx="4"
              className="pointer-events-none"
            />
            {/* Label text */}
            <text
              x={labelPosition.x}
              y={labelPosition.y + 4}
              fill="#3b82f6"
              fontSize="12"
              fontWeight="600"
              textAnchor="middle"
              className="pointer-events-none select-none"
            >
              {branchLabel}
            </text>
          </g>
        )}

        {/* Hover/selection indicator */}
        {isSelected && positions && (
          <>
            {/* Start point indicator */}
            <circle
              cx={positions.startX}
              cy={positions.startY}
              r="4"
              fill="#3b82f6"
              className="pointer-events-none"
            />
            {/* End point indicator */}
            <circle
              cx={positions.endX}
              cy={positions.endY}
              r="4"
              fill="#3b82f6"
              className="pointer-events-none"
            />
          </>
        )}
      </g>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison for React.memo optimization
    // Only re-render if these specific props change
    return (
      prevProps.connectionId === nextProps.connectionId &&
      prevProps.fromNodeId === nextProps.fromNodeId &&
      prevProps.toNodeId === nextProps.toNodeId &&
      prevProps.branchLabel === nextProps.branchLabel &&
      prevProps.offset.x === nextProps.offset.x &&
      prevProps.offset.y === nextProps.offset.y &&
      prevProps.zoom === nextProps.zoom &&
      prevProps.lineType === nextProps.lineType &&
      prevProps.isSelected === nextProps.isSelected
    );
  }
);

Edge.displayName = "Edge";

export default Edge;
