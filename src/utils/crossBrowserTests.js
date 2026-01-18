/**
 * Phase 13.6: Cross-Browser Compatibility Testing
 * Tests for browser-specific features and compatibility
 */

export const crossBrowserTests = {
  /**
   * Detect browser information
   */
  detectBrowser: () => {
    console.log("\n🌐 Browser Detection");
    console.log("=".repeat(60));

    const ua = navigator.userAgent;
    let browser = "Unknown";
    let version = "Unknown";

    if (ua.includes("Firefox")) {
      browser = "Firefox";
      version = ua.match(/Firefox\/(\d+)/)?.[1] || "Unknown";
    } else if (ua.includes("Edg")) {
      browser = "Edge";
      version = ua.match(/Edg\/(\d+)/)?.[1] || "Unknown";
    } else if (ua.includes("Chrome")) {
      browser = "Chrome";
      version = ua.match(/Chrome\/(\d+)/)?.[1] || "Unknown";
    } else if (ua.includes("Safari") && !ua.includes("Chrome")) {
      browser = "Safari";
      version = ua.match(/Version\/(\d+)/)?.[1] || "Unknown";
    }

    console.log(`Browser: ${browser} ${version}`);
    console.log(`Platform: ${navigator.platform}`);
    console.log(`User Agent: ${ua.substring(0, 80)}...`);

    console.log("=".repeat(60));

    return { browser, version };
  },

  /**
   * Test localStorage availability
   */
  testLocalStorageSupport: () => {
    console.log("\n🧪 Testing LocalStorage Support");
    console.log("=".repeat(60));

    let passed = 0;
    let failed = 0;

    // Test 1: Basic availability
    try {
      if (typeof localStorage !== "undefined") {
        console.log("✅ localStorage is available");
        passed++;
      } else {
        console.error("❌ localStorage is not available");
        failed++;
      }
    } catch (error) {
      console.error("❌ localStorage check failed:", error.message);
      failed++;
    }

    // Test 2: Write capability
    try {
      localStorage.setItem("test-key", "test-value");
      const value = localStorage.getItem("test-key");

      if (value === "test-value") {
        console.log("✅ localStorage write/read works");
        passed++;
      } else {
        console.error("❌ localStorage read mismatch");
        failed++;
      }

      localStorage.removeItem("test-key");
    } catch (error) {
      console.error("❌ localStorage write failed:", error.message);
      if (error.name === "QuotaExceededError") {
        console.warn("⚠️ Storage quota exceeded");
      }
      failed++;
    }

    // Test 3: Quota check
    try {
      if (navigator.storage && navigator.storage.estimate) {
        navigator.storage.estimate().then((estimate) => {
          console.log(`✅ Storage quota API available`);
          console.log(
            `   Used: ${((estimate.usage || 0) / 1024 / 1024).toFixed(2)}MB`,
          );
          console.log(
            `   Quota: ${((estimate.quota || 0) / 1024 / 1024).toFixed(2)}MB`,
          );
        });
      } else {
        console.warn("⚠️ Storage quota API not available");
      }
    } catch (error) {
      console.warn("⚠️ Quota check failed:", error.message);
    }

    // Test 4: Size limits
    try {
      // Try to store 1MB of data
      const testData = "x".repeat(1024 * 1024);
      localStorage.setItem("large-test", testData);
      localStorage.removeItem("large-test");
      console.log("✅ Can store 1MB+ data");
      passed++;
    } catch (error) {
      console.warn("⚠️ Cannot store 1MB data:", error.name);
    }

    console.log(`\n📊 Results: ✅ ${passed} passed, ❌ ${failed} failed`);
    console.log("=".repeat(60));

    return { passed, failed };
  },

  /**
   * Test Redux DevTools availability
   */
  testReduxDevTools: () => {
    console.log("\n🧪 Testing Redux DevTools");
    console.log("=".repeat(60));

    if (window.__REDUX_DEVTOOLS_EXTENSION__) {
      console.log("✅ Redux DevTools extension detected");
      console.log("💡 Open DevTools → Redux tab to inspect state");
    } else {
      console.warn("⚠️ Redux DevTools extension not found");
      console.log("💡 Install from:");
      console.log("   Chrome: https://chrome.google.com/webstore");
      console.log("   Firefox: https://addons.mozilla.org");
    }

    console.log("=".repeat(60));
  },

  /**
   * Test drag-and-drop support
   */
  testDragDropSupport: () => {
    console.log("\n🧪 Testing Drag & Drop Support");
    console.log("=".repeat(60));

    let passed = 0;
    let failed = 0;

    // Test 1: Drag events
    const testDiv = document.createElement("div");

    if ("ondragstart" in testDiv) {
      console.log("✅ Drag events supported");
      passed++;
    } else {
      console.error("❌ Drag events not supported");
      failed++;
    }

    // Test 2: DataTransfer API
    try {
      const dt = new DataTransfer();
      if (dt) {
        console.log("✅ DataTransfer API available");
        passed++;
      }
    } catch (error) {
      console.error("❌ DataTransfer API not available");
      failed++;
    }

    // Test 3: Touch events (for mobile)
    if ("ontouchstart" in window) {
      console.log("✅ Touch events supported (mobile-friendly)");
      passed++;
    } else {
      console.log("⚠️ Touch events not supported (desktop only)");
    }

    // Test 4: Pointer events
    if ("onpointerdown" in window) {
      console.log("✅ Pointer events supported");
      passed++;
    } else {
      console.warn("⚠️ Pointer events not supported");
    }

    console.log(`\n📊 Results: ✅ ${passed} passed, ❌ ${failed} failed`);
    console.log("=".repeat(60));

    return { passed, failed };
  },

  /**
   * Test CSS features
   */
  testCSSFeatures: () => {
    console.log("\n🧪 Testing CSS Features");
    console.log("=".repeat(60));

    let passed = 0;
    let failed = 0;

    // Test 1: CSS Grid
    const testDiv = document.createElement("div");
    testDiv.style.display = "grid";

    if (testDiv.style.display === "grid") {
      console.log("✅ CSS Grid supported");
      passed++;
    } else {
      console.error("❌ CSS Grid not supported");
      failed++;
    }

    // Test 2: CSS Flexbox
    testDiv.style.display = "flex";

    if (testDiv.style.display === "flex") {
      console.log("✅ CSS Flexbox supported");
      passed++;
    } else {
      console.error("❌ CSS Flexbox not supported");
      failed++;
    }

    // Test 3: CSS Custom Properties
    testDiv.style.setProperty("--test-var", "10px");

    if (testDiv.style.getPropertyValue("--test-var")) {
      console.log("✅ CSS Custom Properties supported");
      passed++;
    } else {
      console.error("❌ CSS Custom Properties not supported");
      failed++;
    }

    // Test 4: CSS Transforms
    testDiv.style.transform = "scale(1.5)";

    if (testDiv.style.transform) {
      console.log("✅ CSS Transforms supported");
      passed++;
    } else {
      console.error("❌ CSS Transforms not supported");
      failed++;
    }

    // Test 5: Backdrop Filter
    testDiv.style.backdropFilter = "blur(10px)";

    if (testDiv.style.backdropFilter || testDiv.style.webkitBackdropFilter) {
      console.log("✅ Backdrop Filter supported");
      passed++;
    } else {
      console.warn("⚠️ Backdrop Filter not supported");
    }

    console.log(`\n📊 Results: ✅ ${passed} passed, ❌ ${failed} failed`);
    console.log("=".repeat(60));

    return { passed, failed };
  },

  /**
   * Test ES6+ features
   */
  testJavaScriptFeatures: () => {
    console.log("\n🧪 Testing JavaScript Features");
    console.log("=".repeat(60));

    let passed = 0;
    let failed = 0;

    // Test 1: Arrow functions
    try {
      const arrow = () => true;
      if (arrow()) {
        console.log("✅ Arrow functions supported");
        passed++;
      }
    } catch (error) {
      console.error("❌ Arrow functions not supported");
      failed++;
    }

    // Test 2: Destructuring
    try {
      const { a, b } = { a: 1, b: 2 };
      if (a === 1 && b === 2) {
        console.log("✅ Destructuring supported");
        passed++;
      }
    } catch (error) {
      console.error("❌ Destructuring not supported");
      failed++;
    }

    // Test 3: Spread operator
    try {
      const arr1 = [1, 2];
      const arr2 = [...arr1, 3];
      if (arr2.length === 3) {
        console.log("✅ Spread operator supported");
        passed++;
      }
    } catch (error) {
      console.error("❌ Spread operator not supported");
      failed++;
    }

    // Test 4: Optional chaining
    try {
      const obj = {};
      const value = obj?.nested?.property;
      console.log("✅ Optional chaining supported");
      passed++;
    } catch (error) {
      console.error("❌ Optional chaining not supported");
      failed++;
    }

    // Test 5: Nullish coalescing
    try {
      const value = null ?? "default";
      if (value === "default") {
        console.log("✅ Nullish coalescing supported");
        passed++;
      }
    } catch (error) {
      console.error("❌ Nullish coalescing not supported");
      failed++;
    }

    // Test 6: Promise
    try {
      const p = new Promise((resolve) => resolve(true));
      console.log("✅ Promises supported");
      passed++;
    } catch (error) {
      console.error("❌ Promises not supported");
      failed++;
    }

    console.log(`\n📊 Results: ✅ ${passed} passed, ❌ ${failed} failed`);
    console.log("=".repeat(60));

    return { passed, failed };
  },

  /**
   * Test performance APIs
   */
  testPerformanceAPIs: () => {
    console.log("\n🧪 Testing Performance APIs");
    console.log("=".repeat(60));

    let passed = 0;
    let failed = 0;

    // Test 1: performance.now()
    if (
      typeof performance !== "undefined" &&
      typeof performance.now === "function"
    ) {
      console.log("✅ performance.now() available");
      passed++;
    } else {
      console.error("❌ performance.now() not available");
      failed++;
    }

    // Test 2: performance.memory
    if (performance.memory) {
      console.log("✅ performance.memory available");
      console.log(
        `   Used: ${(performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
      );
      passed++;
    } else {
      console.warn("⚠️ performance.memory not available (Chrome only)");
    }

    // Test 3: requestAnimationFrame
    if (typeof requestAnimationFrame === "function") {
      console.log("✅ requestAnimationFrame available");
      passed++;
    } else {
      console.error("❌ requestAnimationFrame not available");
      failed++;
    }

    // Test 4: IntersectionObserver
    if (typeof IntersectionObserver !== "undefined") {
      console.log("✅ IntersectionObserver available");
      passed++;
    } else {
      console.warn("⚠️ IntersectionObserver not available");
    }

    console.log(`\n📊 Results: ✅ ${passed} passed, ❌ ${failed} failed`);
    console.log("=".repeat(60));

    return { passed, failed };
  },

  /**
   * Test clipboard API
   */
  testClipboardAPI: async () => {
    console.log("\n🧪 Testing Clipboard API");
    console.log("=".repeat(60));

    let passed = 0;
    let failed = 0;

    // Test 1: navigator.clipboard
    if (navigator.clipboard) {
      console.log("✅ Clipboard API available");
      passed++;

      // Test 2: Write permission
      try {
        await navigator.clipboard.writeText("test");
        console.log("✅ Clipboard write works");
        passed++;
      } catch (error) {
        console.warn("⚠️ Clipboard write requires permission");
        console.log("   Error:", error.message);
      }

      // Test 3: Read permission
      try {
        const text = await navigator.clipboard.readText();
        console.log("✅ Clipboard read works");
        passed++;
      } catch (error) {
        console.warn("⚠️ Clipboard read requires permission");
        console.log("   Error:", error.message);
      }
    } else {
      console.error("❌ Clipboard API not available");
      failed++;
      console.log("💡 Fallback to document.execCommand");
    }

    console.log(`\n📊 Results: ✅ ${passed} passed, ❌ ${failed} failed`);
    console.log("=".repeat(60));

    return { passed, failed };
  },

  /**
   * Test keyboard shortcuts
   */
  testKeyboardShortcuts: () => {
    console.log("\n🧪 Testing Keyboard Shortcuts");
    console.log("=".repeat(60));

    console.log("Supported shortcuts:");
    console.log("   Undo: Ctrl+Z (Cmd+Z on Mac)");
    console.log("   Redo: Ctrl+Y (Cmd+Shift+Z on Mac)");
    console.log("   Delete: Delete/Backspace");

    console.log("\n💡 Platform detection:");
    const isMac = navigator.platform.toUpperCase().includes("MAC");
    console.log(`   Platform: ${navigator.platform}`);
    console.log(`   Is Mac: ${isMac}`);
    console.log(`   Modifier key: ${isMac ? "Cmd" : "Ctrl"}`);

    console.log("\n🔍 Manual test:");
    console.log("   1. Try Ctrl+Z / Cmd+Z");
    console.log("   2. Try Ctrl+Y / Cmd+Shift+Z");
    console.log("   3. Verify shortcuts work correctly");

    console.log("=".repeat(60));
  },

  /**
   * Generate compatibility report
   */
  generateCompatibilityReport: async () => {
    console.log("\n" + "=".repeat(60));
    console.log("🌐 BROWSER COMPATIBILITY REPORT");
    console.log("=".repeat(60));

    const browserInfo = crossBrowserTests.detectBrowser();

    const results = {
      localStorage: crossBrowserTests.testLocalStorageSupport(),
      dragDrop: crossBrowserTests.testDragDropSupport(),
      css: crossBrowserTests.testCSSFeatures(),
      javascript: crossBrowserTests.testJavaScriptFeatures(),
      performance: crossBrowserTests.testPerformanceAPIs(),
    };

    crossBrowserTests.testReduxDevTools();
    await crossBrowserTests.testClipboardAPI();
    crossBrowserTests.testKeyboardShortcuts();

    // Calculate totals
    const totalPassed = Object.values(results).reduce(
      (sum, r) => sum + (r?.passed || 0),
      0,
    );
    const totalFailed = Object.values(results).reduce(
      (sum, r) => sum + (r?.failed || 0),
      0,
    );
    const total = totalPassed + totalFailed;
    const percentage = total > 0 ? ((totalPassed / total) * 100).toFixed(1) : 0;

    console.log("\n" + "=".repeat(60));
    console.log("📊 OVERALL COMPATIBILITY:");
    console.log(`   Browser: ${browserInfo.browser} ${browserInfo.version}`);
    console.log(`   ✅ Passed: ${totalPassed}`);
    console.log(`   ❌ Failed: ${totalFailed}`);
    console.log(`   🎯 Score: ${percentage}%`);

    if (totalFailed === 0) {
      console.log("\n🎉 Perfect compatibility! All tests passed.");
    } else if (totalFailed <= 3) {
      console.log("\n✅ Good compatibility with minor issues.");
    } else {
      console.warn("\n⚠️ Some compatibility issues detected.");
    }

    console.log("\n💡 Recommended browsers:");
    console.log("   - Chrome 90+");
    console.log("   - Firefox 88+");
    console.log("   - Safari 14+");
    console.log("   - Edge 90+");

    console.log("=".repeat(60));
  },

  /**
   * Run all cross-browser tests
   */
  runAllCrossBrowserTests: async () => {
    await crossBrowserTests.generateCompatibilityReport();
  },
};

if (typeof window !== "undefined") {
  window.crossBrowserTests = crossBrowserTests;
  console.log("🌐 Cross-browser tests loaded!");
  console.log("Run: await window.crossBrowserTests.runAllCrossBrowserTests()");
}

export default crossBrowserTests;
