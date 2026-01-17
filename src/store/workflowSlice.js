import { createSlice } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";

/**
 * Node Object Structure:
 * {
 *   id: string (UUID),
 *   type: 'action' | 'branch' | 'end',
 *   label: string,
 *   position: { x: number, y: number },
 *   connections: string[] (array of child node IDs)
 *   // For branch nodes specifically:
 *   branchLabels?: { [connectionId]: string } (e.g., { 'node-123': 'Yes', 'node-456': 'No' })
 * }
 *
 * Connection/Edge Object Structure:
 * {
 *   id: string (UUID),
 *   fromNodeId: string,
 *   toNodeId: string,
 *   branchLabel?: string (optional, for branch nodes: 'Yes', 'No', 'Maybe', etc.)
 * }
 */

// Initialize with a "Start" node
const initialStartNode = {
  id: "start-node",
  type: "action",
  label: "Start",
  position: { x: 400, y: 50 },
  connections: [],
};

const initialState = {
  // Nodes stored as object/map with node IDs as keys for O(1) access
  nodes: {
    "start-node": initialStartNode,
  },

  // Array of edge/connection objects
  connections: [],

  // UI state
  selectedNodeId: null,

  // Canvas state for pan and zoom
  canvasOffset: { x: 0, y: 0 },
  zoom: 1,

  // History for undo/redo functionality
  history: {
    past: [],
    future: [],
  },
};

