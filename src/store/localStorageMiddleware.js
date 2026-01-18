/**
 * LocalStorage Middleware for Redux
 *
 * This middleware automatically saves the workflow state to localStorage
 * whenever the state changes. It persists:
 * - nodes
 * - connections
 * - canvasOffset
 * - zoom
 *
 * It does NOT persist:
 * - selectedNodeId (UI state that shouldn't persist)
 * - history (to avoid localStorage size issues)
 */

export const STORAGE_KEY = "workflow-builder-state";
export const SAVE_DELAY = 500; // milliseconds

// Throttle function to limit localStorage writes
let saveTimeout = null;
let saveCallbacks = [];

export const localStorageMiddleware = (store) => (next) => (action) => {
  const result = next(action);

  // Get the updated state after action is processed
  const state = store.getState();

  // Check if this is a manual save action - bypass debounce
  if (action.type === "workflow/manualSave") {
    // Clear any pending timeout
    if (saveTimeout) {
      clearTimeout(saveTimeout);
      saveTimeout = null;
    }

    // Save immediately
    const saveResult = saveToLocalStorage(state.workflow);

    // Log to console as required
    if (saveResult.success) {
      console.log(
        "📋 Workflow JSON:",
        JSON.stringify(
          {
            nodes: state.workflow.nodes,
            connections: state.workflow.connections,
            canvasOffset: state.workflow.canvasOffset,
            zoom: state.workflow.zoom,
          },
          null,
          2,
        ),
      );
    }

    // Execute any registered callbacks
    saveCallbacks.forEach((callback) => callback(saveResult));
    saveCallbacks = [];

    return result;
  }

  // Clear existing timeout for normal actions
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }

  // Debounce the save operation for normal actions
  saveTimeout = setTimeout(() => {
    const saveResult = saveToLocalStorage(state.workflow);

    // Execute any registered callbacks
    if (saveResult.success) {
      saveCallbacks.forEach((callback) => callback(saveResult));
      saveCallbacks = [];
    }
  }, SAVE_DELAY);

  return result;
};

/**
 * Register a callback to be executed after the next save
 * @param {Function} callback - Function to execute after save
 */
export const onNextSave = (callback) => {
  saveCallbacks.push(callback);
};

/**
 * Save state to localStorage with comprehensive error handling
 * @param {Object} state - The state to save
 * @returns {Object} Result object with success status and message
 */
export const saveToLocalStorage = (state) => {
  try {
    // Validate state object
    if (!state || typeof state !== "object") {
      throw new Error("Invalid state: must be an object");
    }

    // Select only the parts of state we want to persist
    const stateToPersist = {
      nodes: state.nodes || {},
      connections: state.connections || [],
      canvasOffset: state.canvasOffset || { x: 0, y: 0 },
      zoom: state.zoom || 1,
      savedAt: new Date().toISOString(), // Add timestamp
    };

    // Validate required fields
    if (!stateToPersist.nodes || typeof stateToPersist.nodes !== "object") {
      throw new Error("Invalid state: nodes must be an object");
    }

    if (!Array.isArray(stateToPersist.connections)) {
      throw new Error("Invalid state: connections must be an array");
    }

    // Serialize state
    const serializedState = JSON.stringify(stateToPersist);

    // Check localStorage quota
    const estimatedSize = new Blob([serializedState]).size;
    if (estimatedSize > 5 * 1024 * 1024) {
      // 5MB warning threshold
      console.warn(
        "Workflow state is large (>5MB), may exceed localStorage quota",
      );
    }

    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, serializedState);

    console.log("✅ Workflow saved to localStorage", {
      size: `${(estimatedSize / 1024).toFixed(2)}KB`,
      nodeCount: Object.keys(stateToPersist.nodes).length,
      connectionCount: stateToPersist.connections.length,
    });

    return {
      success: true,
      message: "Workflow saved successfully",
      size: estimatedSize,
      timestamp: stateToPersist.savedAt,
    };
  } catch (error) {
    // Handle specific error cases
    if (error.name === "QuotaExceededError") {
      console.error("❌ LocalStorage quota exceeded!", error);
      return {
        success: false,
        error: "quota_exceeded",
        message: "Storage quota exceeded. Please reduce workflow size.",
      };
    }

    if (error instanceof TypeError && error.message.includes("circular")) {
      console.error("❌ Circular reference in state!", error);
      return {
        success: false,
        error: "circular_reference",
        message: "Cannot save: circular reference detected in state.",
      };
    }

    console.error("❌ Error saving to localStorage:", error);
    return {
      success: false,
      error: "unknown",
      message: error.message || "Failed to save workflow",
    };
  }
};

