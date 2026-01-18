/**
 * Phase 12: Save/Export/Import/Reset Test Scenarios
 *
 * Comprehensive tests for workflow persistence features
 */

export const workflowActionsTests = {
  /**
   * Test 1: Manual Save
   * Verify immediate save bypasses debounce and logs JSON
   */
  testManualSave: () => {
    console.log("\n🧪 Test 1: Manual Save");
    console.log("=".repeat(50));

    const store = window.store;
    if (!store) {
      console.error("❌ Store not available");
      return;
    }

    console.log("1. Triggering manual save...");
    store.dispatch({ type: "workflow/manualSave" });

    console.log("2. Check console for JSON output");
    console.log("3. Check SaveIndicator for success message");
    console.log("✅ Manual save test completed - verify JSON was logged");
  },

  /**
   * Test 2: Export to File
   * Verify workflow exports as downloadable JSON
   */
  testExportToFile: () => {
    console.log("\n🧪 Test 2: Export to File");
    console.log("=".repeat(50));

    const store = window.store;
    if (!store) {
      console.error("❌ Store not available");
      return;
    }

    const state = store.getState().workflow;

    const exportData = {
      nodes: state.nodes,
      connections: state.connections,
      canvasOffset: state.canvasOffset,
      zoom: state.zoom,
      exportedAt: new Date().toISOString(),
      version: "1.0",
    };

    console.log("📤 Export data structure:");
    console.log(JSON.stringify(exportData, null, 2));
    console.log("\n✅ Export test completed");
    console.log("📋 To test fully: Click 'Export' button in UI");
  },

  /**
   * Test 3: Copy to Clipboard
   * Verify workflow can be copied to clipboard
   */
  testCopyToClipboard: async () => {
    console.log("\n🧪 Test 3: Copy to Clipboard");
    console.log("=".repeat(50));

    const store = window.store;
    if (!store) {
      console.error("❌ Store not available");
      return;
    }

    const state = store.getState().workflow;

    const exportData = {
      nodes: state.nodes,
      connections: state.connections,
      canvasOffset: state.canvasOffset,
      zoom: state.zoom,
      exportedAt: new Date().toISOString(),
      version: "1.0",
    };

    try {
      await navigator.clipboard.writeText(JSON.stringify(exportData, null, 2));
      console.log("✅ Workflow copied to clipboard");
      console.log("📋 Try pasting in a text editor to verify");
    } catch (error) {
      console.error("❌ Clipboard copy failed:", error);
    }
  },

  /**
   * Test 4: Import Validation
   * Test various import scenarios
   */
  testImportValidation: () => {
    console.log("\n🧪 Test 4: Import Validation");
    console.log("=".repeat(50));

    const validateWorkflowData = (data) => {
      if (!data || typeof data !== "object") {
        throw new Error("Invalid data: must be an object");
      }

      if (!data.nodes || typeof data.nodes !== "object") {
        throw new Error("Invalid data: missing or invalid 'nodes'");
      }

      if (!Array.isArray(data.connections)) {
        throw new Error("Invalid data: 'connections' must be an array");
      }

      const nodeIds = Object.keys(data.nodes);
      if (nodeIds.length === 0) {
        throw new Error("Invalid data: no nodes found");
      }

      for (const nodeId of nodeIds) {
        const node = data.nodes[nodeId];
        if (!node.id || !node.type || !node.label || !node.position) {
          throw new Error(`Invalid node structure: ${nodeId}`);
        }
      }

      for (const conn of data.connections) {
        if (!conn.id || !conn.fromNodeId || !conn.toNodeId) {
          throw new Error("Invalid connection structure");
        }
        if (!data.nodes[conn.fromNodeId] || !data.nodes[conn.toNodeId]) {
          throw new Error(
            `Connection references non-existent node: ${conn.id}`,
          );
        }
      }

      return true;
    };

    // Test Case 1: Valid data
    console.log("\n1. Testing valid workflow data...");
    const validData = {
      nodes: {
        "start-node": {
          id: "start-node",
          type: "action",
          label: "Start",
          position: { x: 400, y: 50 },
          connections: [],
        },
      },
      connections: [],
      canvasOffset: { x: 0, y: 0 },
      zoom: 1,
    };

    try {
      validateWorkflowData(validData);
      console.log("✅ Valid data passed validation");
    } catch (error) {
      console.error("❌ Valid data failed:", error.message);
    }

    // Test Case 2: Missing nodes
    console.log("\n2. Testing missing nodes...");
    const missingNodes = {
      connections: [],
    };

    try {
      validateWorkflowData(missingNodes);
      console.log("❌ Should have failed - missing nodes");
    } catch (error) {
      console.log("✅ Correctly rejected:", error.message);
    }

    // Test Case 3: Invalid connection reference
    console.log("\n3. Testing invalid connection reference...");
    const invalidConnection = {
      nodes: {
        "node-1": {
          id: "node-1",
          type: "action",
          label: "Test",
          position: { x: 0, y: 0 },
          connections: [],
        },
      },
      connections: [
        {
          id: "conn-1",
          fromNodeId: "node-1",
          toNodeId: "non-existent",
        },
      ],
    };

    try {
      validateWorkflowData(invalidConnection);
      console.log("❌ Should have failed - invalid connection");
    } catch (error) {
      console.log("✅ Correctly rejected:", error.message);
    }

    console.log("\n✅ Import validation tests completed");
  },

  /**
   * Test 5: Import Replace Mode
   * Test replacing current workflow with imported data
   */
  testImportReplace: () => {
    console.log("\n🧪 Test 5: Import Replace Mode");
    console.log("=".repeat(50));

    const store = window.store;
    if (!store) {
      console.error("❌ Store not available");
      return;
    }

    // Get current state
    const beforeState = store.getState().workflow;
    console.log("Before import:");
    console.log("- Nodes:", Object.keys(beforeState.nodes).length);
    console.log("- Connections:", beforeState.connections.length);

    // Create test import data
    const importData = {
      nodes: {
        "imported-1": {
          id: "imported-1",
          type: "action",
          label: "Imported Start",
          position: { x: 100, y: 100 },
          connections: ["imported-2"],
        },
        "imported-2": {
          id: "imported-2",
          type: "end",
          label: "Imported End",
          position: { x: 100, y: 200 },
          connections: [],
        },
      },
      connections: [
        {
          id: "imported-conn-1",
          fromNodeId: "imported-1",
          toNodeId: "imported-2",
        },
      ],
      canvasOffset: { x: 50, y: 50 },
      zoom: 1.5,
    };

    console.log("\nImporting workflow (replace mode)...");
    store.dispatch({
      type: "workflow/importWorkflow",
      payload: {
        ...importData,
        merge: false,
      },
    });

    const afterState = store.getState().workflow;
    console.log("\nAfter import:");
    console.log("- Nodes:", Object.keys(afterState.nodes).length);
    console.log("- Connections:", afterState.connections.length);
    console.log("- Canvas offset:", afterState.canvasOffset);
    console.log("- Zoom:", afterState.zoom);

    console.log("\n✅ Import replace test completed");
    console.log("💡 Verify canvas shows imported nodes only");
  },

  /**
   * Test 6: Import Merge Mode
   * Test merging imported data with current workflow
   */
  testImportMerge: () => {
    console.log("\n🧪 Test 6: Import Merge Mode");
    console.log("=".repeat(50));

    const store = window.store;
    if (!store) {
      console.error("❌ Store not available");
      return;
    }

    // Get current state
    const beforeState = store.getState().workflow;
    console.log("Before merge:");
    console.log("- Nodes:", Object.keys(beforeState.nodes).length);
    console.log("- Connections:", beforeState.connections.length);

    // Create test import data
    const importData = {
      nodes: {
        "merged-1": {
          id: "merged-1",
          type: "action",
          label: "Merged Node 1",
          position: { x: 600, y: 100 },
          connections: [],
        },
        "merged-2": {
          id: "merged-2",
          type: "action",
          label: "Merged Node 2",
          position: { x: 600, y: 200 },
          connections: [],
        },
      },
      connections: [],
    };

    console.log("\nMerging workflow...");
    store.dispatch({
      type: "workflow/importWorkflow",
      payload: {
        ...importData,
        merge: true,
      },
    });

    const afterState = store.getState().workflow;
    console.log("\nAfter merge:");
    console.log("- Nodes:", Object.keys(afterState.nodes).length);
    console.log("- Connections:", afterState.connections.length);

    console.log("\n✅ Import merge test completed");
    console.log("💡 Verify canvas shows both old and new nodes");
  },

  /**
   * Test 7: Reset Workflow
   * Test clearing workflow to initial state
   */
  testResetWorkflow: () => {
    console.log("\n🧪 Test 7: Reset Workflow");
    console.log("=".repeat(50));

    const store = window.store;
    if (!store) {
      console.error("❌ Store not available");
      return;
    }

    const beforeState = store.getState().workflow;
    console.log("Before reset:");
    console.log("- Nodes:", Object.keys(beforeState.nodes).length);
    console.log("- Connections:", beforeState.connections.length);
    console.log("- History past:", beforeState.history.past.length);

    console.log("\nResetting workflow...");
    store.dispatch({ type: "workflow/resetWorkflow" });

    const afterState = store.getState().workflow;
    console.log("\nAfter reset:");
    console.log("- Nodes:", Object.keys(afterState.nodes).length);
    console.log("- Connections:", afterState.connections.length);
    console.log("- History past:", afterState.history.past.length);
    console.log("- Canvas offset:", afterState.canvasOffset);
    console.log("- Zoom:", afterState.zoom);

    console.log("\n✅ Reset workflow test completed");
    console.log("💡 Verify only start node remains");
  },

  /**
   * Test 8: Full Round-Trip (Export → Import)
   * Test exporting and re-importing workflow
   */
  testRoundTrip: () => {
    console.log("\n🧪 Test 8: Full Round-Trip");
    console.log("=".repeat(50));

    const store = window.store;
    if (!store) {
      console.error("❌ Store not available");
      return;
    }

    // 1. Create test workflow
    console.log("1. Creating test workflow...");
    if (window.workflowTest && window.workflowTest.createTestWorkflow) {
      window.workflowTest.createTestWorkflow();
    }

    // 2. Export current state
    const beforeState = store.getState().workflow;
    const exportData = {
      nodes: beforeState.nodes,
      connections: beforeState.connections,
      canvasOffset: beforeState.canvasOffset,
      zoom: beforeState.zoom,
    };

    console.log("2. Exported workflow:");
    console.log("- Nodes:", Object.keys(exportData.nodes).length);
    console.log("- Connections:", exportData.connections.length);

    // 3. Reset workflow
    console.log("\n3. Resetting workflow...");
    store.dispatch({ type: "workflow/resetWorkflow" });

    const afterReset = store.getState().workflow;
    console.log("- Nodes after reset:", Object.keys(afterReset.nodes).length);

    // 4. Re-import
    console.log("\n4. Re-importing workflow...");
    store.dispatch({
      type: "workflow/importWorkflow",
      payload: {
        ...exportData,
        merge: false,
      },
    });

    const afterImport = store.getState().workflow;
    console.log("\n5. After re-import:");
    console.log("- Nodes:", Object.keys(afterImport.nodes).length);
    console.log("- Connections:", afterImport.connections.length);

    // 6. Verify
    const nodesMatch =
      Object.keys(beforeState.nodes).length ===
      Object.keys(afterImport.nodes).length;
    const connectionsMatch =
      beforeState.connections.length === afterImport.connections.length;

    if (nodesMatch && connectionsMatch) {
      console.log("\n✅ Round-trip successful!");
      console.log("💡 Exported and imported states match");
    } else {
      console.error("\n❌ Round-trip failed - states don't match");
    }
  },

  /**
   * Run all workflow actions tests
   */
  runAllWorkflowActionsTests: () => {
    console.log("\n" + "=".repeat(60));
    console.log("🧪 WORKFLOW ACTIONS TEST SUITE");
    console.log("=".repeat(60));

    workflowActionsTests.testManualSave();
    workflowActionsTests.testExportToFile();
    workflowActionsTests.testImportValidation();

    console.log("\n" + "=".repeat(60));
    console.log("✅ All workflow actions tests completed!");
    console.log("=".repeat(60));
    console.log("\n💡 To test interactive features:");
    console.log("   - Click 'Save' button for manual save");
    console.log("   - Click 'Export' for file download/clipboard");
    console.log("   - Click 'Import' to upload JSON file");
    console.log("   - Click 'Clear' to reset workflow");
  },
};

// Expose to window for browser console access
if (typeof window !== "undefined") {
  window.workflowActionsTests = workflowActionsTests;
  console.log("💾 Workflow Actions tests loaded!");
  console.log("Run: window.workflowActionsTests.runAllWorkflowActionsTests()");
}

export default workflowActionsTests;
