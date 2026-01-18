/**
 * History Middleware for Undo/Redo Functionality
 *
 * Tracks specific Redux actions and maintains a history of states
 * for undo/redo operations.
 *
 * Features:
 * - Tracks node add, delete, move, and edit operations
 * - Maintains past and future state arrays
 * - Limits history size to prevent memory issues
 * - Clears future when new action is performed
 */

const HISTORY_LIMIT = 50;

// Actions that should be tracked in history
const TRACKABLE_ACTIONS = [
  "workflow/addNode",
  "workflow/deleteNode",
  "workflow/updateNodeLabel",
  "workflow/updateNode",
  "workflow/updateNodePosition",
  "workflow/moveNode",
  "workflow/addConnection",
  "workflow/deleteConnection",
  "workflow/removeConnection",
  "workflow/updateConnection",
];

// Actions that should NOT trigger history tracking
const NON_TRACKABLE_ACTIONS = [
  "workflow/undo",
  "workflow/redo",
  "workflow/selectNode",
  "workflow/clearSelection",
  "workflow/updateCanvasOffset",
  "workflow/setCanvasOffset",
  "workflow/updateZoom",
  "workflow/resetView",
  "workflow/loadWorkflow",
  "workflow/resetWorkflow",
];

/**
 * Create a snapshot of the current workflow state
 * Excludes history itself to prevent circular references
 */
const createSnapshot = (state) => {
  const { history, ...workflowState } = state;
  return JSON.parse(JSON.stringify(workflowState));
};

/**
 * History Middleware
 * Intercepts actions and manages undo/redo history
 */
export const historyMiddleware = (store) => (next) => (action) => {
  const stateBefore = store.getState().workflow;

  // Check if this action should be tracked
  const shouldTrack = TRACKABLE_ACTIONS.includes(action.type);

  // If it's a trackable action, save current state to history
  if (shouldTrack && stateBefore) {
    const snapshot = createSnapshot(stateBefore);

    // We'll modify the action to include history update
    // This will be handled in the reducer
    action.meta = {
      ...action.meta,
      trackHistory: true,
      snapshot: snapshot,
    };
  }

  // Continue with the action
  return next(action);
};

export default historyMiddleware;
