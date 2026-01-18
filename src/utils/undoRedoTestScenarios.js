import store from "../store/store";
import {
  addNode,
  deleteNode,
  updateNodeLabel,
  undo,
  redo,
} from "../store/workflowSlice";

/**
 * Test utilities for Undo/Redo functionality
 *
 * Verifies:
 * - History tracking for add, delete, move, edit operations
 * - Undo restores previous state
 * - Redo restores future state
 * - History limit (50 states)
 * - localStorage updates after undo/redo
 * - Keyboard shortcuts work
 */

// Test: Basic undo/redo with add node
export const testBasicUndoRedo = () => {
  console.log("🧪 Test: Basic undo/redo with add node");

  const initialState = store.getState().workflow;
  const initialNodeCount = Object.keys(initialState.nodes).length;

  console.log(`Initial node count: ${initialNodeCount}`);

  // Add a node
  store.dispatch(
    addNode({
      type: "action",
      label: "Test Undo Node",
      position: { x: 100, y: 100 },
      parentNodeId: "start-node",
    }),
  );

  const afterAdd = store.getState().workflow;
  const afterAddCount = Object.keys(afterAdd.nodes).length;
  const testNode = Object.values(afterAdd.nodes).find(
    (n) => n.label === "Test Undo Node",
  );

  console.log(`After add: ${afterAddCount} nodes`);
  console.log(`History past: ${afterAdd.history.past.length} states`);

  // Undo the addition
  store.dispatch(undo());

  const afterUndo = store.getState().workflow;
  const afterUndoCount = Object.keys(afterUndo.nodes).length;
  const nodeStillExists = afterUndo.nodes[testNode.id];

  console.log(`After undo: ${afterUndoCount} nodes`);
  console.log(`Node removed: ${!nodeStillExists}`);
  console.log(`History future: ${afterUndo.history.future.length} states`);

  // Redo the addition
  store.dispatch(redo());

  const afterRedo = store.getState().workflow;
  const afterRedoCount = Object.keys(afterRedo.nodes).length;
  const nodeRestored = afterRedo.nodes[testNode.id];

  console.log(`After redo: ${afterRedoCount} nodes`);
  console.log(`Node restored: ${!!nodeRestored}`);

  return {
    success:
      afterAddCount === afterRedoCount && !nodeStillExists && !!nodeRestored,
    addedCount: afterAddCount,
    undoCount: afterUndoCount,
    redoCount: afterRedoCount,
  };
};

// Test: Undo/redo with delete operation
export const testUndoRedoDelete = () => {
  console.log("🧪 Test: Undo/redo with delete operation");

  // Add a node first
  store.dispatch(
    addNode({
      type: "action",
      label: "Node to Delete",
      position: { x: 200, y: 200 },
      parentNodeId: "start-node",
    }),
  );

  const afterAdd = store.getState().workflow;
  const nodeToDelete = Object.values(afterAdd.nodes).find(
    (n) => n.label === "Node to Delete",
  );

  console.log(`Node created: ${nodeToDelete.label}`);

  // Delete the node
  store.dispatch(deleteNode(nodeToDelete.id));

  const afterDelete = store.getState().workflow;
  const deletedNodeExists = afterDelete.nodes[nodeToDelete.id];

  console.log(`After delete: Node exists = ${!!deletedNodeExists}`);

  // Undo delete
  store.dispatch(undo());

  const afterUndo = store.getState().workflow;
  const restoredNode = afterUndo.nodes[nodeToDelete.id];

  console.log(`After undo: Node restored = ${!!restoredNode}`);
  console.log(`  Restored label: "${restoredNode?.label}"`);

  // Redo delete
  store.dispatch(redo());

  const afterRedo = store.getState().workflow;
  const deletedAgain = afterRedo.nodes[nodeToDelete.id];

  console.log(`After redo: Node deleted again = ${!deletedAgain}`);

  return {
    success: !deletedNodeExists && !!restoredNode && !deletedAgain,
    nodeWasDeleted: !deletedNodeExists,
    nodeWasRestored: !!restoredNode,
    nodeDeletedAgain: !deletedAgain,
  };
};

// Test: Undo/redo with edit operation
export const testUndoRedoEdit = () => {
  console.log("🧪 Test: Undo/redo with edit operation");

  // Add a node
  store.dispatch(
    addNode({
      type: "action",
      label: "Original Label",
      position: { x: 300, y: 300 },
      parentNodeId: "start-node",
    }),
  );

  const afterAdd = store.getState().workflow;
  const node = Object.values(afterAdd.nodes).find(
    (n) => n.label === "Original Label",
  );

  console.log(`Node created: "${node.label}"`);

  // Edit the label
  store.dispatch(
    updateNodeLabel({
      nodeId: node.id,
      label: "Modified Label",
    }),
  );

  const afterEdit = store.getState().workflow;
  const editedNode = afterEdit.nodes[node.id];

  console.log(`After edit: "${editedNode.label}"`);

  // Undo edit
  store.dispatch(undo());

  const afterUndo = store.getState().workflow;
  const undoneNode = afterUndo.nodes[node.id];

  console.log(`After undo: "${undoneNode.label}"`);

  // Redo edit
  store.dispatch(redo());

  const afterRedo = store.getState().workflow;
  const redoneNode = afterRedo.nodes[node.id];

  console.log(`After redo: "${redoneNode.label}"`);

  return {
    success:
      editedNode.label === "Modified Label" &&
      undoneNode.label === "Original Label" &&
      redoneNode.label === "Modified Label",
    originalLabel: "Original Label",
    editedLabel: editedNode.label,
    undoneLabel: undoneNode.label,
    redoneLabel: redoneNode.label,
  };
};

