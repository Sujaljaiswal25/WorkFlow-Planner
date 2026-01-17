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

const STORAGE_KEY = 'workflow-builder-state';

// Throttle function to limit localStorage writes
let saveTimeout = null;
const SAVE_DELAY = 500; // milliseconds

export const localStorageMiddleware = store => next => action => {
  const result = next(action);
  
  // Get the updated state after action is processed
  const state = store.getState();
  
  // Clear existing timeout
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  
  // Debounce the save operation
  saveTimeout = setTimeout(() => {
    try {
      // Select only the parts of state we want to persist
      const stateToPersist = {
        nodes: state.workflow.nodes,
        connections: state.workflow.connections,
        canvasOffset: state.workflow.canvasOffset,
        zoom: state.workflow.zoom
      };
      
      // Serialize and save to localStorage
      const serializedState = JSON.stringify(stateToPersist);
      localStorage.setItem(STORAGE_KEY, serializedState);
      
      console.log('Workflow saved to localStorage');
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, SAVE_DELAY);
  
  return result;
};

/**
 * Load the persisted state from localStorage
 * @returns {Object|undefined} The persisted state or undefined if not found
 */
export const loadState = () => {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);
    
    if (serializedState === null) {
      console.log('No saved workflow found in localStorage');
      return undefined;
    }
    
    const parsedState = JSON.parse(serializedState);
    console.log('Workflow loaded from localStorage');
    
    return parsedState;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return undefined;
  }
};

/**
 * Clear the persisted state from localStorage
 */
export const clearState = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('Workflow cleared from localStorage');
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
};

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
    console.error('Error calculating storage size:', error);
    return 0;
  }
};
