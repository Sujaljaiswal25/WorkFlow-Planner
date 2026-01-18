import React, { useRef, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectNodesArray,
  selectConnections,
  selectCanvasOffset,
  selectZoom,
  selectIsPanning,
  selectIsDragging,
} from "../store/selectors";
import { updateCanvasOffset, updateZoom } from "../store/workflowSlice";
import { startPanning, stopPanning, closeAddNodeMenu } from "../store/uiSlice";
import ActionNode from "./nodes/ActionNode";
import BranchNode from "./nodes/BranchNode";
import EndNode from "./nodes/EndNode";
import Edge from "./Edge";
import LineTypeSelector from "./LineTypeSelector";
import AddNodeMenu from "./AddNodeMenu";
import ZoomControls from "./ZoomControls";

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
  const isNodeDragging = useSelector(selectIsDragging);
  const isAddNodeMenuOpen = useSelector((state) => state.ui.isAddNodeMenuOpen);
  const addNodeMenuPosition = useSelector(
    (state) => state.ui.addNodeMenuPosition,
  );
  const addNodeMenuParentId = useSelector(
    (state) => state.ui.addNodeMenuParentId,
  );

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
    dispatch(closeAddNodeMenu());
  };

  return (
    <div
      ref={canvasRef}
      className={`relative w-full h-screen overflow-hidden bg-gray-50 ${
        isDragging
          ? "cursor-grabbing"
          : isNodeDragging
            ? "cursor-grabbing"
            : "cursor-default"
      }`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleCanvasClick}
    >
      {/* Enhanced Grid Background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(203, 213, 225, 0.3) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(203, 213, 225, 0.3) 1px, transparent 1px),
            linear-gradient(to right, rgba(148, 163, 184, 0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(148, 163, 184, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: `${20 * zoom}px ${20 * zoom}px, ${20 * zoom}px ${20 * zoom}px, ${100 * zoom}px ${100 * zoom}px, ${100 * zoom}px ${100 * zoom}px`,
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

      {/* Enhanced Canvas Info */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-3 rounded-xl shadow-lg border border-gray-200 text-xs text-gray-600 font-mono transition-all hover:shadow-xl">
        <div className="flex items-center gap-2">
          <span className="text-blue-500 font-bold">🔍</span>
          <span className="font-semibold">Zoom:</span>
          <span className="text-gray-900">{(zoom * 100).toFixed(0)}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-green-500 font-bold">🖐️</span>
          <span className="font-semibold">Pan:</span>
          <span className="text-gray-900">
            ({canvasOffset.x.toFixed(0)}, {canvasOffset.y.toFixed(0)})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-purple-500 font-bold">📦</span>
          <span className="font-semibold">Nodes:</span>
          <span className="text-gray-900">{nodes.length}</span>
        </div>
        <div className="text-gray-400 mt-2 pt-2 border-t border-gray-200">
          <span className="text-blue-500">⌨️</span> Ctrl+Scroll to zoom
        </div>
      </div>

      {/* Add Node Menu */}
      <AddNodeMenu
        isOpen={isAddNodeMenuOpen}
        position={addNodeMenuPosition}
        parentNodeId={addNodeMenuParentId}
        zoom={zoom}
        canvasOffset={canvasOffset}
      />

      {/* Zoom Controls */}
      <ZoomControls />
    </div>
  );
};

export default Canvas;
