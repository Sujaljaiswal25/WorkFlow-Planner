/**
 * Testing utilities for the workflow builder
 * Use these in the browser console to test functionality
 */

import store from "../store/store";
import { addNode, deleteNode, updateNodeLabel } from "../store/workflowSlice";
import {
  manualSave,
  exportToJSON,
  getWorkflowStats,
  validateWorkflow,
  clearLocalStorage,
} from "./workflowExport";

/**
 * Get current workflow state
 */
export const getState = () => {
  return store.getState().workflow;
};

/**
 * Add a test workflow with multiple nodes
 */
export const createTestWorkflow = () => {
  // Add action node
  store.dispatch(
    addNode({
      type: "action",
      label: "Send Email",
      position: { x: 400, y: 150 },
      parentNodeId: "start-node",
    })
  );

  // Get the last added node ID
  const state = store.getState().workflow;
  const lastNodeId = Object.keys(state.nodes).pop();

  // Add branch node
  store.dispatch(
    addNode({
      type: "branch",
      label: "User Logged In?",
      position: { x: 400, y: 250 },
      parentNodeId: lastNodeId,
    })
  );

  const branchNodeId = Object.keys(store.getState().workflow.nodes).pop();

  // Add two action nodes from branch
  store.dispatch(
    addNode({
      type: "action",
      label: "Show Dashboard",
      position: { x: 300, y: 350 },
      parentNodeId: branchNodeId,
      branchLabel: "Yes",
    })
  );

  store.dispatch(
    addNode({
      type: "action",
      label: "Show Login Page",
      position: { x: 500, y: 350 },
      parentNodeId: branchNodeId,
      branchLabel: "No",
    })
  );

  // Add end nodes
  const nodes = Object.keys(store.getState().workflow.nodes);
  const lastTwo = nodes.slice(-2);

  lastTwo.forEach((nodeId, index) => {
    store.dispatch(
      addNode({
        type: "end",
        label: "Complete",
        position: { x: 300 + index * 200, y: 450 },
        parentNodeId: nodeId,
      })
    );
  });

  console.log("✅ Test workflow created!");
  console.log("📊 Stats:", getWorkflowStats(getState()));
};

/**
 * Clear everything and reset
 */
export const reset = () => {
  clearLocalStorage();
  window.location.reload();
};

/**
 * Test auto-save functionality
 */
export const testAutoSave = () => {
  console.log("🧪 Testing auto-save...");
  console.log("Adding a node - auto-save should trigger in 500ms");

  store.dispatch(
    addNode({
      type: "action",
      label: "Auto-save Test",
      position: { x: Math.random() * 800, y: Math.random() * 600 },
    })
  );

  console.log('⏳ Watch for "Workflow saved to localStorage" message...');
};

/**
 * Test manual save
 */
export const testManualSave = () => {
  console.log("🧪 Testing manual save...");
  const result = manualSave(getState());
  return result;
};

/**
 * Test export
 */
export const testExport = () => {
  console.log("🧪 Testing export...");
  const result = exportToJSON(getState());
  return result;
};

/**
 * Show current stats
 */
export const stats = () => {
  const s = getWorkflowStats(getState());
  console.log("📊 Workflow Statistics:");
  console.table(s);
  return s;
};

/**
 * Validate workflow
 */
export const validate = () => {
  const result = validateWorkflow(getState());
  console.log("🔍 Validation Result:");
  console.log(result);
  if (!result.valid) {
    console.table(result.issues);
  }
  return result;
};

/**
 * Log current state to console
 */
export const logState = () => {
  const state = getState();
  console.log("Current Workflow State:");
  console.log(JSON.stringify(state, null, 2));
  return state;
};

// Expose to window for browser console testing
if (typeof window !== "undefined") {
  window.workflowTest = {
    getState,
    createTestWorkflow,
    reset,
    testAutoSave,
    testManualSave,
    testExport,
    stats,
    validate,
    logState,
  };

  console.log("🧪 Workflow testing utilities loaded!");
  console.log("Available commands: window.workflowTest");
  console.log("  - createTestWorkflow() - Create sample workflow");
  console.log("  - testAutoSave() - Test auto-save");
  console.log("  - testManualSave() - Test manual save");
  console.log("  - testExport() - Test export");
  console.log("  - stats() - Show statistics");
  console.log("  - validate() - Validate workflow");
  console.log("  - logState() - Log current state");
  console.log("  - reset() - Clear and reset");
}
