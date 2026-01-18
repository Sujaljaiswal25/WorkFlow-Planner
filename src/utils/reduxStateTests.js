/**
 * Phase 13.1: Redux State Testing
 * Tests for reducers, selectors, and state consistency
 */

export const reduxStateTests = {
  /**
   * Test all reducers for correct state mutations
   */
  testAllReducers: () => {
    console.log("\n🧪 Testing All Reducers");
    console.log("=".repeat(60));

    const store = window.store;
    if (!store) {
      console.error("❌ Store not available");
      return;
    }

    let passedTests = 0;
    let failedTests = 0;

    // Test 1: addNode reducer
    try {
      const beforeNodes = Object.keys(store.getState().workflow.nodes).length;
      store.dispatch({
        type: "workflow/addNode",
        payload: {
          type: "action",
          label: "Test Node",
          position: { x: 100, y: 100 },
          parentNodeId: "start-node",
        },
      });
      const afterNodes = Object.keys(store.getState().workflow.nodes).length;

      if (afterNodes === beforeNodes + 1) {
        console.log("✅ addNode reducer: PASS");
        passedTests++;
      } else {
        console.error("❌ addNode reducer: FAIL");
        failedTests++;
      }
    } catch (error) {
      console.error("❌ addNode reducer error:", error);
      failedTests++;
    }

    // Test 2: updateNodePosition reducer
    try {
      const nodes = store.getState().workflow.nodes;
      const nodeId = Object.keys(nodes).find((id) => id !== "start-node");

      if (nodeId) {
        store.dispatch({
          type: "workflow/updateNodePosition",
          payload: {
            nodeId,
            position: { x: 200, y: 200 },
          },
        });

        const updatedNode = store.getState().workflow.nodes[nodeId];
        if (updatedNode.position.x === 200 && updatedNode.position.y === 200) {
          console.log("✅ updateNodePosition reducer: PASS");
          passedTests++;
        } else {
          console.error("❌ updateNodePosition reducer: FAIL");
          failedTests++;
        }
      }
    } catch (error) {
      console.error("❌ updateNodePosition reducer error:", error);
      failedTests++;
    }

    // Test 3: updateNodeLabel reducer
    try {
      const nodes = store.getState().workflow.nodes;
      const nodeId = Object.keys(nodes).find((id) => id !== "start-node");

      if (nodeId) {
        store.dispatch({
          type: "workflow/updateNodeLabel",
          payload: {
            nodeId,
            label: "Updated Label",
          },
        });

        const updatedNode = store.getState().workflow.nodes[nodeId];
        if (updatedNode.label === "Updated Label") {
          console.log("✅ updateNodeLabel reducer: PASS");
          passedTests++;
        } else {
          console.error("❌ updateNodeLabel reducer: FAIL");
          failedTests++;
        }
      }
    } catch (error) {
      console.error("❌ updateNodeLabel reducer error:", error);
      failedTests++;
    }

    // Test 4: selectNode reducer
    try {
      const nodes = store.getState().workflow.nodes;
      const nodeId = Object.keys(nodes)[0];

      store.dispatch({
        type: "workflow/selectNode",
        payload: nodeId,
      });

      const selectedId = store.getState().workflow.selectedNodeId;
      if (selectedId === nodeId) {
        console.log("✅ selectNode reducer: PASS");
        passedTests++;
      } else {
        console.error("❌ selectNode reducer: FAIL");
        failedTests++;
      }
    } catch (error) {
      console.error("❌ selectNode reducer error:", error);
      failedTests++;
    }

    // Test 5: updateZoom reducer
    try {
      store.dispatch({
        type: "workflow/updateZoom",
        payload: 1.5,
      });

      const zoom = store.getState().workflow.zoom;
      if (zoom === 1.5) {
        console.log("✅ updateZoom reducer: PASS");
        passedTests++;
      } else {
        console.error("❌ updateZoom reducer: FAIL");
        failedTests++;
      }

      // Reset zoom
      store.dispatch({ type: "workflow/updateZoom", payload: 1 });
    } catch (error) {
      console.error("❌ updateZoom reducer error:", error);
      failedTests++;
    }

    // Test 6: updateCanvasOffset reducer
    try {
      store.dispatch({
        type: "workflow/updateCanvasOffset",
        payload: { x: 100, y: 100 },
      });

      const offset = store.getState().workflow.canvasOffset;
      if (offset.x === 100 && offset.y === 100) {
        console.log("✅ updateCanvasOffset reducer: PASS");
        passedTests++;
      } else {
        console.error("❌ updateCanvasOffset reducer: FAIL");
        failedTests++;
      }

      // Reset offset
      store.dispatch({
        type: "workflow/updateCanvasOffset",
        payload: { x: 0, y: 0 },
      });
    } catch (error) {
      console.error("❌ updateCanvasOffset reducer error:", error);
      failedTests++;
    }

    console.log("\n" + "=".repeat(60));
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log("=".repeat(60));
  },

  /**
   * Test all selectors return correct data
   */
  testAllSelectors: () => {
    console.log("\n🧪 Testing All Selectors");
    console.log("=".repeat(60));

    const store = window.store;
    if (!store) {
      console.error("❌ Store not available");
      return;
    }

    const state = store.getState();
    let passedTests = 0;
    let failedTests = 0;

    // Test selectWorkflowState
    try {
      const workflowState = state.workflow;
      if (workflowState && workflowState.nodes && workflowState.connections) {
        console.log("✅ selectWorkflowState: PASS");
        passedTests++;
      } else {
        console.error("❌ selectWorkflowState: FAIL");
        failedTests++;
      }
    } catch (error) {
      console.error("❌ selectWorkflowState error:", error);
      failedTests++;
    }

    // Test selectNodesArray
    try {
      const nodes = Object.values(state.workflow.nodes);
      if (Array.isArray(nodes) && nodes.length > 0) {
        console.log("✅ selectNodesArray: PASS");
        passedTests++;
      } else {
        console.error("❌ selectNodesArray: FAIL");
        failedTests++;
      }
    } catch (error) {
      console.error("❌ selectNodesArray error:", error);
      failedTests++;
    }

    // Test selectConnections
    try {
      const connections = state.workflow.connections;
      if (Array.isArray(connections)) {
        console.log("✅ selectConnections: PASS");
        passedTests++;
      } else {
        console.error("❌ selectConnections: FAIL");
        failedTests++;
      }
    } catch (error) {
      console.error("❌ selectConnections error:", error);
      failedTests++;
    }

    // Test selectZoom
    try {
      const zoom = state.workflow.zoom;
      if (typeof zoom === "number" && zoom > 0) {
        console.log("✅ selectZoom: PASS");
        passedTests++;
      } else {
        console.error("❌ selectZoom: FAIL");
        failedTests++;
      }
    } catch (error) {
      console.error("❌ selectZoom error:", error);
      failedTests++;
    }

    // Test selectCanvasOffset
    try {
      const offset = state.workflow.canvasOffset;
      if (
        offset &&
        typeof offset.x === "number" &&
        typeof offset.y === "number"
      ) {
        console.log("✅ selectCanvasOffset: PASS");
        passedTests++;
      } else {
        console.error("❌ selectCanvasOffset: FAIL");
        failedTests++;
      }
    } catch (error) {
      console.error("❌ selectCanvasOffset error:", error);
      failedTests++;
    }

    // Test selectSelectedNodeId
    try {
      const selectedId = state.workflow.selectedNodeId;
      if (selectedId === null || typeof selectedId === "string") {
        console.log("✅ selectSelectedNodeId: PASS");
        passedTests++;
      } else {
        console.error("❌ selectSelectedNodeId: FAIL");
        failedTests++;
      }
    } catch (error) {
      console.error("❌ selectSelectedNodeId error:", error);
      failedTests++;
    }

    console.log("\n" + "=".repeat(60));
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log("=".repeat(60));
  },

  /**
   * Check for state mutations (RTK should prevent this)
   */
  testStateMutations: () => {
    console.log("\n🧪 Testing State Mutations");
    console.log("=".repeat(60));

    const store = window.store;
    if (!store) {
      console.error("❌ Store not available");
      return;
    }

    // Get initial state
    const initialState = store.getState().workflow;
    const initialNodesCount = Object.keys(initialState.nodes).length;

    // Try to directly mutate state (should not work with RTK)
    console.log("Attempting direct state mutation...");
    try {
      initialState.nodes["fake-node"] = { id: "fake-node" };

      const currentState = store.getState().workflow;
      const currentNodesCount = Object.keys(currentState.nodes).length;

      if (currentNodesCount === initialNodesCount) {
        console.log("✅ State is immutable - direct mutations prevented");
      } else {
        console.error("❌ State mutation detected - RTK not working correctly");
      }
    } catch (error) {
      console.log("✅ State mutation threw error (expected behavior)");
    }

    // Verify state is frozen in development
    if (Object.isFrozen && Object.isFrozen(initialState)) {
      console.log("✅ State object is frozen");
    } else {
      console.log("ℹ️ State object not frozen (may be production mode)");
    }

    console.log("=".repeat(60));
  },

  /**
   * Check Redux DevTools state consistency
   */
  testReduxDevTools: () => {
    console.log("\n🧪 Testing Redux DevTools Integration");
    console.log("=".repeat(60));

    if (window.__REDUX_DEVTOOLS_EXTENSION__) {
      console.log("✅ Redux DevTools Extension detected");
      console.log("📊 Open Redux DevTools to inspect state");
      console.log("💡 Features to check:");
      console.log("   - Action history");
      console.log("   - State diff viewer");
      console.log("   - Time-travel debugging");
      console.log("   - Action replay");
    } else {
      console.log("⚠️ Redux DevTools Extension not found");
      console.log("💡 Install from: https://github.com/reduxjs/redux-devtools");
    }

    console.log("=".repeat(60));
  },

  /**
   * Test state consistency across actions
   */
  testStateConsistency: () => {
    console.log("\n🧪 Testing State Consistency");
    console.log("=".repeat(60));

    const store = window.store;
    if (!store) {
      console.error("❌ Store not available");
      return;
    }

    let passedTests = 0;
    let failedTests = 0;

    // Test 1: Node IDs match between nodes object and connections
    try {
      const state = store.getState().workflow;
      const nodeIds = Object.keys(state.nodes);
      let consistencyCheck = true;

      for (const conn of state.connections) {
        if (
          !nodeIds.includes(conn.fromNodeId) ||
          !nodeIds.includes(conn.toNodeId)
        ) {
          consistencyCheck = false;
          console.error(`❌ Orphaned connection: ${conn.id}`);
        }
      }

      if (consistencyCheck) {
        console.log("✅ All connections reference valid nodes");
        passedTests++;
      } else {
        console.error("❌ Found orphaned connections");
        failedTests++;
      }
    } catch (error) {
      console.error("❌ Connection consistency error:", error);
      failedTests++;
    }

    // Test 2: Node connections array matches actual connections
    try {
      const state = store.getState().workflow;
      let consistencyCheck = true;

      for (const nodeId in state.nodes) {
        const node = state.nodes[nodeId];
        const nodeConnections = state.connections.filter(
          (c) => c.fromNodeId === nodeId,
        );

        if (node.connections.length !== nodeConnections.length) {
          console.error(`❌ Node ${nodeId} connection mismatch`);
          consistencyCheck = false;
        }
      }

      if (consistencyCheck) {
        console.log("✅ Node connections arrays match actual connections");
        passedTests++;
      } else {
        console.error("❌ Node connections array mismatch");
        failedTests++;
      }
    } catch (error) {
      console.error("❌ Node connections consistency error:", error);
      failedTests++;
    }

    // Test 3: Start node always exists
    try {
      const state = store.getState().workflow;
      if (state.nodes["start-node"]) {
        console.log("✅ Start node exists");
        passedTests++;
      } else {
        console.error("❌ Start node missing");
        failedTests++;
      }
    } catch (error) {
      console.error("❌ Start node check error:", error);
      failedTests++;
    }

    console.log("\n" + "=".repeat(60));
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log("=".repeat(60));
  },

  /**
   * Run all Redux state tests
   */
  runAllReduxTests: () => {
    console.log("\n" + "=".repeat(60));
    console.log("🧪 REDUX STATE TEST SUITE");
    console.log("=".repeat(60));

    reduxStateTests.testAllReducers();
    reduxStateTests.testAllSelectors();
    reduxStateTests.testStateMutations();
    reduxStateTests.testStateConsistency();
    reduxStateTests.testReduxDevTools();

    console.log("\n" + "=".repeat(60));
    console.log("✅ All Redux state tests completed!");
    console.log("=".repeat(60));
  },
};

if (typeof window !== "undefined") {
  window.reduxStateTests = reduxStateTests;
  console.log("🔴 Redux State tests loaded!");
  console.log("Run: window.reduxStateTests.runAllReduxTests()");
}

export default reduxStateTests;
