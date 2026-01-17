import React, { useRef, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectNodesArray,
  selectConnections,
  selectCanvasOffset,
  selectZoom,
  selectIsPanning,
} from "../store/selectors";
import { updateCanvasOffset, updateZoom } from "../store/workflowSlice";
import { startPanning, stopPanning } from "../store/uiSlice";
import ActionNode from "./nodes/ActionNode";
import BranchNode from "./nodes/BranchNode";
import EndNode from "./nodes/EndNode";

const Canvas = () => {
  const dispatch = useDispatch();
  const canvasRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Get data from Redux
  const nodes = useSelector(selectNodesArray);
  const connections = useSelector(selectConnections);
  const canvasOffset = useSelector(selectCanvasOffset);
  const zoom = useSelector(selectZoom);
  const isPanning = useSelector(selectIsPanning);

  // Handle mouse down on canvas (start panning)
  const handleMouseDown = (e) => {
    // Only pan with middle mouse button or space + left click
    if (e.button === 1 || (e.button === 0 && e.target === canvasRef.current)) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - canvasOffset.x,
        y: e.clientY - canvasOffset.y,
      });
      dispatch(startPanning());
      e.preventDefault();
    }
  };

  // Handle mouse move (panning)
  const handleMouseMove = (e) => {
    if (isDragging) {
      const newOffset = {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      };
      dispatch(updateCanvasOffset(newOffset));
    }
  };

  // Handle mouse up (stop panning)
  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      dispatch(stopPanning());
    }
  };

  // Handle mouse wheel (zoom)
  const handleWheel = (e) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const delta = e.deltaY * -0.001;
      const newZoom = Math.max(0.1, Math.min(2, zoom + delta));
      dispatch(updateZoom(newZoom));
    }
  };

  // Add/remove event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener("wheel", handleWheel, { passive: false });
      return () => {
        canvas.removeEventListener("wheel", handleWheel);
      };
    }
  }, [zoom]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (isDragging) {
        dispatch(stopPanning());
      }
    };
  }, [isDragging]);

  // Render node based on type
  const renderNode = (node) => {
    const commonProps = {
      key: node.id,
      nodeId: node.id,
      offset: canvasOffset,
      zoom: zoom,
    };

    switch (node.type) {
      case "action":
        return <ActionNode {...commonProps} />;
      case "branch":
        return <BranchNode {...commonProps} />;
      case "end":
        return <EndNode {...commonProps} />;
      default:
        return <ActionNode {...commonProps} />;
    }
  };

  // Calculate connection line path
  const getConnectionPath = (fromNode, toNode) => {
    if (!fromNode || !toNode) return "";

    const startX = fromNode.position.x * zoom + canvasOffset.x + 75; // Node width/2
    const startY = fromNode.position.y * zoom + canvasOffset.y + 40; // Node height
    const endX = toNode.position.x * zoom + canvasOffset.x + 75;
    const endY = toNode.position.y * zoom + canvasOffset.y;

    // Create curved path
    const midY = (startY + endY) / 2;

    return `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`;
  };

  return (
    <div
      ref={canvasRef}
      className={`relative w-full h-screen overflow-hidden bg-gray-50 ${
        isDragging ? "cursor-grabbing" : "cursor-default"
      }`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Grid Background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #e5e7eb 1px, transparent 1px),
            linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
          `,
          backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
          backgroundPosition: `${canvasOffset.x}px ${canvasOffset.y}px`,
        }}
      />

      {/* SVG for connections */}
      <svg className="absolute inset-0 pointer-events-none">
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="#6b7280" />
          </marker>
        </defs>
        {connections.map((connection) => {
          const fromNode = nodes.find((n) => n.id === connection.fromNodeId);
          const toNode = nodes.find((n) => n.id === connection.toNodeId);

          if (!fromNode || !toNode) return null;

          return (
            <g key={connection.id}>
              <path
                d={getConnectionPath(fromNode, toNode)}
                stroke="#6b7280"
                strokeWidth="2"
                fill="none"
                markerEnd="url(#arrowhead)"
              />
              {connection.branchLabel && (
                <text
                  x={
                    (fromNode.position.x * zoom +
                      canvasOffset.x +
                      toNode.position.x * zoom +
                      canvasOffset.x) /
                      2 +
                    75
                  }
                  y={
                    (fromNode.position.y * zoom +
                      canvasOffset.y +
                      toNode.position.y * zoom +
                      canvasOffset.y) /
                      2 +
                    20
                  }
                  fill="#3b82f6"
                  fontSize="12"
                  fontWeight="600"
                  textAnchor="middle"
                  className="pointer-events-none"
                >
                  {connection.branchLabel}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Nodes */}
      <div className="relative w-full h-full">{nodes.map(renderNode)}</div>

      {/* Canvas Info */}
      <div className="absolute bottom-4 left-4 bg-white px-3 py-2 rounded shadow-md text-xs text-gray-600 font-mono">
        <div>Zoom: {(zoom * 100).toFixed(0)}%</div>
        <div>
          Pan: ({canvasOffset.x.toFixed(0)}, {canvasOffset.y.toFixed(0)})
        </div>
        <div>Nodes: {nodes.length}</div>
        <div className="text-gray-400 mt-1">Ctrl+Scroll to zoom</div>
      </div>
    </div>
  );
};

export default Canvas;