const workflowSlice = createSlice({
  name: "workflow",
  initialState,
  reducers: {
    // Add a new node
    addNode: (state, action) => {
      const { type, label, position, parentNodeId } = action.payload;
      const newNodeId = uuidv4();

      const newNode = {
        id: newNodeId,
        type,
        label: label || `New ${type} node`,
        position: position || { x: 400, y: 200 },
        connections: [],
        ...(type === "branch" && { branchLabels: {} }),
      };

      state.nodes[newNodeId] = newNode;

      // If parent node is provided, create a connection
      if (parentNodeId && state.nodes[parentNodeId]) {
        const connectionId = uuidv4();
        state.connections.push({
          id: connectionId,
          fromNodeId: parentNodeId,
          toNodeId: newNodeId,
          branchLabel: action.payload.branchLabel || null,
        });

        state.nodes[parentNodeId].connections.push(newNodeId);

        // For branch nodes, store the branch label mapping
        if (
          state.nodes[parentNodeId].type === "branch" &&
          action.payload.branchLabel
        ) {
          if (!state.nodes[parentNodeId].branchLabels) {
            state.nodes[parentNodeId].branchLabels = {};
          }
          state.nodes[parentNodeId].branchLabels[newNodeId] =
            action.payload.branchLabel;
        }
      }
    },

    // Delete a node and reconnect the flow
    deleteNode: (state, action) => {
      const nodeId = action.payload;

      // Don't allow deleting the start node
      if (nodeId === "start-node") return;

      const nodeToDelete = state.nodes[nodeId];
      if (!nodeToDelete) return;

      // Find all connections where this node is the source
      const outgoingConnections = state.connections.filter(
        (conn) => conn.fromNodeId === nodeId
      );

      // Find all connections where this node is the target
      const incomingConnections = state.connections.filter(
        (conn) => conn.toNodeId === nodeId
      );

      // Reconnect: for each parent, connect to all children of deleted node
      incomingConnections.forEach((incomingConn) => {
        const parentNode = state.nodes[incomingConn.fromNodeId];
        if (parentNode) {
          // Remove connection to deleted node
          parentNode.connections = parentNode.connections.filter(
            (id) => id !== nodeId
          );

          // Add connections to children of deleted node
          outgoingConnections.forEach((outgoingConn) => {
            if (!parentNode.connections.includes(outgoingConn.toNodeId)) {
              parentNode.connections.push(outgoingConn.toNodeId);

              // Create new connection
              const newConnectionId = uuidv4();
              state.connections.push({
                id: newConnectionId,
                fromNodeId: incomingConn.fromNodeId,
                toNodeId: outgoingConn.toNodeId,
                branchLabel: incomingConn.branchLabel || null,
              });
            }
          });
        }
      });

      // Remove all connections involving this node
      state.connections = state.connections.filter(
        (conn) => conn.fromNodeId !== nodeId && conn.toNodeId !== nodeId
      );

      // Remove node from all parent connections arrays
      Object.values(state.nodes).forEach((node) => {
        node.connections = node.connections.filter((id) => id !== nodeId);
        if (node.branchLabels && node.branchLabels[nodeId]) {
          delete node.branchLabels[nodeId];
        }
      });

      // Delete the node
      delete state.nodes[nodeId];

      // Clear selection if this node was selected
      if (state.selectedNodeId === nodeId) {
        state.selectedNodeId = null;
      }
    },

    // Update node label/text
    updateNodeLabel: (state, action) => {
      const { nodeId, label } = action.payload;
      if (state.nodes[nodeId]) {
        state.nodes[nodeId].label = label;
      }
    },

    // Update node (generic update for any node property)
    updateNode: (state, action) => {
      const { nodeId, updates } = action.payload;
      if (state.nodes[nodeId]) {
        state.nodes[nodeId] = {
          ...state.nodes[nodeId],
          ...updates,
        };
      }
    },

    // Update node position (for drag & drop)
    updateNodePosition: (state, action) => {
      const { nodeId, position } = action.payload;
      if (state.nodes[nodeId]) {
        state.nodes[nodeId].position = position;
      }
    },

    // Move node (alias for updateNodePosition, for clarity)
    moveNode: (state, action) => {
      const { nodeId, position } = action.payload;
      if (state.nodes[nodeId]) {
        state.nodes[nodeId].position = position;
      }
    },

    // Add a connection between two nodes
    addConnection: (state, action) => {
      const { fromNodeId, toNodeId, branchLabel } = action.payload;

      if (!state.nodes[fromNodeId] || !state.nodes[toNodeId]) return;

      // Check if connection already exists
      const exists = state.connections.some(
        (conn) => conn.fromNodeId === fromNodeId && conn.toNodeId === toNodeId
      );

      if (!exists) {
        const connectionId = uuidv4();
        state.connections.push({
          id: connectionId,
          fromNodeId,
          toNodeId,
          branchLabel: branchLabel || null,
        });

        if (!state.nodes[fromNodeId].connections.includes(toNodeId)) {
          state.nodes[fromNodeId].connections.push(toNodeId);
        }

        // For branch nodes, store the branch label
        if (state.nodes[fromNodeId].type === "branch" && branchLabel) {
          if (!state.nodes[fromNodeId].branchLabels) {
            state.nodes[fromNodeId].branchLabels = {};
          }
          state.nodes[fromNodeId].branchLabels[toNodeId] = branchLabel;
        }
      }
    },

    // Delete a connection
    deleteConnection: (state, action) => {
      const connectionId = action.payload;
      const connection = state.connections.find(
        (conn) => conn.id === connectionId
      );

      if (connection) {
        // Remove from parent node's connections array
        const parentNode = state.nodes[connection.fromNodeId];
        if (parentNode) {
          parentNode.connections = parentNode.connections.filter(
            (id) => id !== connection.toNodeId
          );

          // Remove branch label if exists
          if (
            parentNode.branchLabels &&
            parentNode.branchLabels[connection.toNodeId]
          ) {
            delete parentNode.branchLabels[connection.toNodeId];
          }
        }

        // Remove connection
        state.connections = state.connections.filter(
          (conn) => conn.id !== connectionId
        );
      }
    },

    // Remove connection (alias for deleteConnection)
    removeConnection: (state, action) => {
      const connectionId = action.payload;
      const connection = state.connections.find(
        (conn) => conn.id === connectionId
      );

      if (connection) {
        const parentNode = state.nodes[connection.fromNodeId];
        if (parentNode) {
          parentNode.connections = parentNode.connections.filter(
            (id) => id !== connection.toNodeId
          );

          if (
            parentNode.branchLabels &&
            parentNode.branchLabels[connection.toNodeId]
          ) {
            delete parentNode.branchLabels[connection.toNodeId];
          }
        }

        state.connections = state.connections.filter(
          (conn) => conn.id !== connectionId
        );
      }
    },

    // Update connection (e.g., change branch label)
    updateConnection: (state, action) => {
      const { connectionId, updates } = action.payload;
      const connection = state.connections.find(
        (conn) => conn.id === connectionId
      );

      if (connection) {
        Object.assign(connection, updates);

        // If branch label is updated, also update in the node's branchLabels
        if (updates.branchLabel !== undefined) {
          const fromNode = state.nodes[connection.fromNodeId];
          if (fromNode && fromNode.type === "branch") {
            if (!fromNode.branchLabels) {
              fromNode.branchLabels = {};
            }
            fromNode.branchLabels[connection.toNodeId] = updates.branchLabel;
          }
        }
      }
    },

    // Select a node
    selectNode: (state, action) => {
      state.selectedNodeId = action.payload;
    },

    // Clear selection
    clearSelection: (state) => {
      state.selectedNodeId = null;
    },

    // Update canvas offset (for panning)
    updateCanvasOffset: (state, action) => {
      state.canvasOffset = action.payload;
    },

    // Set canvas offset (alias for updateCanvasOffset)
    setCanvasOffset: (state, action) => {
      state.canvasOffset = action.payload;
    },

    // Update zoom level
    updateZoom: (state, action) => {
      state.zoom = Math.max(0.1, Math.min(2, action.payload)); // Limit zoom between 0.1x and 2x
    },

    // Reset zoom and pan
    resetView: (state) => {
      state.canvasOffset = { x: 0, y: 0 };
      state.zoom = 1;
    },

    // Undo functionality (will be implemented later)
    undo: (state) => {
      // TODO: Implement undo logic using history
    },

    // Redo functionality (will be implemented later)
    redo: (state) => {
      // TODO: Implement redo logic using history
    },

    // Load workflow state (for localStorage loading)
    loadWorkflow: (state, action) => {
      return { ...initialState, ...action.payload };
    },

    // Reset workflow to initial state
    resetWorkflow: (state) => {
      return initialState;
    },
  },
});

export const {
  addNode,
  deleteNode,
  updateNodeLabel,
  updateNode,
  updateNodePosition,
  moveNode,
  addConnection,
  deleteConnection,
  removeConnection,
  updateConnection,
  selectNode,
  clearSelection,
  updateCanvasOffset,
  setCanvasOffset,
  updateZoom,
  resetView,
  undo,
  redo,
  loadWorkflow,
  resetWorkflow,
} = workflowSlice.actions;

export default workflowSlice.reducer;
