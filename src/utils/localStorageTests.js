/**
 * Phase 13.2: LocalStorage Testing
 * Tests for persistence, quota, corruption, and debouncing
 */

import {
  saveToLocalStorage,
  loadFromLocalStorage,
  clearLocalStorage,
  STORAGE_KEY,
} from "../store/localStorageMiddleware";

export const localStorageTests = {
  /**
   * Test state persistence across page refreshes
   */
  testPersistenceAcrossRefresh: () => {
    console.log("\n🧪 Testing Persistence Across Refresh");
    console.log("=".repeat(60));

    const store = window.store;
    if (!store) {
      console.error("❌ Store not available");
      return;
    }

    // Create test workflow
    console.log("Creating test workflow...");
    store.dispatch({
      type: "workflow/addNode",
      payload: {
        type: "action",
        label: "Persistence Test Node",
        position: { x: 300, y: 300 },
        parentNodeId: "start-node",
      },
    });

    // Manually save
    const state = store.getState().workflow;
    const saveResult = saveToLocalStorage(state);

    if (saveResult.success) {
      console.log("✅ State saved to localStorage");
      console.log(`📦 Size: ${(saveResult.size / 1024).toFixed(2)}KB`);

      // Load it back
      const loadResult = loadFromLocalStorage();
      if (loadResult.success) {
        console.log("✅ State loaded from localStorage");
        console.log("💡 Now refresh the page to test persistence");
        console.log("   After refresh, check if nodes are restored");
      } else {
        console.error("❌ Failed to load:", loadResult.message);
      }
    } else {
      console.error("❌ Failed to save:", saveResult.message);
    }

    console.log("=".repeat(60));
  },

  /**
   * Test with large workflows (check quota)
   */
  testLargeWorkflow: () => {
    console.log("\n🧪 Testing Large Workflow & Quota");
    console.log("=".repeat(60));

    const store = window.store;
    if (!store) {
      console.error("❌ Store not available");
      return;
    }

    console.log("Creating large workflow (100 nodes)...");
    const startTime = performance.now();

    // Create 100 nodes
    for (let i = 0; i < 100; i++) {
      store.dispatch({
        type: "workflow/addNode",
        payload: {
          type: i % 3 === 0 ? "action" : i % 3 === 1 ? "branch" : "end",
          label: `Large Test Node ${i + 1}`,
          position: {
            x: 100 + (i % 10) * 150,
            y: 100 + Math.floor(i / 10) * 150,
          },
          parentNodeId: "start-node",
        },
      });
    }

    const creationTime = performance.now() - startTime;
    console.log(`⏱️ Created 100 nodes in ${creationTime.toFixed(2)}ms`);

    // Save and check size
    const state = store.getState().workflow;
    const saveResult = saveToLocalStorage(state);

    if (saveResult.success) {
      const sizeKB = (saveResult.size / 1024).toFixed(2);
      const sizeMB = (saveResult.size / 1024 / 1024).toFixed(2);

      console.log(`✅ Large workflow saved`);
      console.log(`📦 Size: ${sizeKB}KB (${sizeMB}MB)`);
      console.log(`📊 Nodes: ${Object.keys(state.nodes).length}`);
      console.log(`🔗 Connections: ${state.connections.length}`);

      // Check quota
      if (navigator.storage && navigator.storage.estimate) {
        navigator.storage.estimate().then((estimate) => {
          const usagePercent =
            ((estimate.usage || 0) / (estimate.quota || 1)) * 100;
          console.log(`💾 Storage usage: ${usagePercent.toFixed(2)}%`);
          console.log(
            `📈 Used: ${((estimate.usage || 0) / 1024 / 1024).toFixed(2)}MB`,
          );
          console.log(
            `📊 Quota: ${((estimate.quota || 0) / 1024 / 1024).toFixed(2)}MB`,
          );

          if (usagePercent > 80) {
            console.warn("⚠️ Storage quota > 80%!");
          } else {
            console.log("✅ Storage quota OK");
          }
        });
      }
    } else {
      console.error("❌ Failed to save:", saveResult.message);
      if (saveResult.error === "quota_exceeded") {
        console.error("⚠️ LocalStorage quota exceeded!");
        console.log(
          "💡 Try clearing other site data or reducing workflow size",
        );
      }
    }

    console.log("=".repeat(60));
  },

  /**
   * Test with corrupted localStorage data
   */
  testCorruptedData: () => {
    console.log("\n🧪 Testing Corrupted Data Handling");
    console.log("=".repeat(60));

    // Test 1: Invalid JSON
    console.log("Test 1: Invalid JSON syntax");
    localStorage.setItem(STORAGE_KEY, "{invalid json}");
    let result = loadFromLocalStorage();

    if (!result.success && result.error === "parse_error") {
      console.log("✅ Correctly handled invalid JSON");
    } else {
      console.error("❌ Did not detect invalid JSON");
    }

    // Test 2: Valid JSON but invalid structure
    console.log("\nTest 2: Valid JSON, invalid structure");
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ wrong: "structure" }));
    result = loadFromLocalStorage();

    if (!result.success && result.error === "invalid_nodes") {
      console.log("✅ Correctly handled invalid structure");
    } else {
      console.error("❌ Did not detect invalid structure");
    }

    // Test 3: Missing connections array
    console.log("\nTest 3: Missing connections array");
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        nodes: { "start-node": { id: "start-node" } },
      }),
    );
    result = loadFromLocalStorage();

    if (!result.success && result.error === "invalid_connections") {
      console.log("✅ Correctly handled missing connections");
    } else {
      console.error("❌ Did not detect missing connections");
    }

    // Test 4: Circular reference (shouldn't save)
    console.log("\nTest 4: Circular reference detection");
    const circularObj = { nodes: {}, connections: [] };
    circularObj.self = circularObj;

    const saveResult = saveToLocalStorage(circularObj);
    if (!saveResult.success) {
      console.log("✅ Prevented saving circular reference");
    } else {
      console.error("❌ Did not detect circular reference");
    }

    // Clean up
    clearLocalStorage();
    console.log("\n✅ Cleaned up test data");

    console.log("=".repeat(60));
  },

  /**
   * Test auto-save debouncing
   */
  testAutoSaveDebouncing: async () => {
    console.log("\n🧪 Testing Auto-Save Debouncing");
    console.log("=".repeat(60));

    const store = window.store;
    if (!store) {
      console.error("❌ Store not available");
      return;
    }

    console.log("Making rapid state changes...");
    console.log("⏱️ Debounce delay: 500ms");

    // Clear localStorage first
    clearLocalStorage();

    // Track save operations
    let saveCount = 0;
    const originalSave = saveToLocalStorage;
    window.testSaveCount = 0;

    // Make 10 rapid changes
    for (let i = 0; i < 10; i++) {
      store.dispatch({
        type: "workflow/updateZoom",
        payload: 1 + i * 0.1,
      });
    }

    console.log("Made 10 rapid changes");
    console.log("⏳ Waiting for debounce...");

    // Wait for debounce (500ms) + buffer
    await new Promise((resolve) => setTimeout(resolve, 700));

    // Check if saved
    const loadResult = loadFromLocalStorage();
    if (loadResult.success) {
      console.log("✅ Auto-save completed after debounce");
      console.log("💡 Expected: 1 save operation (debounced)");
      console.log("💡 Actual: Check network/storage activity");
    } else {
      console.log("⚠️ No save detected (may still be debouncing)");
    }

    console.log("=".repeat(60));
  },

  /**
   * Test localStorage size calculation
   */
  testStorageSize: () => {
    console.log("\n🧪 Testing Storage Size Calculation");
    console.log("=".repeat(60));

    const store = window.store;
    if (!store) {
      console.error("❌ Store not available");
      return;
    }

    const state = store.getState().workflow;

    // Calculate size
    const json = JSON.stringify({
      nodes: state.nodes,
      connections: state.connections,
      canvasOffset: state.canvasOffset,
      zoom: state.zoom,
    });

    const size = new Blob([json]).size;
    const nodeCount = Object.keys(state.nodes).length;
    const avgSizePerNode = size / nodeCount;

    console.log(`📊 Current Workflow:`);
    console.log(`   Nodes: ${nodeCount}`);
    console.log(`   Connections: ${state.connections.length}`);
    console.log(`   Total Size: ${(size / 1024).toFixed(2)}KB`);
    console.log(`   Avg per Node: ${avgSizePerNode.toFixed(0)} bytes`);

    // Estimate capacity
    const quota5MB = 5 * 1024 * 1024;
    const estimatedMaxNodes = Math.floor(quota5MB / avgSizePerNode);

    console.log(`\n📈 Capacity Estimates (5MB quota):`);
    console.log(`   Max nodes: ~${estimatedMaxNodes}`);
    console.log(`   Current usage: ${((size / quota5MB) * 100).toFixed(2)}%`);

    console.log("=".repeat(60));
  },

  /**
   * Test localStorage clear operation
   */
  testClearStorage: () => {
    console.log("\n🧪 Testing Clear Storage");
    console.log("=".repeat(60));

    const store = window.store;
    if (!store) {
      console.error("❌ Store not available");
      return;
    }

    // Save current state
    const state = store.getState().workflow;
    saveToLocalStorage(state);

    // Verify it exists
    let loadResult = loadFromLocalStorage();
    if (loadResult.success) {
      console.log("✅ State exists in localStorage");
    }

    // Clear it
    const clearResult = clearLocalStorage();
    if (clearResult.success) {
      console.log("✅ localStorage cleared");
    } else {
      console.error("❌ Failed to clear:", clearResult.message);
    }

    // Verify it's gone
    loadResult = loadFromLocalStorage();
    if (!loadResult.success && loadResult.error === "not_found") {
      console.log("✅ Confirmed: no saved state found");
    } else {
      console.error("❌ State still exists after clear");
    }

    console.log("=".repeat(60));
  },

  /**
   * Run all localStorage tests
   */
  runAllLocalStorageTests: async () => {
    console.log("\n" + "=".repeat(60));
    console.log("🧪 LOCALSTORAGE TEST SUITE");
    console.log("=".repeat(60));

    localStorageTests.testStorageSize();
    localStorageTests.testCorruptedData();
    await localStorageTests.testAutoSaveDebouncing();
    localStorageTests.testClearStorage();
    localStorageTests.testPersistenceAcrossRefresh();

    console.log("\n💡 To test large workflows:");
    console.log("   window.localStorageTests.testLargeWorkflow()");

    console.log("\n" + "=".repeat(60));
    console.log("✅ All localStorage tests completed!");
    console.log("=".repeat(60));
  },
};

if (typeof window !== "undefined") {
  window.localStorageTests = localStorageTests;
  console.log("💾 LocalStorage tests loaded!");
  console.log("Run: window.localStorageTests.runAllLocalStorageTests()");
}

export default localStorageTests;
