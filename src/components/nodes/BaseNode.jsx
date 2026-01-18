import React, { useRef, useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectNodeById, selectSelectedNodeId } from "../../store/selectors";
import {
  updateNodePosition,
  selectNode,
  deleteNode,
  updateNodeLabel,
} from "../../store/workflowSlice";
import {
  startDragging,
  stopDragging,
  openAddNodeMenu,
} from "../../store/uiSlice";

/**
 * BaseNode - Reusable wrapper component for all node types
 *
 * Features:
 * - Connects to Redux for node data
 * - Handles dragging and positioning
 * - Shows connection points
 * - Manages selection state
 * - Supports inline editing
 */
const BaseNode = ({
  nodeId,
  offset,
  zoom,
  children,
  connectionPoints = { input: true, output: true },
  className = "",
  color = "blue",
}) => {
  const dispatch = useDispatch();
  const node = useSelector((state) => selectNodeById(nodeId)(state));
  const selectedNodeId = useSelector(selectSelectedNodeId);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [localPosition, setLocalPosition] = useState(null); // Optimistic UI state
  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState("");
  const inputRef = useRef(null);
  const throttleTimerRef = useRef(null);
  const lastUpdateTimeRef = useRef(0);

  if (!node) return null;

  const isSelected = selectedNodeId === nodeId;
  const isStartNode = nodeId === "start-node";

  // Use local position during drag, otherwise use Redux position
  const displayPosition = localPosition || node.position;

  // Calculate absolute position with zoom and pan
  const style = {
    position: "absolute",
    left: `${displayPosition.x * zoom + offset.x}px`,
    top: `${displayPosition.y * zoom + offset.y}px`,
    transform: `scale(${zoom})`,
    transformOrigin: "top left",
    cursor: isDragging ? "grabbing" : "grab",
    transition: isDragging ? "none" : "left 0.1s ease-out, top 0.1s ease-out",
    zIndex: isDragging ? 1000 : isSelected ? 100 : 10,
  };

  // Throttled Redux update (every 100ms during drag)
  const throttledUpdatePosition = useCallback(
    (position) => {
      const now = Date.now();
      const timeSinceLastUpdate = now - lastUpdateTimeRef.current;

      if (timeSinceLastUpdate >= 100) {
        dispatch(updateNodePosition({ nodeId, position }));
        lastUpdateTimeRef.current = now;
      } else {
        // Schedule update for later
        if (throttleTimerRef.current) {
          clearTimeout(throttleTimerRef.current);
        }
        throttleTimerRef.current = setTimeout(() => {
          dispatch(updateNodePosition({ nodeId, position }));
          lastUpdateTimeRef.current = Date.now();
        }, 100 - timeSinceLastUpdate);
      }
    },
    [dispatch, nodeId],
  );

  // Handle drag start
  const handleMouseDown = (e) => {
    if (isEditing) return;

    e.stopPropagation();
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      nodeX: node.position.x,
      nodeY: node.position.y,
    });
    dispatch(startDragging(nodeId));
    dispatch(selectNode(nodeId));
  };

  // Handle drag move
  const handleMouseMove = useCallback(
    (e) => {
      if (isDragging && dragStart) {
        const deltaX = (e.clientX - dragStart.x) / zoom;
        const deltaY = (e.clientY - dragStart.y) / zoom;

        const newPosition = {
          x: Math.max(0, dragStart.nodeX + deltaX),
          y: Math.max(0, dragStart.nodeY + deltaY),
        };

        // Update local state immediately for smooth UI
        setLocalPosition(newPosition);

        // Throttle Redux updates
        throttledUpdatePosition(newPosition);
      }
    },
    [isDragging, dragStart, zoom, throttledUpdatePosition],
  );

  // Handle drag end
  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      // Final Redux update with exact position
      if (localPosition) {
        dispatch(updateNodePosition({ nodeId, position: localPosition }));
      }

      // Clear throttle timer
      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current);
      }

      // Reset drag state
      setIsDragging(false);
      setLocalPosition(null);
      dispatch(stopDragging());
    }
  }, [isDragging, localPosition, dispatch, nodeId]);

  // Attach global mouse move and mouse up listeners during drag
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Handle keyboard delete for selected nodes
  useEffect(() => {
    if (!isSelected || isStartNode || isEditing) return;

    const handleKeyDown = (e) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        if (window.confirm(`Delete "${node.label}"?`)) {
          dispatch(deleteNode(nodeId));
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSelected, isStartNode, isEditing, nodeId, node.label, dispatch]);

  // Handle double click to edit
  const handleDoubleClick = (e) => {
    e.stopPropagation();
    if (!isStartNode) {
      setIsEditing(true);
      setEditLabel(node.label);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  // Handle edit save
  const handleEditSave = () => {
    const trimmedLabel = editLabel.trim();

    // Validate: require non-empty label
    if (!trimmedLabel) {
      alert("Node label cannot be empty!");
      setEditLabel(node.label);
      return;
    }

    // Only update if changed
    if (trimmedLabel !== node.label) {
      dispatch(updateNodeLabel({ nodeId, label: trimmedLabel }));
    }

    setIsEditing(false);
  };

  // Handle edit cancel
  const handleEditCancel = (e) => {
    if (e.key === "Escape") {
      setIsEditing(false);
      setEditLabel(node.label);
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleEditSave();
    }
  };

  // Handle delete
  const handleDelete = (e) => {
    e.stopPropagation();

    if (isStartNode) return;

    // Get connection info for confirmation message
    const childConnections = node.connections || [];
    const parentConnections = Object.values(
      window.store.getState().workflow.nodes,
    ).filter((n) => n.connections.includes(nodeId));

    let confirmMessage = `Delete "${node.label}"?`;

    if (childConnections.length > 0 && parentConnections.length > 0) {
      confirmMessage += `\n\nThis will reconnect ${parentConnections.length} parent(s) to ${childConnections.length} child(ren).`;
    } else if (childConnections.length > 0) {
      confirmMessage += `\n\n${childConnections.length} child node(s) will be disconnected.`;
    } else if (parentConnections.length > 0) {
      confirmMessage += `\n\nThis will remove the connection from ${parentConnections.length} parent(s).`;
    }

    if (window.confirm(confirmMessage)) {
      dispatch(deleteNode(nodeId));
    }
  };

  // Handle connection point click to add node
  const handleAddNodeClick = (e) => {
    e.stopPropagation();

    // Calculate the screen position of the connection point
    const rect = e.currentTarget.getBoundingClientRect();
    const position = {
      x: rect.left + rect.width / 2,
      y: rect.bottom + 10,
    };

    dispatch(
      openAddNodeMenu({
        position,
        parentNodeId: nodeId,
      }),
    );
  };

  // Color variants
  const colorClasses = {
    blue: "bg-blue-500 border-blue-600",
    green: "bg-green-500 border-green-600",
    yellow: "bg-yellow-500 border-yellow-600",
    red: "bg-red-500 border-red-600",
    purple: "bg-purple-500 border-purple-600",
    gray: "bg-gray-500 border-gray-600",
  };

  return (
    <div
      style={style}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      className={`
        w-36 min-h-[80px] rounded-lg shadow-lg group
        ${isSelected ? "ring-4 ring-blue-400" : ""}
        ${isDragging ? "shadow-2xl opacity-90" : ""}
        ${isEditing ? "ring-4 ring-yellow-400 shadow-2xl" : ""}
        ${className}
        transition-all duration-200
      `}
    >
      {/* Input Connection Point */}
      {connectionPoints.input && nodeId !== "start-node" && (
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-5 h-5 bg-blue-400 rounded-full border-2 border-white shadow-md" />
      )}

      {/* Node Content */}
      <div
        className={`
        w-full h-full rounded-lg border-2 
        ${colorClasses[color] || colorClasses.blue}
        text-white p-3 flex flex-col items-center justify-center
        ${!isStartNode && !isEditing ? "cursor-text" : ""}
      `}
        title={!isStartNode && !isEditing ? "Double-click to edit" : ""}
      >
        {isEditing ? (
          <div className="w-full space-y-1">
            <input
              ref={inputRef}
              type="text"
              value={editLabel}
              onChange={(e) => setEditLabel(e.target.value)}
              onBlur={handleEditSave}
              onKeyDown={handleEditCancel}
              maxLength={50}
              className="w-full px-2 py-1 text-sm text-gray-900 rounded border-2 border-blue-400 focus:border-blue-600 focus:outline-none shadow-inner"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              placeholder="Enter node label..."
            />
            <div className="text-xs text-blue-200 text-center">
              {editLabel.length}/50 • Enter to save • Esc to cancel
            </div>
          </div>
        ) : (
          <>
            {children || (
              <div className="text-sm font-medium text-center break-words w-full">
                {node.label}
              </div>
            )}
          </>
        )}

        {/* Node Type Badge */}
        <div className="absolute top-1 right-1 text-xs bg-black bg-opacity-20 px-1.5 py-0.5 rounded">
          {node.type}
        </div>

        {/* Delete Button */}
        {!isStartNode && (
          <button
            onClick={handleDelete}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full hover:bg-red-600 flex items-center justify-center text-xs font-bold shadow-lg transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
            title="Delete node (Del)"
          >
            ×
          </button>
        )}
      </div>

      {/* Output Connection Point */}
      {connectionPoints.output && node.type !== "end" && (
        <div
          onClick={handleAddNodeClick}
          className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-5 h-5 bg-green-500 rounded-full border-2 border-white cursor-pointer hover:bg-blue-500 hover:scale-125 transition-all shadow-md group"
          title="Click to add node"
        >
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Add Node
          </div>
        </div>
      )}

      {/* Multiple Output Points for Branch Nodes */}
      {connectionPoints.outputs && Array.isArray(connectionPoints.outputs) && (
        <div className="absolute -bottom-2 left-0 right-0 flex justify-around">
          {connectionPoints.outputs.map((output, index) => (
            <div
              key={index}
              onClick={handleAddNodeClick}
              className="w-5 h-5 bg-green-500 rounded-full border-2 border-white cursor-pointer hover:bg-blue-500 hover:scale-125 transition-all shadow-md group relative"
              title={`Click to add node (${output.label})`}
            >
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Add ({output.label})
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BaseNode;
