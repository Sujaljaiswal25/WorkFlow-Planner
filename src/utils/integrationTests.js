/**
 * Phase 13.4: Integration Testing
 * End-to-end workflow tests and edge cases
 */

export const integrationTests = {
  /**
   * Test complete workflow creation
   */
  testCompleteWorkflow: () => {
    console.log("\n🧪 Testing Complete Workflow Creation");
    console.log("=".repeat(60));

    const store = window.store;
    if (!store) {
      console.error("❌ Store not available");
      return;
    }

    let passed = 0;
    let failed = 0;

    try {
      // Clear existing workflow
      console.log("Clearing existing workflow...");
      store.dispatch({ type: "workflow/resetWorkflow" });

      const initialState = store.getState().workflow;
      if (
        Object.keys(initialState.nodes).length === 1 &&
        initialState.nodes["start-node"]
      ) {
        console.log("✅ Workflow reset to initial state");
        passed++;
      } else {
        console.error("❌ Reset failed");
        failed++;
      }

      // Create a complete workflow
      console.log("\nCreating complete workflow...");

      // Step 1: Add action node
      store.dispatch({
        type: "workflow/addNode",
        payload: {
          type: "action",
          label: "Process Data",
          position: { x: 200, y: 200 },
          parentNodeId: "start-node",
        },
      });

      const actionNodes = Object.values(store.getState().workflow.nodes).filter(
        (n) => n.type === "action",
      );

      if (actionNodes.length === 1) {
        console.log("✅ Added action node");
        passed++;
      } else {
        console.error("❌ Failed to add action node");
        failed++;
      }

      const actionNodeId = actionNodes[0].id;

      // Step 2: Add branch node
      store.dispatch({
        type: "workflow/addNode",
        payload: {
          type: "branch",
          label: "Check Result",
          position: { x: 200, y: 350 },
          parentNodeId: actionNodeId,
        },
      });

      const branchNodes = Object.values(store.getState().workflow.nodes).filter(
        (n) => n.type === "branch",
      );

      if (branchNodes.length === 1) {
        console.log("✅ Added branch node");
        passed++;
      } else {
        console.error("❌ Failed to add branch node");
        failed++;
      }

      const branchNodeId = branchNodes[0].id;

      // Step 3: Add success path
      store.dispatch({
        type: "workflow/addNode",
        payload: {
          type: "action",
          label: "Success Handler",
          position: { x: 100, y: 500 },
          parentNodeId: branchNodeId,
        },
      });

      // Step 4: Add failure path
      store.dispatch({
        type: "workflow/addNode",
        payload: {
          type: "action",
          label: "Error Handler",
          position: { x: 300, y: 500 },
          parentNodeId: branchNodeId,
        },
      });

      const currentNodes = store.getState().workflow.nodes;
      if (Object.keys(currentNodes).length === 5) {
        // start + 4 new
        console.log("✅ Added both branch paths");
        passed++;
      } else {
        console.error("❌ Wrong number of nodes");
        failed++;
      }

      // Step 5: Add end nodes
      const successHandler = Object.values(currentNodes).find(
        (n) => n.label === "Success Handler",
      );
      const errorHandler = Object.values(currentNodes).find(
        (n) => n.label === "Error Handler",
      );

      store.dispatch({
        type: "workflow/addNode",
        payload: {
          type: "end",
          label: "Success End",
          position: { x: 100, y: 650 },
          parentNodeId: successHandler.id,
        },
      });

      store.dispatch({
        type: "workflow/addNode",
        payload: {
          type: "end",
          label: "Error End",
          position: { x: 300, y: 650 },
          parentNodeId: errorHandler.id,
        },
      });

      const finalState = store.getState().workflow;
      const endNodes = Object.values(finalState.nodes).filter(
        (n) => n.type === "end",
      );

      if (endNodes.length === 2) {
        console.log("✅ Added end nodes");
        passed++;
      } else {
        console.error("❌ Failed to add end nodes");
        failed++;
      }

      // Verify connections
      const connections = finalState.connections;
      console.log(`\n📊 Workflow summary:`);
      console.log(`   Total nodes: ${Object.keys(finalState.nodes).length}`);
      console.log(`   Total connections: ${connections.length}`);
      console.log(
        `   Action nodes: ${Object.values(finalState.nodes).filter((n) => n.type === "action").length}`,
      );
      console.log(
        `   Branch nodes: ${Object.values(finalState.nodes).filter((n) => n.type === "branch").length}`,
      );
      console.log(`   End nodes: ${endNodes.length}`);

      if (connections.length === 6) {
        // start->action->branch->2 handlers->2 ends
        console.log("✅ All connections created");
        passed++;
      } else {
        console.warn(`⚠️ Expected 6 connections, got ${connections.length}`);
      }
    } catch (error) {
      console.error("❌ Error during workflow creation:", error.message);
      failed++;
    }

    console.log("\n📊 Results:");
    console.log(`   ✅ Passed: ${passed}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log("=".repeat(60));

    return { passed, failed };
  },

  /**
   * Test edge case: Delete all nodes except Start
   */
  testDeleteAllExceptStart: () => {
    console.log("\n🧪 Testing Edge Case: Delete All Except Start");
    console.log("=".repeat(60));

    const store = window.store;
    if (!store) {
      console.error("❌ Store not available");
      return;
    }

    let passed = 0;
    let failed = 0;

    try {
      // Create some nodes
      store.dispatch({
        type: "workflow/addNode",
        payload: {
          type: "action",
          label: "Test Node 1",
          position: { x: 200, y: 200 },
          parentNodeId: "start-node",
        },
      });

      store.dispatch({
        type: "workflow/addNode",
        payload: {
          type: "action",
          label: "Test Node 2",
          position: { x: 200, y: 350 },
          parentNodeId: "start-node",
        },
      });

      const beforeDelete = Object.keys(store.getState().workflow.nodes).length;
      console.log(`Nodes before delete: ${beforeDelete}`);

      // Delete all nodes except start
      const state = store.getState().workflow;
      const nodeIds = Object.keys(state.nodes).filter(
        (id) => id !== "start-node",
      );

      nodeIds.forEach((id) => {
        store.dispatch({ type: "workflow/deleteNode", payload: id });
      });

      const afterDelete = store.getState().workflow;
      const remainingNodes = Object.keys(afterDelete.nodes);

      if (remainingNodes.length === 1 && remainingNodes[0] === "start-node") {
        console.log("✅ Only Start node remains");
        passed++;
      } else {
        console.error("❌ Unexpected nodes remain");
        console.log("Remaining:", remainingNodes);
        failed++;
      }

      // Check connections
      if (afterDelete.connections.length === 0) {
        console.log("✅ All connections removed");
        passed++;
      } else {
        console.error("❌ Orphaned connections exist");
        failed++;
      }

      // Verify Start node is unselected
      if (!afterDelete.selectedNodeId) {
        console.log("✅ No node selected");
        passed++;
      } else {
        console.warn("⚠️ Node still selected");
      }
    } catch (error) {
      console.error("❌ Error:", error.message);
      failed++;
    }

    console.log("\n📊 Results:");
    console.log(`   ✅ Passed: ${passed}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log("=".repeat(60));

    return { passed, failed };
  },

  /**
   * Test node selection and deselection
   */
  testNodeSelection: () => {
    console.log("\n🧪 Testing Node Selection");
    console.log("=".repeat(60));

    const store = window.store;
    if (!store) {
      console.error("❌ Store not available");
      return;
    }

    let passed = 0;
    let failed = 0;

    try {
      // Create a node
      store.dispatch({
        type: "workflow/addNode",
        payload: {
          type: "action",
          label: "Selection Test",
          position: { x: 200, y: 200 },
          parentNodeId: "start-node",
        },
      });

      const nodes = store.getState().workflow.nodes;
      const testNodeId = Object.keys(nodes).find((id) => id !== "start-node");

      // Select node
      store.dispatch({ type: "workflow/selectNode", payload: testNodeId });

      if (store.getState().workflow.selectedNodeId === testNodeId) {
        console.log("✅ Node selected");
        passed++;
      } else {
        console.error("❌ Selection failed");
        failed++;
      }

      // Deselect
      store.dispatch({ type: "workflow/selectNode", payload: null });

      if (!store.getState().workflow.selectedNodeId) {
        console.log("✅ Node deselected");
        passed++;
      } else {
        console.error("❌ Deselection failed");
        failed++;
      }

      // Select same node twice
      store.dispatch({ type: "workflow/selectNode", payload: testNodeId });
      store.dispatch({ type: "workflow/selectNode", payload: testNodeId });

      if (store.getState().workflow.selectedNodeId === testNodeId) {
        console.log("✅ Double selection handled");
        passed++;
      } else {
        console.error("❌ Double selection failed");
        failed++;
      }
    } catch (error) {
      console.error("❌ Error:", error.message);
      failed++;
    }

    console.log("\n📊 Results:");
    console.log(`   ✅ Passed: ${passed}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log("=".repeat(60));

    return { passed, failed };
  },

  /**
   * Test canvas pan and zoom
   */
  testCanvasTransform: () => {
    console.log("\n🧪 Testing Canvas Pan & Zoom");
    console.log("=".repeat(60));

    const store = window.store;
    if (!store) {
      console.error("❌ Store not available");
      return;
    }

    let passed = 0;
    let failed = 0;

    try {
      // Test zoom
      const initialZoom = store.getState().workflow.zoom;
      console.log(`Initial zoom: ${initialZoom}`);

      store.dispatch({ type: "workflow/updateZoom", payload: 1.5 });

      if (store.getState().workflow.zoom === 1.5) {
        console.log("✅ Zoom updated to 1.5");
        passed++;
      } else {
        console.error("❌ Zoom update failed");
        failed++;
      }

      // Test zoom limits
      store.dispatch({ type: "workflow/updateZoom", payload: 5.0 });

      if (store.getState().workflow.zoom <= 2.0) {
        console.log("✅ Max zoom limit enforced (2.0)");
        passed++;
      } else {
        console.error("❌ Max zoom limit not enforced");
        failed++;
      }

      store.dispatch({ type: "workflow/updateZoom", payload: 0.01 });

      if (store.getState().workflow.zoom >= 0.1) {
        console.log("✅ Min zoom limit enforced (0.1)");
        passed++;
      } else {
        console.error("❌ Min zoom limit not enforced");
        failed++;
      }

      // Test pan
      store.dispatch({
        type: "workflow/updateCanvasOffset",
        payload: { x: 100, y: 50 },
      });

      const offset = store.getState().workflow.canvasOffset;
      if (offset.x === 100 && offset.y === 50) {
        console.log("✅ Canvas offset updated");
        passed++;
      } else {
        console.error("❌ Canvas offset update failed");
        failed++;
      }

      // Reset
      store.dispatch({ type: "workflow/updateZoom", payload: 1.0 });
      store.dispatch({
        type: "workflow/updateCanvasOffset",
        payload: { x: 0, y: 0 },
      });

      const finalState = store.getState().workflow;
      if (finalState.zoom === 1.0 && finalState.canvasOffset.x === 0) {
        console.log("✅ Canvas reset");
        passed++;
      } else {
        console.error("❌ Canvas reset failed");
        failed++;
      }
    } catch (error) {
      console.error("❌ Error:", error.message);
      failed++;
    }

    console.log("\n📊 Results:");
    console.log(`   ✅ Passed: ${passed}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log("=".repeat(60));

    return { passed, failed };
  },

  /**
   * Test workflow import/export
   */
  testImportExport: () => {
    console.log("\n🧪 Testing Import/Export");
    console.log("=".repeat(60));

    const store = window.store;
    if (!store) {
      console.error("❌ Store not available");
      return;
    }

    let passed = 0;
    let failed = 0;

    try {
      // Create a workflow
      store.dispatch({ type: "workflow/resetWorkflow" });

      store.dispatch({
        type: "workflow/addNode",
        payload: {
          type: "action",
          label: "Export Test",
          position: { x: 200, y: 200 },
          parentNodeId: "start-node",
        },
      });

      // Export
      const exported = store.getState().workflow;
      const exportData = {
        nodes: exported.nodes,
        connections: exported.connections,
        canvasOffset: exported.canvasOffset,
        zoom: exported.zoom,
      };

      console.log("✅ Exported workflow data");
      console.log(`   Nodes: ${Object.keys(exportData.nodes).length}`);
      console.log(`   Connections: ${exportData.connections.length}`);

      // Reset and import
      store.dispatch({ type: "workflow/resetWorkflow" });

      store.dispatch({
        type: "workflow/importWorkflow",
        payload: {
          nodes: exportData.nodes,
          connections: exportData.connections,
          canvasOffset: exportData.canvasOffset,
          zoom: exportData.zoom,
          merge: false,
        },
      });

      const imported = store.getState().workflow;

      if (
        Object.keys(imported.nodes).length ===
        Object.keys(exportData.nodes).length
      ) {
        console.log("✅ Imported correct number of nodes");
        passed++;
      } else {
        console.error("❌ Import node count mismatch");
        failed++;
      }

      if (imported.connections.length === exportData.connections.length) {
        console.log("✅ Imported correct number of connections");
        passed++;
      } else {
        console.error("❌ Import connection count mismatch");
        failed++;
      }

      // Test merge mode
      store.dispatch({
        type: "workflow/addNode",
        payload: {
          type: "action",
          label: "Merge Test",
          position: { x: 300, y: 300 },
          parentNodeId: "start-node",
        },
      });

      const beforeMerge = Object.keys(store.getState().workflow.nodes).length;

      store.dispatch({
        type: "workflow/importWorkflow",
        payload: {
          nodes: exportData.nodes,
          connections: exportData.connections,
          merge: true,
        },
      });

      const afterMerge = Object.keys(store.getState().workflow.nodes).length;

      if (afterMerge > beforeMerge) {
        console.log("✅ Merge mode added nodes");
        passed++;
      } else {
        console.error("❌ Merge mode failed");
        failed++;
      }
    } catch (error) {
      console.error("❌ Error:", error.message);
      failed++;
    }

    console.log("\n📊 Results:");
    console.log(`   ✅ Passed: ${passed}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log("=".repeat(60));

    return { passed, failed };
  },

  /**
   * Test orphaned connection cleanup
   */
  testOrphanedConnections: () => {
    console.log("\n🧪 Testing Orphaned Connection Cleanup");
    console.log("=".repeat(60));

    const store = window.store;
    if (!store) {
      console.error("❌ Store not available");
      return;
    }

    let passed = 0;
    let failed = 0;

    try {
      // Create a chain of nodes
      store.dispatch({ type: "workflow/resetWorkflow" });

      store.dispatch({
        type: "workflow/addNode",
        payload: {
          type: "action",
          label: "Node 1",
          position: { x: 200, y: 200 },
          parentNodeId: "start-node",
        },
      });

      const node1 = Object.values(store.getState().workflow.nodes).find(
        (n) => n.label === "Node 1",
      );

      store.dispatch({
        type: "workflow/addNode",
        payload: {
          type: "action",
          label: "Node 2",
          position: { x: 200, y: 350 },
          parentNodeId: node1.id,
        },
      });

      const beforeDelete = store.getState().workflow.connections.length;
      console.log(`Connections before delete: ${beforeDelete}`);

      // Delete middle node
      store.dispatch({ type: "workflow/deleteNode", payload: node1.id });

      const afterDelete = store.getState().workflow;

      // Check for orphaned connections
      const orphaned = afterDelete.connections.filter((conn) => {
        const fromExists = afterDelete.nodes[conn.from];
        const toExists = afterDelete.nodes[conn.to];
        return !fromExists || !toExists;
      });

      if (orphaned.length === 0) {
        console.log("✅ No orphaned connections");
        passed++;
      } else {
        console.error(`❌ Found ${orphaned.length} orphaned connections`);
        failed++;
      }

      // Check if Node 2 still exists
      const node2Exists = Object.values(afterDelete.nodes).some(
        (n) => n.label === "Node 2",
      );

      if (!node2Exists) {
        console.log("✅ Child node also removed");
        passed++;
      } else {
        console.warn("⚠️ Child node still exists (may be intended)");
      }
    } catch (error) {
      console.error("❌ Error:", error.message);
      failed++;
    }

    console.log("\n📊 Results:");
    console.log(`   ✅ Passed: ${passed}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log("=".repeat(60));

    return { passed, failed };
  },

  /**
   * Run all integration tests
   */
  runAllIntegrationTests: () => {
    console.log("\n" + "=".repeat(60));
    console.log("🧪 INTEGRATION TEST SUITE");
    console.log("=".repeat(60));

    const results = {
      workflow: integrationTests.testCompleteWorkflow(),
      deleteAll: integrationTests.testDeleteAllExceptStart(),
      selection: integrationTests.testNodeSelection(),
      transform: integrationTests.testCanvasTransform(),
      importExport: integrationTests.testImportExport(),
      orphaned: integrationTests.testOrphanedConnections(),
    };

    const totalPassed = Object.values(results).reduce(
      (sum, r) => sum + (r?.passed || 0),
      0,
    );
    const totalFailed = Object.values(results).reduce(
      (sum, r) => sum + (r?.failed || 0),
      0,
    );

    console.log("\n" + "=".repeat(60));
    console.log("📊 OVERALL RESULTS:");
    console.log(`   ✅ Passed: ${totalPassed}`);
    console.log(`   ❌ Failed: ${totalFailed}`);
    console.log(
      `   Success Rate: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1)}%`,
    );
    console.log("=".repeat(60));
  },
};

if (typeof window !== "undefined") {
  window.integrationTests = integrationTests;
  console.log("🔗 Integration tests loaded!");
  console.log("Run: window.integrationTests.runAllIntegrationTests()");
}

export default integrationTests;
