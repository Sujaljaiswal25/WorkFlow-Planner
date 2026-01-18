import React, { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  manualSave,
  importWorkflow,
  resetWorkflow,
} from "../store/workflowSlice";
import { clearLocalStorage } from "../store/localStorageMiddleware";
import { selectWorkflowState } from "../store/selectors";

/**
 * WorkflowActions Component
 *
 * Provides controls for:
 * - Manual save (bypass debounce)
 * - Export to JSON file
 * - Copy to clipboard
 * - Import from JSON file
 * - Reset/Clear workflow
 */
const WorkflowActions = () => {
  const dispatch = useDispatch();
  const workflowState = useSelector(selectWorkflowState);
  const fileInputRef = useRef(null);

  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [showImportOptions, setShowImportOptions] = useState(false);
  const [importMode, setImportMode] = useState("replace"); // 'replace' or 'merge'
  const [notification, setNotification] = useState(null);

  // Show notification helper
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Manual Save - triggers immediate save
  const handleManualSave = () => {
    dispatch(manualSave());
    showNotification("✓ Workflow saved successfully!", "success");
  };

  // Export to JSON file
  const handleExportToFile = () => {
    try {
      const exportData = {
        nodes: workflowState.nodes,
        connections: workflowState.connections,
        canvasOffset: workflowState.canvasOffset,
        zoom: workflowState.zoom,
        exportedAt: new Date().toISOString(),
        version: "1.0",
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `workflow-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showNotification("✓ Workflow exported to file!", "success");
      console.log("📤 Exported workflow:", jsonString);
    } catch (error) {
      console.error("Export failed:", error);
      showNotification("✗ Export failed: " + error.message, "error");
    }
  };

  // Copy to clipboard
  const handleCopyToClipboard = async () => {
    try {
      const exportData = {
        nodes: workflowState.nodes,
        connections: workflowState.connections,
        canvasOffset: workflowState.canvasOffset,
        zoom: workflowState.zoom,
        exportedAt: new Date().toISOString(),
        version: "1.0",
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      await navigator.clipboard.writeText(jsonString);

      showNotification("✓ Workflow copied to clipboard!", "success");
      console.log("📋 Copied to clipboard:", jsonString);
    } catch (error) {
      console.error("Copy failed:", error);
      showNotification("✗ Copy failed: " + error.message, "error");
    }
  };

  // Validate imported workflow data
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

    // Validate at least has start node
    const nodeIds = Object.keys(data.nodes);
    if (nodeIds.length === 0) {
      throw new Error("Invalid data: no nodes found");
    }

    // Validate node structure
    for (const nodeId of nodeIds) {
      const node = data.nodes[nodeId];
      if (!node.id || !node.type || !node.label || !node.position) {
        throw new Error(`Invalid node structure: ${nodeId}`);
      }
    }

    // Validate connections
    for (const conn of data.connections) {
      if (!conn.id || !conn.fromNodeId || !conn.toNodeId) {
        throw new Error("Invalid connection structure");
      }
      if (!data.nodes[conn.fromNodeId] || !data.nodes[conn.toNodeId]) {
        throw new Error(`Connection references non-existent node: ${conn.id}`);
      }
    }

    return true;
  };

  // Import from file
  const handleImportFile = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);

        // Validate the imported data
        validateWorkflowData(jsonData);

        // Show import options modal
        setShowImportOptions(true);
        window.importedData = jsonData; // Temporarily store for modal confirmation
      } catch (error) {
        console.error("Import failed:", error);
        showNotification("✗ Import failed: " + error.message, "error");
      }
    };

    reader.onerror = () => {
      showNotification("✗ Failed to read file", "error");
    };

    reader.readAsText(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Confirm import
  const handleConfirmImport = () => {
    try {
      const jsonData = window.importedData;
      if (!jsonData) throw new Error("No import data found");

      dispatch(
        importWorkflow({
          nodes: jsonData.nodes,
          connections: jsonData.connections,
          canvasOffset: jsonData.canvasOffset || { x: 0, y: 0 },
          zoom: jsonData.zoom || 1,
          merge: importMode === "merge",
        }),
      );

      showNotification(
        `✓ Workflow ${importMode === "merge" ? "merged" : "imported"}!`,
        "success",
      );

      // Clean up
      delete window.importedData;
      setShowImportOptions(false);
      setImportMode("replace");
    } catch (error) {
      console.error("Import confirmation failed:", error);
      showNotification("✗ Import failed: " + error.message, "error");
    }
  };

  // Reset workflow
  const handleResetWorkflow = () => {
    dispatch(resetWorkflow());
    clearLocalStorage();
    showNotification("✓ Workflow reset successfully!", "success");
    setShowConfirmReset(false);
  };

  return (
    <>
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-3 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border-2 border-gray-200 px-5 py-3 z-10">
        {/* Manual Save */}
        <button
          onClick={handleManualSave}
          className="px-4 py-2 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 flex items-center gap-2 border border-green-700"
          title="Save workflow immediately"
        >
          <span className="text-lg">💾</span>
          <span>Save</span>
        </button>

        {/* Export */}
        <div className="relative group">
          <button
            onClick={handleExportToFile}
            className="px-4 py-2 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 flex items-center gap-2 border border-blue-700"
            title="Export to JSON file"
          >
            <span className="text-lg">📥</span>
            <span>Export</span>
          </button>

          {/* Export dropdown */}
          <div className="absolute bottom-full left-0 mb-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity">
            <div className="bg-white rounded-lg shadow-xl border-2 border-gray-200 p-2 min-w-[180px]">
              <button
                onClick={handleExportToFile}
                className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded text-sm transition-colors flex items-center gap-2"
              >
                <span>📄</span> Download JSON
              </button>
              <button
                onClick={handleCopyToClipboard}
                className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded text-sm transition-colors flex items-center gap-2"
              >
                <span>📋</span> Copy to Clipboard
              </button>
            </div>
          </div>
        </div>

        {/* Import */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 flex items-center gap-2 border border-purple-700"
          title="Import workflow from JSON"
        >
          <span className="text-lg">📤</span>
          <span>Import</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleImportFile}
          className="hidden"
        />

        {/* Reset */}
        <button
          onClick={() => setShowConfirmReset(true)}
          className="px-4 py-2 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 flex items-center gap-2 border border-red-700"
          title="Clear all nodes and reset workflow"
        >
          <span className="text-lg">🗑️</span>
          <span>Clear</span>
        </button>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`fixed top-20 right-4 px-5 py-3 rounded-xl shadow-2xl border-2 z-[9999] animate-fadeIn ${
            notification.type === "success"
              ? "bg-green-50 border-green-300 text-green-800"
              : "bg-red-50 border-red-300 text-red-800"
          }`}
        >
          <div className="font-semibold">{notification.message}</div>
        </div>
      )}

      {/* Import Options Modal */}
      {showImportOptions && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-gray-300 p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">📤</span>
              Import Workflow
            </h3>

            <div className="space-y-4 mb-6">
              <p className="text-sm text-gray-600">
                How would you like to import this workflow?
              </p>

              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 rounded-lg border-2 border-gray-200 hover:border-purple-300 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="importMode"
                    value="replace"
                    checked={importMode === "replace"}
                    onChange={(e) => setImportMode(e.target.value)}
                    className="w-4 h-4"
                  />
                  <div>
                    <div className="font-semibold text-gray-800">
                      Replace Current
                    </div>
                    <div className="text-xs text-gray-500">
                      Replace all existing nodes with imported workflow
                    </div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-lg border-2 border-gray-200 hover:border-purple-300 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="importMode"
                    value="merge"
                    checked={importMode === "merge"}
                    onChange={(e) => setImportMode(e.target.value)}
                    className="w-4 h-4"
                  />
                  <div>
                    <div className="font-semibold text-gray-800">
                      Merge with Current
                    </div>
                    <div className="text-xs text-gray-500">
                      Add imported nodes to existing workflow
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowImportOptions(false);
                  setImportMode("replace");
                  delete window.importedData;
                }}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmImport}
                className="flex-1 px-4 py-2 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
              >
                Import
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showConfirmReset && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-gray-300 p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">⚠️</span>
              Clear Workflow?
            </h3>

            <p className="text-gray-600 mb-6">
              This will delete all nodes and connections, and reset the workflow
              to its initial state. This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleResetWorkflow}
                className="flex-1 px-4 py-2 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
              >
                Clear Workflow
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WorkflowActions;
