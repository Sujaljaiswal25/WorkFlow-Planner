import React, { useEffect } from "react";
import SaveIndicator from "./components/SaveIndicator";
import SaveControls from "./components/SaveControls";
import WorkflowDebug from "./components/WorkflowDebug";
import "./utils/testUtils"; // Load test utilities

const App = () => {
  useEffect(() => {
    console.log("🚀 Workflow Builder Initialized");
    console.log("💡 Tip: Use window.workflowTest for testing utilities");
    console.log("Example: window.workflowTest.createTestWorkflow()");
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Workflow Builder
        </h1>
        <p className="text-gray-600 mb-2">
          Phase 3: LocalStorage Integration Complete
        </p>
        <div className="text-sm text-gray-500 space-y-1">
          <p>✅ Auto-save with 500ms debouncing</p>
          <p>✅ State hydration from localStorage on load</p>
          <p>✅ Manual save/export/import functions</p>
          <p>✅ JSON logging to console on save</p>
          <p>✅ Error handling for quota/parse errors</p>
        </div>
      </div>

      {/* Debug panel to test functionality */}
      <WorkflowDebug />

      {/* Save Indicator - shows auto-save status */}
      <SaveIndicator />

      {/* Save Controls - manual save/export/import buttons */}
      <SaveControls />
    </div>
  );
};

export default App;
