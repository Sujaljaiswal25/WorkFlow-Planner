/**
 * Phase 13.5: Performance Testing
 * Tests for large workflows, rendering, and responsiveness
 */

export const performanceTests = {
  /**
   * Test with 50+ nodes
   */
  testLargeWorkflow: () => {
    console.log("\n🧪 Testing Large Workflow (50+ nodes)");
    console.log("=".repeat(60));

    const store = window.store;
    if (!store) {
      console.error("❌ Store not available");
      return;
    }

    console.log("Creating 50 nodes...");
    const startTime = performance.now();

    // Reset first
    store.dispatch({ type: "workflow/resetWorkflow" });

    // Create 50 nodes
    let previousNodeId = "start-node";
    for (let i = 1; i <= 50; i++) {
      const nodeType = i % 5 === 0 ? "branch" : i % 10 === 0 ? "end" : "action";

      store.dispatch({
        type: "workflow/addNode",
        payload: {
          type: nodeType,
          label: `Node ${i}`,
          position: {
            x: 100 + (i % 10) * 180,
            y: 100 + Math.floor(i / 10) * 180,
          },
          parentNodeId: previousNodeId,
        },
      });

      // For branch nodes, create additional children
      if (nodeType === "branch" && i < 48) {
        const branchNode = Object.values(store.getState().workflow.nodes).find(
          (n) => n.label === `Node ${i}`,
        );

        if (branchNode) {
          previousNodeId = branchNode.id;
        }
      }
    }

    const creationTime = performance.now() - startTime;
    const state = store.getState().workflow;

    console.log(`\n⏱️ Performance Metrics:`);
    console.log(`   Creation time: ${creationTime.toFixed(2)}ms`);
    console.log(`   Avg per node: ${(creationTime / 50).toFixed(2)}ms`);
    console.log(`   Total nodes: ${Object.keys(state.nodes).length}`);
    console.log(`   Total connections: ${state.connections.length}`);

    // Performance thresholds
    if (creationTime < 1000) {
      console.log("✅ Excellent performance (< 1s)");
    } else if (creationTime < 3000) {
      console.log("⚠️ Good performance (1-3s)");
    } else {
      console.warn("⚠️ Slow performance (> 3s)");
    }

    // Test save/load performance
    const saveStart = performance.now();
    const json = JSON.stringify({
      nodes: state.nodes,
      connections: state.connections,
      canvasOffset: state.canvasOffset,
      zoom: state.zoom,
    });
    const saveTime = performance.now() - saveStart;

    console.log(`\n💾 Serialization:`);
    console.log(`   Save time: ${saveTime.toFixed(2)}ms`);
    console.log(`   JSON size: ${(json.length / 1024).toFixed(2)}KB`);

    const loadStart = performance.now();
    JSON.parse(json);
    const loadTime = performance.now() - loadStart;

    console.log(`   Load time: ${loadTime.toFixed(2)}ms`);

    if (saveTime < 100 && loadTime < 100) {
      console.log("✅ Serialization performance excellent");
    } else {
      console.warn("⚠️ Serialization may be slow");
    }

    console.log("=".repeat(60));
  },

  /**
   * Test rendering performance
   */
  testRenderingPerformance: () => {
    console.log("\n🧪 Testing Rendering Performance");
    console.log("=".repeat(60));

    const store = window.store;
    if (!store) {
      console.error("❌ Store not available");
      return;
    }

    // Measure FPS
    console.log("Measuring render performance...");
    console.log("💡 Open DevTools Performance tab for detailed metrics");

    let frameCount = 0;
    let lastTime = performance.now();

    const measureFPS = () => {
      const currentTime = performance.now();
      const delta = currentTime - lastTime;

      if (delta >= 1000) {
        const fps = Math.round((frameCount * 1000) / delta);
        console.log(`📊 FPS: ${fps}`);

        if (fps >= 50) {
          console.log("✅ Excellent frame rate");
        } else if (fps >= 30) {
          console.log("⚠️ Acceptable frame rate");
        } else {
          console.warn("⚠️ Poor frame rate");
        }

        return fps;
      }

      frameCount++;
      return null;
    };

    // Trigger some animations
    console.log("\nTriggering state changes...");
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        store.dispatch({
          type: "workflow/updateZoom",
          payload: 1 + i * 0.05,
        });

        const fps = measureFPS();
        if (fps !== null) {
          console.log("FPS measurement complete");
        }
      }, i * 100);
    }

    console.log("=".repeat(60));
  },

  /**
   * Test memory usage
   */
  testMemoryUsage: () => {
    console.log("\n🧪 Testing Memory Usage");
    console.log("=".repeat(60));

    if (!performance.memory) {
      console.warn("⚠️ Memory API not available");
      console.log("💡 Use Chrome with --enable-precise-memory-info flag");
      console.log("=".repeat(60));
      return;
    }

    const store = window.store;
    if (!store) {
      console.error("❌ Store not available");
      return;
    }

    const formatBytes = (bytes) => {
      return `${(bytes / 1024 / 1024).toFixed(2)}MB`;
    };

    // Initial memory
    const initialMemory = {
      used: performance.memory.usedJSHeapSize,
      total: performance.memory.totalJSHeapSize,
      limit: performance.memory.jsHeapSizeLimit,
    };

    console.log("Initial memory:");
    console.log(`   Used: ${formatBytes(initialMemory.used)}`);
    console.log(`   Total: ${formatBytes(initialMemory.total)}`);
    console.log(`   Limit: ${formatBytes(initialMemory.limit)}`);

    // Create large workflow
    console.log("\nCreating 100 nodes...");
    for (let i = 0; i < 100; i++) {
      store.dispatch({
        type: "workflow/addNode",
        payload: {
          type: "action",
          label: `Memory Test ${i}`,
          position: {
            x: 100 + (i % 10) * 150,
            y: 100 + Math.floor(i / 10) * 150,
          },
          parentNodeId: "start-node",
        },
      });
    }

    // Memory after creation
    const afterCreation = {
      used: performance.memory.usedJSHeapSize,
      total: performance.memory.totalJSHeapSize,
    };

    console.log("\nAfter creating 100 nodes:");
    console.log(`   Used: ${formatBytes(afterCreation.used)}`);
    console.log(
      `   Increase: ${formatBytes(afterCreation.used - initialMemory.used)}`,
    );

    // Reset and check for leaks
    store.dispatch({ type: "workflow/resetWorkflow" });

    setTimeout(() => {
      const afterReset = {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
      };

      console.log("\nAfter reset:");
      console.log(`   Used: ${formatBytes(afterReset.used)}`);

      const leak = afterReset.used - initialMemory.used;
      if (leak < 1024 * 1024) {
        // Less than 1MB
        console.log(`✅ Minimal memory leak: ${formatBytes(leak)}`);
      } else {
        console.warn(`⚠️ Potential memory leak: ${formatBytes(leak)}`);
      }

      console.log("=".repeat(60));
    }, 1000); // Wait for GC
  },

  /**
   * Test drag performance
   */
  testDragPerformance: () => {
    console.log("\n🧪 Testing Drag Performance");
    console.log("=".repeat(60));

    console.log("Manual test required:");
    console.log("1. Create several nodes");
    console.log("2. Drag nodes around the canvas");
    console.log("3. Observe smoothness and responsiveness");
    console.log("\n💡 Tips for testing:");
    console.log("   - Drag should feel smooth (60fps)");
    console.log("   - No lag or stuttering");
    console.log("   - Position updates immediately");
    console.log("   - Connections update smoothly");

    console.log("\n🔍 Check DevTools Performance:");
    console.log("   - Record while dragging");
    console.log("   - Look for long tasks (> 50ms)");
    console.log("   - Check for forced reflows");

    console.log("=".repeat(60));
  },

  /**
   * Test undo/redo performance
   */
  testUndoRedoPerformance: () => {
    console.log("\n🧪 Testing Undo/Redo Performance");
    console.log("=".repeat(60));

    const store = window.store;
    if (!store) {
      console.error("❌ Store not available");
      return;
    }

    console.log("Creating 50 history states...");

    // Create 50 states
    for (let i = 0; i < 50; i++) {
      store.dispatch({
        type: "workflow/updateZoom",
        payload: 1 + i * 0.01,
      });
    }

    // Test undo performance
    const undoStart = performance.now();
    for (let i = 0; i < 50; i++) {
      store.dispatch({ type: "workflow/undo" });
    }
    const undoTime = performance.now() - undoStart;

    console.log(`\n⏱️ Undo Performance:`);
    console.log(`   Total time: ${undoTime.toFixed(2)}ms`);
    console.log(`   Avg per undo: ${(undoTime / 50).toFixed(2)}ms`);

    if (undoTime < 500) {
      console.log("✅ Excellent undo performance");
    } else {
      console.warn("⚠️ Undo may be slow");
    }

    // Test redo performance
    const redoStart = performance.now();
    for (let i = 0; i < 50; i++) {
      store.dispatch({ type: "workflow/redo" });
    }
    const redoTime = performance.now() - redoStart;

    console.log(`\n⏱️ Redo Performance:`);
    console.log(`   Total time: ${redoTime.toFixed(2)}ms`);
    console.log(`   Avg per redo: ${(redoTime / 50).toFixed(2)}ms`);

    if (redoTime < 500) {
      console.log("✅ Excellent redo performance");
    } else {
      console.warn("⚠️ Redo may be slow");
    }

    console.log("=".repeat(60));
  },

  /**
   * Test connection calculation performance
   */
  testConnectionCalculation: () => {
    console.log("\n🧪 Testing Connection Calculation");
    console.log("=".repeat(60));

    const store = window.store;
    if (!store) {
      console.error("❌ Store not available");
      return;
    }

    // Create a complex workflow with many connections
    store.dispatch({ type: "workflow/resetWorkflow" });

    console.log("Creating workflow with many connections...");

    // Create a tree structure
    let nodeCount = 1; // start node
    let previousLevel = ["start-node"];

    for (let level = 0; level < 4; level++) {
      const currentLevel = [];

      for (const parentId of previousLevel) {
        // Create 3 children for each parent
        for (let i = 0; i < 3; i++) {
          store.dispatch({
            type: "workflow/addNode",
            payload: {
              type: "action",
              label: `L${level}-${i}`,
              position: { x: 100 + nodeCount * 80, y: 100 + level * 150 },
              parentNodeId,
            },
          });

          const newNode = Object.values(store.getState().workflow.nodes).find(
            (n) => n.label === `L${level}-${i}`,
          );

          if (newNode) {
            currentLevel.push(newNode.id);
            nodeCount++;
          }
        }
      }

      previousLevel = currentLevel;
    }

    const state = store.getState().workflow;
    console.log(`\n📊 Workflow structure:`);
    console.log(`   Nodes: ${Object.keys(state.nodes).length}`);
    console.log(`   Connections: ${state.connections.length}`);

    // Test position update performance
    const updateStart = performance.now();
    const firstNode = Object.keys(state.nodes)[1];

    for (let i = 0; i < 100; i++) {
      store.dispatch({
        type: "workflow/updateNodePosition",
        payload: { nodeId: firstNode, x: 100 + i, y: 100 },
      });
    }

    const updateTime = performance.now() - updateStart;

    console.log(`\n⏱️ Position Update Performance:`);
    console.log(`   100 updates: ${updateTime.toFixed(2)}ms`);
    console.log(`   Avg per update: ${(updateTime / 100).toFixed(2)}ms`);

    if (updateTime / 100 < 5) {
      console.log("✅ Excellent update performance");
    } else {
      console.warn("⚠️ Updates may cause lag");
    }

    console.log("=".repeat(60));
  },

  /**
   * Test localStorage performance with large data
   */
  testStoragePerformance: () => {
    console.log("\n🧪 Testing LocalStorage Performance");
    console.log("=".repeat(60));

    const store = window.store;
    if (!store) {
      console.error("❌ Store not available");
      return;
    }

    // Create large workflow
    store.dispatch({ type: "workflow/resetWorkflow" });

    console.log("Creating 200 nodes for storage test...");
    for (let i = 0; i < 200; i++) {
      store.dispatch({
        type: "workflow/addNode",
        payload: {
          type: "action",
          label: `Storage Test Node ${i}`,
          position: {
            x: 100 + (i % 20) * 100,
            y: 100 + Math.floor(i / 20) * 100,
          },
          parentNodeId: "start-node",
        },
      });
    }

    const state = store.getState().workflow;
    const data = {
      nodes: state.nodes,
      connections: state.connections,
      canvasOffset: state.canvasOffset,
      zoom: state.zoom,
    };

    // Test save
    const saveStart = performance.now();
    const json = JSON.stringify(data);
    localStorage.setItem("test-workflow", json);
    const saveTime = performance.now() - saveStart;

    console.log(`\n💾 Save Performance:`);
    console.log(`   Time: ${saveTime.toFixed(2)}ms`);
    console.log(`   Size: ${(json.length / 1024).toFixed(2)}KB`);
    console.log(`   Nodes: ${Object.keys(data.nodes).length}`);

    if (saveTime < 100) {
      console.log("✅ Excellent save performance");
    } else {
      console.warn("⚠️ Save may be slow");
    }

    // Test load
    const loadStart = performance.now();
    const loaded = localStorage.getItem("test-workflow");
    const parsed = JSON.parse(loaded);
    const loadTime = performance.now() - loadStart;

    console.log(`\n📂 Load Performance:`);
    console.log(`   Time: ${loadTime.toFixed(2)}ms`);
    console.log(`   Nodes restored: ${Object.keys(parsed.nodes).length}`);

    if (loadTime < 100) {
      console.log("✅ Excellent load performance");
    } else {
      console.warn("⚠️ Load may be slow");
    }

    // Cleanup
    localStorage.removeItem("test-workflow");

    console.log("=".repeat(60));
  },

  /**
   * Run all performance tests
   */
  runAllPerformanceTests: () => {
    console.log("\n" + "=".repeat(60));
    console.log("🧪 PERFORMANCE TEST SUITE");
    console.log("=".repeat(60));

    performanceTests.testLargeWorkflow();
    performanceTests.testUndoRedoPerformance();
    performanceTests.testConnectionCalculation();
    performanceTests.testStoragePerformance();

    console.log("\n💡 Additional manual tests:");
    console.log("   - window.performanceTests.testRenderingPerformance()");
    console.log("   - window.performanceTests.testMemoryUsage()");
    console.log("   - window.performanceTests.testDragPerformance()");

    console.log("\n" + "=".repeat(60));
    console.log("✅ Performance tests completed!");
    console.log("=".repeat(60));
  },
};

if (typeof window !== "undefined") {
  window.performanceTests = performanceTests;
  console.log("⚡ Performance tests loaded!");
  console.log("Run: window.performanceTests.runAllPerformanceTests()");
}

export default performanceTests;
