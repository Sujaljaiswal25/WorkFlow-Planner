import { createSelector } from "@reduxjs/toolkit";

// Base selectors
export const selectWorkflowState = (state) => state.workflow;
export const selectUIState = (state) => state.ui;

// Workflow selectors
export const selectNodes = (state) => state.workflow.nodes;
export const selectConnections = (state) => state.workflow.connections;
export const selectSelectedNodeId = (state) => state.workflow.selectedNodeId;
export const selectCanvasOffset = (state) => state.workflow.canvasOffset;
export const selectZoom = (state) => state.workflow.zoom;

// Memoized selector: Get all nodes as an array
export const selectNodesArray = createSelector([selectNodes], (nodes) =>
  Object.values(nodes)
);

// Memoized selector: Get node by ID
export const selectNodeById = (nodeId) =>
  createSelector([selectNodes], (nodes) => nodes[nodeId] || null);

// Memoized selector: Get selected node
export const selectSelectedNode = createSelector(
  [selectNodes, selectSelectedNodeId],
  (nodes, selectedNodeId) => {
    if (!selectedNodeId) return null;
    return nodes[selectedNodeId] || null;
  }
);

// Memoized selector: Get connections for a specific node (outgoing)
export const selectConnectionsForNode = (nodeId) =>
  createSelector([selectConnections], (connections) =>
    connections.filter((conn) => conn.fromNodeId === nodeId)
  );

// Memoized selector: Get incoming connections for a node
export const selectIncomingConnectionsForNode = (nodeId) =>
  createSelector([selectConnections], (connections) =>
    connections.filter((conn) => conn.toNodeId === nodeId)
  );

// Memoized selector: Get child nodes for a parent node
export const selectChildNodesForNode = (parentNodeId) =>
  createSelector([selectNodes, selectConnections], (nodes, connections) => {
    const childNodeIds = connections
      .filter((conn) => conn.fromNodeId === parentNodeId)
      .map((conn) => conn.toNodeId);

    return childNodeIds.map((id) => nodes[id]).filter(Boolean);
  });

// Memoized selector: Get parent nodes for a child node
export const selectParentNodesForNode = (childNodeId) =>
  createSelector([selectNodes, selectConnections], (nodes, connections) => {
    const parentNodeIds = connections
      .filter((conn) => conn.toNodeId === childNodeId)
      .map((conn) => conn.fromNodeId);

    return parentNodeIds.map((id) => nodes[id]).filter(Boolean);
  });

// Memoized selector: Get all action nodes
export const selectActionNodes = createSelector([selectNodesArray], (nodes) =>
  nodes.filter((node) => node.type === "action")
);

// Memoized selector: Get all branch nodes
export const selectBranchNodes = createSelector([selectNodesArray], (nodes) =>
  nodes.filter((node) => node.type === "branch")
);

// Memoized selector: Get all end nodes
export const selectEndNodes = createSelector([selectNodesArray], (nodes) =>
  nodes.filter((node) => node.type === "end")
);

// Memoized selector: Get start node
export const selectStartNode = createSelector(
  [selectNodes],
  (nodes) => nodes["start-node"] || null
);

// Memoized selector: Get connection by ID
export const selectConnectionById = (connectionId) =>
  createSelector(
    [selectConnections],
    (connections) =>
      connections.find((conn) => conn.id === connectionId) || null
  );

// Memoized selector: Check if two nodes are connected
export const selectAreNodesConnected = (fromNodeId, toNodeId) =>
  createSelector([selectConnections], (connections) =>
    connections.some(
      (conn) => conn.fromNodeId === fromNodeId && conn.toNodeId === toNodeId
    )
  );

// Memoized selector: Get all root nodes (nodes with no parents)
export const selectRootNodes = createSelector(
  [selectNodesArray, selectConnections],
  (nodes, connections) => {
    const nodesWithParents = new Set(connections.map((conn) => conn.toNodeId));
    return nodes.filter((node) => !nodesWithParents.has(node.id));
  }
);

// Memoized selector: Get all leaf nodes (nodes with no children)
export const selectLeafNodes = createSelector(
  [selectNodesArray, selectConnections],
  (nodes, connections) => {
    const nodesWithChildren = new Set(
      connections.map((conn) => conn.fromNodeId)
    );
    return nodes.filter((node) => !nodesWithChildren.has(node.id));
  }
);

// Memoized selector: Get workflow statistics
export const selectWorkflowStats = createSelector(
  [selectNodesArray, selectConnections],
  (nodes, connections) => ({
    totalNodes: nodes.length,
    actionNodes: nodes.filter((n) => n.type === "action").length,
    branchNodes: nodes.filter((n) => n.type === "branch").length,
    endNodes: nodes.filter((n) => n.type === "end").length,
    totalConnections: connections.length,
  })
);

// Memoized selector: Check if workflow is valid (has at least one end node)
export const selectIsWorkflowValid = createSelector(
  [selectEndNodes],
  (endNodes) => endNodes.length > 0
);

// UI Selectors
export const selectIsAddNodeMenuOpen = (state) => state.ui.isAddNodeMenuOpen;
export const selectAddNodeMenuPosition = (state) =>
  state.ui.addNodeMenuPosition;
export const selectContextMenuOpen = (state) => state.ui.contextMenuOpen;
export const selectContextMenuPosition = (state) =>
  state.ui.contextMenuPosition;
export const selectIsDragging = (state) => state.ui.isDragging;
export const selectDraggedNodeId = (state) => state.ui.draggedNodeId;
export const selectIsPanning = (state) => state.ui.isPanning;
export const selectIsConnecting = (state) => state.ui.isConnecting;
export const selectConnectingFromNodeId = (state) =>
  state.ui.connectingFromNodeId;
export const selectIsSidebarOpen = (state) => state.ui.isSidebarOpen;
export const selectActiveModal = (state) => state.ui.activeModal;
export const selectNotifications = (state) => state.ui.notifications;
export const selectShowGrid = (state) => state.ui.showGrid;
export const selectSnapToGrid = (state) => state.ui.snapToGrid;
export const selectGridSize = (state) => state.ui.gridSize;