/**
 * Load the persisted state from localStorage with validation
 * @returns {Object} Result object with state data or error information
 */
export const loadFromLocalStorage = () => {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);

    // No saved state found
    if (serializedState === null) {
      console.log("ℹ️ No saved workflow found in localStorage");
      return {
        success: false,
        error: "not_found",
        message: "No saved workflow found",
        state: null,
      };
    }

    // Parse the state
    let parsedState;
    try {
      parsedState = JSON.parse(serializedState);
    } catch (parseError) {
      console.error(
        "❌ Failed to parse saved state (corrupted data):",
        parseError,
      );
      // Clear corrupted data
      localStorage.removeItem(STORAGE_KEY);
      return {
        success: false,
        error: "parse_error",
        message: "Saved workflow is corrupted and has been cleared",
        state: null,
      };
    }

    // Validate state structure
    if (!parsedState || typeof parsedState !== "object") {
      console.error("❌ Invalid state structure");
      localStorage.removeItem(STORAGE_KEY);
      return {
        success: false,
        error: "invalid_structure",
        message: "Invalid workflow structure",
        state: null,
      };
    }

    // Validate required fields
    if (!parsedState.nodes || typeof parsedState.nodes !== "object") {
      console.error("❌ Missing or invalid nodes in saved state");
      return {
        success: false,
        error: "invalid_nodes",
        message: "Invalid node data in saved workflow",
        state: null,
      };
    }

    if (!Array.isArray(parsedState.connections)) {
      console.error("❌ Missing or invalid connections in saved state");
      return {
        success: false,
        error: "invalid_connections",
        message: "Invalid connection data in saved workflow",
        state: null,
      };
    }

    console.log("✅ Workflow loaded from localStorage", {
      nodeCount: Object.keys(parsedState.nodes).length,
      connectionCount: parsedState.connections.length,
      savedAt: parsedState.savedAt || "unknown",
    });

    return {
      success: true,
      message: "Workflow loaded successfully",
      state: parsedState,
    };
  } catch (error) {
    console.error("❌ Unexpected error loading from localStorage:", error);
    return {
      success: false,
      error: "unknown",
      message: error.message || "Failed to load workflow",
      state: null,
    };
  }
};

/**
 * Legacy support - returns state or undefined (for backward compatibility)
 * @returns {Object|undefined}
 */
export const loadState = () => {
  const result = loadFromLocalStorage();
  return result.success ? result.state : undefined;
};

/**
 * Clear the persisted state from localStorage
 * @returns {Object} Result object with success status
 */
export const clearLocalStorage = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log("✅ Workflow cleared from localStorage");
    return {
      success: true,
      message: "Workflow cleared successfully",
    };
  } catch (error) {
    console.error("❌ Error clearing localStorage:", error);
    return {
      success: false,
      error: "clear_failed",
      message: error.message || "Failed to clear workflow",
    };
  }
};

/**
 * Legacy support (for backward compatibility)
 */
export const clearState = clearLocalStorage;

/**
 * Get the size of the stored state in bytes
 * @returns {number} Size in bytes
 */
export const getStorageSize = () => {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);
    if (!serializedState) return 0;

    // Calculate size in bytes (UTF-16 encoding)
    return new Blob([serializedState]).size;
  } catch (error) {
    console.error("Error calculating storage size:", error);
    return 0;
  }
};
