import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // Add node menu state
  isAddNodeMenuOpen: false,
  addNodeMenuPosition: { x: 0, y: 0 },
  addNodeMenuParentId: null,

  // Context menu state
  contextMenuOpen: false,
  contextMenuPosition: { x: 0, y: 0 },
  contextMenuTarget: null, // { type: 'node' | 'connection' | 'canvas', id: string }

  // Drag state
  isDragging: false,
  draggedNodeId: null,

  // Canvas interaction state
  isPanning: false,
  isConnecting: false,
  connectingFromNodeId: null,

  // Sidebar/panel state
  isSidebarOpen: true,
  sidebarTab: "properties", // 'properties' | 'settings' | 'nodes'

  // Modal state
  activeModal: null, // 'settings' | 'export' | 'import' | 'help' | null

  // Notification/toast state
  notifications: [], // { id, type, message, duration }

  // Zoom controls
  showZoomControls: true,
  showMinimap: false,

  // Grid and snapping
  showGrid: true,
  snapToGrid: false,
  gridSize: 20,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    // Add node menu actions
    openAddNodeMenu: (state, action) => {
      const { position, parentNodeId } = action.payload;
      state.isAddNodeMenuOpen = true;
      state.addNodeMenuPosition = position;
      state.addNodeMenuParentId = parentNodeId;
    },

    closeAddNodeMenu: (state) => {
      state.isAddNodeMenuOpen = false;
      state.addNodeMenuPosition = { x: 0, y: 0 };
      state.addNodeMenuParentId = null;
    },

    // Context menu actions
    openContextMenu: (state, action) => {
      const { position, target } = action.payload;
      state.contextMenuOpen = true;
      state.contextMenuPosition = position;
      state.contextMenuTarget = target;
    },

    closeContextMenu: (state) => {
      state.contextMenuOpen = false;
      state.contextMenuPosition = { x: 0, y: 0 };
      state.contextMenuTarget = null;
    },

    // Drag actions
    startDragging: (state, action) => {
      state.isDragging = true;
      state.draggedNodeId = action.payload;
    },

    stopDragging: (state) => {
      state.isDragging = false;
      state.draggedNodeId = null;
    },

    // Canvas interaction actions
    startPanning: (state) => {
      state.isPanning = true;
    },

    stopPanning: (state) => {
      state.isPanning = false;
    },

    startConnecting: (state, action) => {
      state.isConnecting = true;
      state.connectingFromNodeId = action.payload;
    },

    stopConnecting: (state) => {
      state.isConnecting = false;
      state.connectingFromNodeId = null;
    },

    // Sidebar actions
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },

    setSidebarOpen: (state, action) => {
      state.isSidebarOpen = action.payload;
    },

    setSidebarTab: (state, action) => {
      state.sidebarTab = action.payload;
    },

    // Modal actions
    openModal: (state, action) => {
      state.activeModal = action.payload;
    },

    closeModal: (state) => {
      state.activeModal = null;
    },

    // Notification actions
    addNotification: (state, action) => {
      const notification = {
        id: Date.now().toString(),
        type: action.payload.type || "info",
        message: action.payload.message,
        duration: action.payload.duration || 3000,
      };
      state.notifications.push(notification);
    },

    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (notif) => notif.id !== action.payload
      );
    },

    clearNotifications: (state) => {
      state.notifications = [];
    },

    // Zoom controls
    toggleZoomControls: (state) => {
      state.showZoomControls = !state.showZoomControls;
    },

    toggleMinimap: (state) => {
      state.showMinimap = !state.showMinimap;
    },

    // Grid and snapping
    toggleGrid: (state) => {
      state.showGrid = !state.showGrid;
    },

    toggleSnapToGrid: (state) => {
      state.snapToGrid = !state.snapToGrid;
    },

    setGridSize: (state, action) => {
      state.gridSize = action.payload;
    },

    // Reset UI state
    resetUI: (state) => {
      return initialState;
    },
  },
});

export const {
  openAddNodeMenu,
  closeAddNodeMenu,
  openContextMenu,
  closeContextMenu,
  startDragging,
  stopDragging,
  startPanning,
  stopPanning,
  startConnecting,
  stopConnecting,
  toggleSidebar,
  setSidebarOpen,
  setSidebarTab,
  openModal,
  closeModal,
  addNotification,
  removeNotification,
  clearNotifications,
  toggleZoomControls,
  toggleMinimap,
  toggleGrid,
  toggleSnapToGrid,
  setGridSize,
  resetUI,
} = uiSlice.actions;

export default uiSlice.reducer;
