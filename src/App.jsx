import React, { useEffect, useState } from "react";
import Canvas from "./components/Canvas";
import Toolbar from "./components/Toolbar";
import Instructions from "./components/Instructions";
import SaveIndicator from "./components/SaveIndicator";
import SaveControls from "./components/SaveControls";
import WorkflowDebug from "./components/WorkflowDebug";
import "./utils/testUtils"; // Load test utilities

const App = () => {
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    console.log("🚀 Workflow Builder Initialized");
    console.log("💡 Tip: Use window.workflowTest for testing utilities");
    console.log("Example: window.workflowTest.createTestWorkflow()");
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-md px-6 py-4 flex items-center justify-between z-10">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Workflow Builder</h1>
          <p className="text-sm text-gray-600">
            Phase 4: Canvas & Node Components
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium transition-colors"
          >
            {showDebug ? "Hide Debug" : "Show Debug"}
          </button>

          <div className="text-xs text-gray-500 space-y-1">
            <div>✅ Canvas with pan & zoom</div>
            <div>✅ Node components (Action, Branch, End)</div>
            <div>✅ Redux integration</div>
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

      {/* Save Controls - manual save/export/import buttons */}
      <SaveControls />
    </div>
  );
};

export default App;
