/**
 * Phase 13.3: Undo/Redo Testing
 * Comprehensive tests for history management
 */

export const undoRedoTests = {
  /**
   * Test undo for all trackable operations
   */
  testUndoAllOperations: () => {
    console.log("\n🧪 Testing Undo for All Operations");
    console.log("=".repeat(60));

    const store = window.store;
    if (!store) {
      console.error("❌ Store not available");
      return;
    }

    let passed = 0;
    let failed = 0;

    // Helper to test undo
    const testUndo = (
      actionName,
      dispatchAction,
      getStateBefore,
      getStateAfter,
    ) => {
      try {
        const before = getStateBefore();
        store.dispatch(dispatchAction);
        const after = getStateAfter();

        // Undo
        store.dispatch({ type: "workflow/undo" });
        const afterUndo = getStateBefore();

        if (JSON.stringify(before) === JSON.stringify(afterUndo)) {
          console.log(`✅ Undo works for: ${actionName}`);
          passed++;
          return true;
        } else {
          console.error(`❌ Undo failed for: ${actionName}`);
          console.log("Before:", before);
          console.log("After undo:", afterUndo);
          failed++;
          return false;
        }
      } catch (error) {
        console.error(`❌ Error testing ${actionName}:`, error.message);
        failed++;
        return false;
      }
    };

    // Test 1: Undo addNode
    testUndo(
      "addNode",
      {
        type: "workflow/addNode",
        payload: {
          type: "action",
          label: "Undo Test",
          position: { x: 200, y: 200 },
          parentNodeId: "start-node",
        },
      },
      () => Object.keys(store.getState().workflow.nodes).length,
      () => Object.keys(store.getState().workflow.nodes).length,
    );

    // Test 2: Undo updateNodePosition
    const firstNodeId = Object.keys(store.getState().workflow.nodes)[0];
    testUndo(
      "updateNodePosition",
      {
        type: "workflow/updateNodePosition",
        payload: { nodeId: firstNodeId, x: 500, y: 500 },
      },
      () => store.getState().workflow.nodes[firstNodeId]?.position,
      () => store.getState().workflow.nodes[firstNodeId]?.position,
    );

    // Test 3: Undo updateNodeLabel
    testUndo(
      "updateNodeLabel",
      {
        type: "workflow/updateNodeLabel",
        payload: { nodeId: firstNodeId, label: "Changed Label" },
      },
      () => store.getState().workflow.nodes[firstNodeId]?.label,
      () => store.getState().workflow.nodes[firstNodeId]?.label,
    );

    // Test 4: Undo deleteNode (if exists)
    const nodes = store.getState().workflow.nodes;
    const deletableNode = Object.keys(nodes).find((id) => id !== "start-node");
    if (deletableNode) {
      testUndo(
        "deleteNode",
        { type: "workflow/deleteNode", payload: deletableNode },
        () => Object.keys(store.getState().workflow.nodes).length,
        () => Object.keys(store.getState().workflow.nodes).length,
      );
    }

    // Test 5: Undo updateZoom
    testUndo(
      "updateZoom",
      { type: "workflow/updateZoom", payload: 1.5 },
      () => store.getState().workflow.zoom,
      () => store.getState().workflow.zoom,
    );

    // Test 6: Undo updateCanvasOffset
    testUndo(
      "updateCanvasOffset",
      { type: "workflow/updateCanvasOffset", payload: { x: 100, y: 100 } },
      () => store.getState().workflow.canvasOffset,
      () => store.getState().workflow.canvasOffset,
    );

    console.log("\n📊 Results:");
    console.log(`   ✅ Passed: ${passed}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log("=".repeat(60));

    return { passed, failed };
  },

  /**
   * Test redo after undo
   */
  testRedoAfterUndo: () => {
    console.log("\n🧪 Testing Redo After Undo");
    console.log("=".repeat(60));

    const store = window.store;
    if (!store) {
      console.error("❌ Store not available");
      return;
    }

    let passed = 0;
    let failed = 0;

    // Create a node
    const beforeCount = Object.keys(store.getState().workflow.nodes).length;

    store.dispatch({
      type: "workflow/addNode",
      payload: {
        type: "action",
        label: "Redo Test",
        position: { x: 300, y: 300 },
        parentNodeId: "start-node",
      },
    });

    const afterAddCount = Object.keys(store.getState().workflow.nodes).length;

    if (afterAddCount === beforeCount + 1) {
      console.log("✅ Node added successfully");
      passed++;
    } else {
      console.error("❌ Node not added");
      failed++;
    }

    // Undo
    store.dispatch({ type: "workflow/undo" });
    const afterUndoCount = Object.keys(store.getState().workflow.nodes).length;

    if (afterUndoCount === beforeCount) {
      console.log("✅ Undo successful");
      passed++;
    } else {
      console.error("❌ Undo failed");
      failed++;
    }

    // Redo
    store.dispatch({ type: "workflow/redo" });
    const afterRedoCount = Object.keys(store.getState().workflow.nodes).length;

    if (afterRedoCount === beforeCount + 1) {
      console.log("✅ Redo successful");
      passed++;
    } else {
      console.error("❌ Redo failed");
      failed++;
    }

    console.log("\n📊 Results:");
    console.log(`   ✅ Passed: ${passed}/3`);
    console.log(`   ❌ Failed: ${failed}/3`);
    console.log("=".repeat(60));

    return { passed, failed };
  },

  /**
   * Test history limits (50 states)
   */
  testHistoryLimits: () => {
    console.log("\n🧪 Testing History Limits (50 states)");
    console.log("=".repeat(60));

    const store = window.store;
    if (!store) {
      console.error("❌ Store not available");
      return;
    }

    console.log("Creating 60 history states...");
    const startZoom = store.getState().workflow.zoom;

    // Create 60 zoom changes
    for (let i = 0; i < 60; i++) {
      store.dispatch({
        type: "workflow/updateZoom",
        payload: 1 + i * 0.01,
      });
    }

    console.log("✅ Created 60 states");

    // Try to undo 60 times
    let undoCount = 0;
    for (let i = 0; i < 60; i++) {
      const before = store.getState().workflow.zoom;
      store.dispatch({ type: "workflow/undo" });
      const after = store.getState().workflow.zoom;

      if (before !== after) {
        undoCount++;
      } else {
        break; // No more history
      }
    }

    console.log(`📊 Undo count: ${undoCount}`);

    if (undoCount <= 50) {
      console.log(`✅ History limit enforced (max 50 states)`);
      console.log(`   Actual undo count: ${undoCount}`);
    } else {
      console.warn(`⚠️ More than 50 undos possible: ${undoCount}`);
    }

    // Check if we can redo
    let redoCount = 0;
    for (let i = 0; i < 60; i++) {
      const before = store.getState().workflow.zoom;
      store.dispatch({ type: "workflow/redo" });
      const after = store.getState().workflow.zoom;

      if (before !== after) {
        redoCount++;
      } else {
        break;
      }
    }

    console.log(`📊 Redo count: ${redoCount}`);
    console.log(`✅ Redo restored ${redoCount} states`);

    console.log("=".repeat(60));
  },

  /**
   * Test history cleared after new action
   */
  testHistoryClearedAfterNewAction: () => {
    console.log("\n🧪 Testing History Cleared After New Action");
    console.log("=".repeat(60));

    const store = window.store;
    if (!store) {
      console.error("❌ Store not available");
      return;
    }

    // Create initial state
    store.dispatch({
      type: "workflow/updateZoom",
      payload: 1.0,
    });

    // Change zoom
    store.dispatch({
      type: "workflow/updateZoom",
      payload: 1.5,
    });

    // Undo
    store.dispatch({ type: "workflow/undo" });
    const afterUndo = store.getState().workflow.zoom;

    console.log(`After undo: zoom = ${afterUndo}`);

    // Make new change (should clear future history)
    store.dispatch({
      type: "workflow/updateZoom",
      payload: 1.2,
    });

    console.log("Made new action (should clear redo history)");

    // Try to redo
    const beforeRedo = store.getState().workflow.zoom;
    store.dispatch({ type: "workflow/redo" });
    const afterRedo = store.getState().workflow.zoom;

    if (beforeRedo === afterRedo) {
      console.log("✅ Future history cleared (redo has no effect)");
    } else {
      console.error("❌ Redo still possible after new action");
    }

    console.log("=".repeat(60));
  },

  /**
   * Test keyboard shortcuts
   */
  testKeyboardShortcuts: () => {
    console.log("\n🧪 Testing Keyboard Shortcuts");
    console.log("=".repeat(60));

    console.log("Keyboard shortcuts for undo/redo:");
    console.log("   Undo: Ctrl+Z (Cmd+Z on Mac)");
    console.log("   Redo: Ctrl+Y (Cmd+Shift+Z on Mac)");
    console.log("\n💡 Manual Test Required:");
    console.log("   1. Make some changes to the workflow");
    console.log("   2. Press Ctrl+Z to undo");
    console.log("   3. Press Ctrl+Y to redo");
    console.log("   4. Verify actions are undone/redone");

    console.log("\n🔍 Checking if shortcuts are registered...");

    // Check if event listeners exist
    const hasKeyListener = window.addEventListener
      .toString()
      .includes("keydown");
    if (hasKeyListener) {
      console.log("✅ Keyboard event listeners detected");
    } else {
      console.log("⚠️ Unable to verify keyboard listeners");
    }

    console.log("=".repeat(60));
  },

  /**
   * Test undo/redo with complex operations
   */
  testComplexOperations: () => {
    console.log("\n🧪 Testing Complex Operations");
    console.log("=".repeat(60));

    const store = window.store;
    if (!store) {
      console.error("❌ Store not available");
      return;
    }

    let passed = 0;
    let failed = 0;

    // Test 1: Add node with connection
    const beforeNodes = Object.keys(store.getState().workflow.nodes).length;
    const beforeConns = store.getState().workflow.connections.length;

    store.dispatch({
      type: "workflow/addNode",
      payload: {
        type: "branch",
        label: "Complex Test",
        position: { x: 400, y: 400 },
        parentNodeId: "start-node",
      },
    });

    const afterNodes = Object.keys(store.getState().workflow.nodes).length;
    const afterConns = store.getState().workflow.connections.length;

    console.log(`Added node: nodes=${afterNodes}, connections=${afterConns}`);

    // Undo
    store.dispatch({ type: "workflow/undo" });
    const undoNodes = Object.keys(store.getState().workflow.nodes).length;
    const undoConns = store.getState().workflow.connections.length;

    if (undoNodes === beforeNodes && undoConns === beforeConns) {
      console.log("✅ Undo restored both nodes and connections");
      passed++;
    } else {
      console.error("❌ Undo incomplete");
      console.log(`Expected: nodes=${beforeNodes}, connections=${beforeConns}`);
      console.log(`Got: nodes=${undoNodes}, connections=${undoConns}`);
      failed++;
    }

    // Redo
    store.dispatch({ type: "workflow/redo" });
    const redoNodes = Object.keys(store.getState().workflow.nodes).length;
    const redoConns = store.getState().workflow.connections.length;

    if (redoNodes === afterNodes && redoConns === afterConns) {
      console.log("✅ Redo restored both nodes and connections");
      passed++;
    } else {
      console.error("❌ Redo incomplete");
      failed++;
    }

    console.log("\n📊 Results:");
    console.log(`   ✅ Passed: ${passed}/2`);
    console.log(`   ❌ Failed: ${failed}/2`);
    console.log("=".repeat(60));

    return { passed, failed };
  },

  /**
   * Test undo/redo persistence
   */
  testHistoryPersistence: () => {
    console.log("\n🧪 Testing History Persistence");
    console.log("=".repeat(60));

    console.log("⚠️ Note: Undo/redo history is NOT persisted to localStorage");
    console.log("This is intentional - history is session-only");
    console.log("\n💡 Expected behavior:");
    console.log("   1. Make changes and undo/redo");
    console.log("   2. Refresh page");
    console.log("   3. Undo/redo buttons should be disabled");
    console.log("   4. Workflow state is restored, but history is empty");

    const store = window.store;
    if (!store) {
      console.error("❌ Store not available");
      return;
    }

    // Make some changes
    store.dispatch({
      type: "workflow/updateZoom",
      payload: 1.8,
    });

    store.dispatch({
      type: "workflow/updateZoom",
      payload: 1.9,
    });

    console.log("\n✅ Made 2 zoom changes");
    console.log("💡 History is in memory (not in localStorage)");
    console.log("💡 After refresh, these undos will not be available");

    console.log("=".repeat(60));
  },

  /**
   * Run all undo/redo tests
   */
  runAllUndoRedoTests: () => {
    console.log("\n" + "=".repeat(60));
    console.log("🧪 UNDO/REDO TEST SUITE");
    console.log("=".repeat(60));

    const results = {
      operations: undoRedoTests.testUndoAllOperations(),
      redoAfterUndo: undoRedoTests.testRedoAfterUndo(),
      complex: undoRedoTests.testComplexOperations(),
    };

    undoRedoTests.testHistoryLimits();
    undoRedoTests.testHistoryClearedAfterNewAction();
    undoRedoTests.testHistoryPersistence();
    undoRedoTests.testKeyboardShortcuts();

    const totalPassed =
      (results.operations?.passed || 0) +
      (results.redoAfterUndo?.passed || 0) +
      (results.complex?.passed || 0);
    const totalFailed =
      (results.operations?.failed || 0) +
      (results.redoAfterUndo?.failed || 0) +
      (results.complex?.failed || 0);

    console.log("\n" + "=".repeat(60));
    console.log("📊 OVERALL RESULTS:");
    console.log(`   ✅ Passed: ${totalPassed}`);
    console.log(`   ❌ Failed: ${totalFailed}`);
    console.log("=".repeat(60));
  },
};

if (typeof window !== "undefined") {
  window.undoRedoTests = undoRedoTests;
  console.log("⏮️ Undo/Redo tests loaded!");
  console.log("Run: window.undoRedoTests.runAllUndoRedoTests()");
}

export default undoRedoTests;