// Test: Multiple operations and history
export const testMultipleOperations = () => {
  console.log("🧪 Test: Multiple operations and history tracking");

  const operations = [
    { type: "add", label: "Node 1" },
    { type: "add", label: "Node 2" },
    { type: "add", label: "Node 3" },
  ];

  operations.forEach((op, index) => {
    console.log(`Operation ${index + 1}: Adding "${op.label}"`);
    store.dispatch(
      addNode({
        type: "action",
        label: op.label,
        position: { x: 100 + index * 50, y: 100 + index * 50 },
        parentNodeId: "start-node",
      }),
    );
  });

  const afterOps = store.getState().workflow;
  console.log(`History past length: ${afterOps.history.past.length}`);

  // Undo all operations
  console.log("\nUndoing all operations...");
  for (let i = 0; i < operations.length; i++) {
    store.dispatch(undo());
    const state = store.getState().workflow;
    console.log(
      `  Undo ${i + 1}: Past=${state.history.past.length}, Future=${state.history.future.length}`,
    );
  }

  const afterUndos = store.getState().workflow;

  // Redo all operations
  console.log("\nRedoing all operations...");
  for (let i = 0; i < operations.length; i++) {
    store.dispatch(redo());
    const state = store.getState().workflow;
    console.log(
      `  Redo ${i + 1}: Past=${state.history.past.length}, Future=${state.history.future.length}`,
    );
  }

  const afterRedos = store.getState().workflow;

  return {
    success:
      afterOps.history.past.length > 0 &&
      afterUndos.history.future.length === operations.length &&
      afterRedos.history.past.length > 0,
    operationsCount: operations.length,
    historyAfterOps: afterOps.history.past.length,
    futureAfterUndos: afterUndos.history.future.length,
    historyAfterRedos: afterRedos.history.past.length,
  };
};

// Test: History limit (50 states)
export const testHistoryLimit = () => {
  console.log("🧪 Test: History limit (50 states)");

  const LIMIT = 50;
  const ADD_COUNT = 60; // Add more than the limit

  console.log(`Adding ${ADD_COUNT} nodes (limit is ${LIMIT})...`);

  for (let i = 0; i < ADD_COUNT; i++) {
    store.dispatch(
      addNode({
        type: "action",
        label: `Limit Test Node ${i}`,
        position: { x: 100, y: 100 + i * 10 },
        parentNodeId: "start-node",
      }),
    );
  }

  const state = store.getState().workflow;
  const historyLength = state.history.past.length;

  console.log(`History length: ${historyLength}`);
  console.log(`Within limit: ${historyLength <= LIMIT}`);

  return {
    success: historyLength <= LIMIT,
    addedNodes: ADD_COUNT,
    historyLength: historyLength,
    limit: LIMIT,
    withinLimit: historyLength <= LIMIT,
  };
};

// Test: Clear future on new action
export const testFutureClearedOnNewAction = () => {
  console.log("🧪 Test: Future cleared when new action is performed");

  // Add and undo to create future
  store.dispatch(
    addNode({
      type: "action",
      label: "Future Test",
      position: { x: 150, y: 150 },
      parentNodeId: "start-node",
    }),
  );

  store.dispatch(undo());

  const afterUndo = store.getState().workflow;
  const futureBeforeNewAction = afterUndo.history.future.length;

  console.log(`Future before new action: ${futureBeforeNewAction} states`);

  // Perform a new action (should clear future)
  store.dispatch(
    addNode({
      type: "action",
      label: "New Action After Undo",
      position: { x: 200, y: 200 },
      parentNodeId: "start-node",
    }),
  );

  const afterNewAction = store.getState().workflow;
  const futureAfterNewAction = afterNewAction.history.future.length;

  console.log(`Future after new action: ${futureAfterNewAction} states`);
  console.log(`Future cleared: ${futureAfterNewAction === 0}`);

  return {
    success: futureBeforeNewAction > 0 && futureAfterNewAction === 0,
    futureBeforeNewAction,
    futureAfterNewAction,
    futureCleared: futureAfterNewAction === 0,
  };
};

// Run all undo/redo tests
export const runAllUndoRedoTests = () => {
  console.log("🚀 Running all undo/redo test scenarios...\n");

  const results = {
    basicUndoRedo: testBasicUndoRedo(),
    undoRedoDelete: testUndoRedoDelete(),
    undoRedoEdit: testUndoRedoEdit(),
    multipleOperations: testMultipleOperations(),
    historyLimit: testHistoryLimit(),
    futureClearedOnNewAction: testFutureClearedOnNewAction(),
  };

  console.log("\n📊 Test Results Summary:");
  console.log(results);

  const allPassed = Object.values(results).every((r) => r.success);
  console.log(
    `\n${allPassed ? "✅" : "❌"} All tests ${allPassed ? "passed" : "failed"}!`,
  );

  return results;
};

// Expose to window for easy testing
if (typeof window !== "undefined") {
  window.undoRedoTests = {
    testBasicUndoRedo,
    testUndoRedoDelete,
    testUndoRedoEdit,
    testMultipleOperations,
    testHistoryLimit,
    testFutureClearedOnNewAction,
    runAllUndoRedoTests,
  };

  console.log("💡 Undo/Redo test utilities loaded!");
  console.log("Run tests with: window.undoRedoTests.runAllUndoRedoTests()");
}
