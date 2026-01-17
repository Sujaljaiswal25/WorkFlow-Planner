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
import Edge from "./Edge";
import LineTypeSelector from "./LineTypeSelector";

const Canvas = () => {
  const dispatch = useDispatch();
  const canvasRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedEdgeId, setSelectedEdgeId] = useState(null);
  const [lineType, setLineType] = useState("smart-bezier");

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

  // Handle edge selection
  const handleEdgeSelect = (edgeId) => {
    setSelectedEdgeId(edgeId);
  };

  // Clear edge selection when clicking canvas
  const handleCanvasClick = () => {
    setSelectedEdgeId(null);
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
      onClick={handleCanvasClick}
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
      <svg
        className="absolute inset-0 pointer-events-auto"
        style={{ pointerEvents: "none" }}
      >
        <defs>
          {/* Default arrowhead */}
          <marker
            id="arrowhead-default"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="#6b7280" />
          </marker>

          {/* Selected arrowhead */}
          <marker
            id="arrowhead-selected"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="#3b82f6" />
          </marker>
        </defs>

        {/* Render all connections using Edge component */}
        <g style={{ pointerEvents: "auto" }}>
          {connections.map((connection) => (
            <Edge
              key={connection.id}
              connectionId={connection.id}
              fromNodeId={connection.fromNodeId}
              toNodeId={connection.toNodeId}
              branchLabel={connection.branchLabel}
              offset={canvasOffset}
              zoom={zoom}
              lineType={lineType}
              onSelect={handleEdgeSelect}
              isSelected={selectedEdgeId === connection.id}
            />
          ))}
        </g>
      </svg>

      {/* Nodes */}
      <div className="relative w-full h-full">{nodes.map(renderNode)}</div>

      {/* Line Type Selector */}
      <LineTypeSelector currentType={lineType} onChange={setLineType} />

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
