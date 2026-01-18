/**
 * Phase 13: Master Test Suite
 * Centralized test runner for all test categories
 */

import reduxStateTests from "./reduxStateTests";
import localStorageTests from "./localStorageTests";
import undoRedoTests from "./undoRedoTests";
import integrationTests from "./integrationTests";
import performanceTests from "./performanceTests";
import crossBrowserTests from "./crossBrowserTests";

export const masterTestSuite = {
  /**
   * Run all test suites
   */
  runAllTests: async () => {
    console.clear();
    console.log("╔" + "═".repeat(58) + "╗");
    console.log(
      "║" +
        " ".repeat(12) +
        "WORKFLOW PLANNER TEST SUITE" +
        " ".repeat(18) +
        "║",
    );
    console.log(
      "║" + " ".repeat(20) + "Phase 13 Testing" + " ".repeat(22) + "║",
    );
    console.log("╚" + "═".repeat(58) + "╝");

    const startTime = performance.now();

    console.log("\n🎯 Running comprehensive test suite...\n");

    // Test 1: Redux State
    console.log("1️⃣ Redux State Tests");
    console.log("─".repeat(60));
    reduxStateTests.runAllReduxTests();

    // Test 2: LocalStorage
    console.log("\n2️⃣ LocalStorage Tests");
    console.log("─".repeat(60));
    await localStorageTests.runAllLocalStorageTests();

    // Test 3: Undo/Redo
    console.log("\n3️⃣ Undo/Redo Tests");
    console.log("─".repeat(60));
    undoRedoTests.runAllUndoRedoTests();

    // Test 4: Integration
    console.log("\n4️⃣ Integration Tests");
    console.log("─".repeat(60));
    integrationTests.runAllIntegrationTests();

    // Test 5: Performance
    console.log("\n5️⃣ Performance Tests");
    console.log("─".repeat(60));
    performanceTests.runAllPerformanceTests();

    // Test 6: Cross-Browser
    console.log("\n6️⃣ Cross-Browser Compatibility");
    console.log("─".repeat(60));
    await crossBrowserTests.runAllCrossBrowserTests();

    const endTime = performance.now();
    const totalTime = ((endTime - startTime) / 1000).toFixed(2);

    console.log("\n╔" + "═".repeat(58) + "╗");
    console.log(
      "║" + " ".repeat(18) + "TEST SUITE COMPLETE" + " ".repeat(21) + "║",
    );
    console.log("╚" + "═".repeat(58) + "╝");
    console.log(`\n⏱️  Total execution time: ${totalTime}s`);
    console.log("\n📊 Individual test suites available:");
    console.log("   window.reduxStateTests.runAllReduxTests()");
    console.log("   window.localStorageTests.runAllLocalStorageTests()");
    console.log("   window.undoRedoTests.runAllUndoRedoTests()");
    console.log("   window.integrationTests.runAllIntegrationTests()");
    console.log("   window.performanceTests.runAllPerformanceTests()");
    console.log("   await window.crossBrowserTests.runAllCrossBrowserTests()");
  },

  /**
   * Run quick smoke tests (fast subset)
   */
  runSmokeTests: () => {
    console.clear();
    console.log("╔" + "═".repeat(58) + "╗");
    console.log("║" + " ".repeat(21) + "SMOKE TESTS" + " ".repeat(26) + "║");
    console.log("╚" + "═".repeat(58) + "╝");

    const startTime = performance.now();

    console.log("\n🔥 Running quick smoke tests...\n");

    // Quick Redux tests
    console.log("1️⃣ Redux State (Quick)");
    reduxStateTests.testAllReducers();

    // Quick storage test
    console.log("\n2️⃣ LocalStorage (Quick)");
    localStorageTests.testStorageSize();

    // Quick undo test
    console.log("\n3️⃣ Undo/Redo (Quick)");
    undoRedoTests.testRedoAfterUndo();

    // Quick integration test
    console.log("\n4️⃣ Integration (Quick)");
    integrationTests.testNodeSelection();

    const endTime = performance.now();
    const totalTime = ((endTime - startTime) / 1000).toFixed(2);

    console.log("\n✅ Smoke tests complete!");
    console.log(`⏱️  Execution time: ${totalTime}s`);
    console.log("\n💡 Run full suite: window.masterTestSuite.runAllTests()");
  },

  /**
   * Test specific category
   */
  runCategory: async (category) => {
    console.clear();
    console.log("╔" + "═".repeat(58) + "╗");
    console.log(
      "║" +
        " ".repeat(18) +
        `CATEGORY: ${category.toUpperCase()}` +
        " ".repeat(18 - category.length) +
        "║",
    );
    console.log("╚" + "═".repeat(58) + "╝\n");

    switch (category.toLowerCase()) {
      case "redux":
        reduxStateTests.runAllReduxTests();
        break;
      case "storage":
      case "localstorage":
        await localStorageTests.runAllLocalStorageTests();
        break;
      case "undo":
      case "history":
        undoRedoTests.runAllUndoRedoTests();
        break;
      case "integration":
        integrationTests.runAllIntegrationTests();
        break;
      case "performance":
      case "perf":
        performanceTests.runAllPerformanceTests();
        break;
      case "browser":
      case "compatibility":
        await crossBrowserTests.runAllCrossBrowserTests();
        break;
      default:
        console.error("❌ Unknown category:", category);
        console.log("\n💡 Available categories:");
        console.log("   - redux");
        console.log("   - storage");
        console.log("   - undo");
        console.log("   - integration");
        console.log("   - performance");
        console.log("   - browser");
    }
  },

  /**
   * Show test suite help
   */
  help: () => {
    console.clear();
    console.log("╔" + "═".repeat(58) + "╗");
    console.log(
      "║" + " ".repeat(15) + "TEST SUITE COMMANDS" + " ".repeat(24) + "║",
    );
    console.log("╚" + "═".repeat(58) + "╝");

    console.log("\n🎯 Master Commands:");
    console.log("   window.masterTestSuite.runAllTests()");
    console.log("   → Run complete test suite (all categories)\n");

    console.log("   window.masterTestSuite.runSmokeTests()");
    console.log("   → Run quick smoke tests (fast subset)\n");

    console.log("   window.masterTestSuite.runCategory('redux')");
    console.log("   → Run specific category\n");

    console.log("\n📁 Individual Test Suites:");
    console.log("   window.reduxStateTests.runAllReduxTests()");
    console.log("   → Redux state, reducers, selectors\n");

    console.log("   window.localStorageTests.runAllLocalStorageTests()");
    console.log("   → Persistence, quota, corruption\n");

    console.log("   window.undoRedoTests.runAllUndoRedoTests()");
    console.log("   → History management, undo/redo\n");

    console.log("   window.integrationTests.runAllIntegrationTests()");
    console.log("   → Complete workflows, edge cases\n");

    console.log("   window.performanceTests.runAllPerformanceTests()");
    console.log("   → Large workflows, rendering, memory\n");

    console.log("   await window.crossBrowserTests.runAllCrossBrowserTests()");
    console.log("   → Browser compatibility, APIs\n");

    console.log("\n🔍 Specific Tests:");
    console.log("   window.reduxStateTests.testAllReducers()");
    console.log("   window.localStorageTests.testLargeWorkflow()");
    console.log("   window.undoRedoTests.testHistoryLimits()");
    console.log("   window.integrationTests.testCompleteWorkflow()");
    console.log("   window.performanceTests.testMemoryUsage()");
    console.log("   window.crossBrowserTests.detectBrowser()");

    console.log("\n💡 Tips:");
    console.log("   - Run smoke tests first for quick validation");
    console.log("   - Use category tests for focused debugging");
    console.log("   - Full suite takes 10-30 seconds");
    console.log("   - Open DevTools before running performance tests");

    console.log("\n" + "═".repeat(60));
  },

  /**
   * Get test summary
   */
  getSummary: () => {
    console.log("\n📊 Test Suite Summary");
    console.log("=".repeat(60));
    console.log("1. Redux State Tests (5 test functions)");
    console.log("   - Reducer validation");
    console.log("   - Selector verification");
    console.log("   - State mutation prevention");
    console.log("   - State consistency checks");
    console.log("   - DevTools detection\n");

    console.log("2. LocalStorage Tests (7 test functions)");
    console.log("   - Persistence across refresh");
    console.log("   - Large workflow handling");
    console.log("   - Corrupted data recovery");
    console.log("   - Auto-save debouncing");
    console.log("   - Storage size calculation");
    console.log("   - Clear operations\n");

    console.log("3. Undo/Redo Tests (8 test functions)");
    console.log("   - All trackable operations");
    console.log("   - Redo after undo");
    console.log("   - 50-state history limit");
    console.log("   - Future history clearing");
    console.log("   - Keyboard shortcuts");
    console.log("   - Complex operations");
    console.log("   - History persistence\n");

    console.log("4. Integration Tests (6 test functions)");
    console.log("   - Complete workflow creation");
    console.log("   - Delete all except Start");
    console.log("   - Node selection/deselection");
    console.log("   - Canvas pan & zoom");
    console.log("   - Import/export workflows");
    console.log("   - Orphaned connection cleanup\n");

    console.log("5. Performance Tests (8 test functions)");
    console.log("   - 50+ node workflows");
    console.log("   - Rendering performance");
    console.log("   - Memory usage tracking");
    console.log("   - Drag performance");
    console.log("   - Undo/redo performance");
    console.log("   - Connection calculations");
    console.log("   - Storage performance\n");

    console.log("6. Cross-Browser Tests (9 test functions)");
    console.log("   - Browser detection");
    console.log("   - LocalStorage support");
    console.log("   - Redux DevTools");
    console.log("   - Drag & drop APIs");
    console.log("   - CSS features (Grid, Flexbox, etc.)");
    console.log("   - ES6+ JavaScript features");
    console.log("   - Performance APIs");
    console.log("   - Clipboard API");
    console.log("   - Keyboard shortcuts\n");

    console.log("Total: 43 test functions across 6 categories");
    console.log("=".repeat(60));
  },
};

// Expose to window
if (typeof window !== "undefined") {
  window.masterTestSuite = masterTestSuite;
  window.testSuite = masterTestSuite; // Short alias

  console.log("\n╔" + "═".repeat(58) + "╗");
  console.log(
    "║" +
      " ".repeat(10) +
      "WORKFLOW PLANNER - TEST SUITE LOADED" +
      " ".repeat(12) +
      "║",
  );
  console.log("╚" + "═".repeat(58) + "╝");
  console.log("\n🧪 Phase 13: Comprehensive Testing Suite Ready!");
  console.log("\n📚 Quick Start:");
  console.log("   window.masterTestSuite.help()       - Show all commands");
  console.log("   window.masterTestSuite.runAllTests() - Run all tests");
  console.log("   window.testSuite.runSmokeTests()    - Quick validation");
  console.log("\n" + "═".repeat(60) + "\n");
}

export default masterTestSuite;
