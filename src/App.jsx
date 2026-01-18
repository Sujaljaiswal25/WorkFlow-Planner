import React, { useEffect, useState } from "react";
import Canvas from "./components/Canvas";
import Toolbar from "./components/Toolbar";
import Instructions from "./components/Instructions";
import SaveIndicator from "./components/SaveIndicator";
import SaveControls from "./components/SaveControls";
import WorkflowDebug from "./components/WorkflowDebug";
import WorkflowActions from "./components/WorkflowActions";
import "./utils/testUtils"; // Load test utilities
import "./utils/deleteTestScenarios"; // Load delete test scenarios
import "./utils/editTestScenarios"; // Load edit test scenarios
import "./utils/undoRedoTestScenarios"; // Load undo/redo test scenarios
import "./utils/workflowActionsTests"; // Load workflow actions test scenarios

const App = () => {
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    console.log("🚀 Workflow Builder Initialized");
    console.log("💡 Tip: Use window.workflowTest for testing utilities");
    console.log("Example: window.workflowTest.createTestWorkflow()");
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-lg px-6 py-4 flex items-center justify-between z-10 border-b-2 border-gray-200">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Workflow Builder
          </h1>
          <p className="text-sm text-gray-600 font-medium">
            Phase 12: Save/Export/Import/Reset 💾
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              if (window.undoRedoTests) {
                window.undoRedoTests.runAllUndoRedoTests();
                alert("Check browser console for test results!");
              }
            }}
            className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-sm font-medium transition-colors"
          >
            Test Undo/Redo
          </button>

          <button
            onClick={() => {
              if (window.editTests) {
                window.editTests.runAllEditingTests();
                alert("Check browser console for test results!");
              }
            }}
            className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-sm font-medium transition-colors"
          >
            Test Editing
          </button>

          <button
            onClick={() => {
              if (window.deleteTests) {
                window.deleteTests.runAllDeleteTests();
                alert("Check browser console for test results!");
              }
            }}
            className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors"
          >
            Test Delete
          </button>

          <button
            onClick={() => setShowDebug(!showDebug)}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium transition-colors"
          >
            {showDebug ? "Hide Debug" : "Show Debug"}
          </button>

          <div className="text-xs text-gray-500 space-y-1">
            <div>✅ Full undo/redo (Ctrl+Z)</div>
            <div>✅ History tracking (50 states)</div>
            <div>✅ Keyboard shortcuts</div>
          </div>
        </div>
      </header>

      {/* Main Canvas Area */}
      <main className="flex-1 relative overflow-hidden">
        <Toolbar />
        <Canvas />
        <Instructions />
      </main>

      {/* Debug Panel */}
      {showDebug && (
        <div className="fixed top-20 left-4 max-w-md z-20">
          <WorkflowDebug />
        </div>
      )}

      {/* Save Indicator - shows auto-save status */}
      <SaveIndicator />

      {/* Workflow Actions - save/export/import/reset buttons */}
      <WorkflowActions />
    </div>
  );
};

export default App;
