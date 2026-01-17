import React, { useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectWorkflowState } from "../store/selectors";
import { loadWorkflow, resetWorkflow } from "../store/workflowSlice";
import { addNotification } from "../store/uiSlice";
import {
  manualSave,
  exportToJSON,
  importFromJSON,
  copyToClipboard,
  getWorkflowStats,
  validateWorkflow,
  clearLocalStorage,
} from "../utils/workflowExport";

const SaveControls = () => {
  const dispatch = useDispatch();
  const workflowState = useSelector(selectWorkflowState);
  const fileInputRef = useRef(null);

  const handleManualSave = () => {
    const result = manualSave(workflowState);

    if (result.success) {
      dispatch(
        addNotification({
          type: "success",
          message: "✅ Workflow saved successfully",
          duration: 2000,
        })
      );
    } else {
      dispatch(
        addNotification({
          type: "error",
          message: `❌ Save failed: ${result.message}`,
          duration: 4000,
        })
      );
    }
  };

  const handleExport = () => {
    const result = exportToJSON(workflowState);

    if (result.success) {
      dispatch(
        addNotification({
          type: "success",
          message: `📤 Exported as ${result.filename}`,
          duration: 3000,
        })
      );
    } else {
      dispatch(
        addNotification({
          type: "error",
          message: `❌ Export failed: ${result.message}`,
          duration: 4000,
        })
      );
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const result = await importFromJSON(file);

    if (result.success) {
      dispatch(loadWorkflow(result.workflow));
      dispatch(
        addNotification({
          type: "success",
          message: "📥 Workflow imported successfully",
          duration: 3000,
        })
      );
    } else {
      dispatch(
        addNotification({
          type: "error",
          message: `❌ Import failed: ${result.message}`,
          duration: 4000,
        })
      );
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCopyToClipboard = async () => {
    const result = await copyToClipboard(workflowState);

    if (result.success) {
      dispatch(
        addNotification({
          type: "success",
          message: "📋 Copied to clipboard",
          duration: 2000,
        })
      );
    } else {
      dispatch(
        addNotification({
          type: "error",
          message: `❌ Copy failed: ${result.message}`,
          duration: 4000,
        })
      );
    }
  };

  const handleShowStats = () => {
    const stats = getWorkflowStats(workflowState);
    console.log("📊 Workflow Statistics:", stats);

    dispatch(
      addNotification({
        type: "info",
        message: `Nodes: ${stats.totalNodes} | Connections: ${stats.totalConnections}`,
        duration: 3000,
      })
    );
  };

  const handleValidate = () => {
    const validation = validateWorkflow(workflowState);
    console.log("🔍 Workflow Validation:", validation);

    if (validation.valid) {
      dispatch(
        addNotification({
          type: "success",
          message: "✅ Workflow is valid",
          duration: 2000,
        })
      );
    } else {
      dispatch(
        addNotification({
          type: "warning",
          message: `⚠️ ${validation.message}`,
          duration: 4000,
        })
      );
    }
  };

  const handleClear = () => {
    if (window.confirm("Clear all saved data? This cannot be undone.")) {
      clearLocalStorage();
      dispatch(resetWorkflow());
      dispatch(
        addNotification({
          type: "info",
          message: "Workflow cleared",
          duration: 2000,
        })
      );
    }
  };

  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 p-4 bg-white rounded-lg shadow-lg border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">
        Workflow Controls
      </h3>

      <div className="flex flex-col gap-2">
        {/* Manual Save */}
        <button
          onClick={handleManualSave}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium"
          title="Save workflow to localStorage (logs to console)"
        >
          💾 Save
        </button>

        {/* Export */}
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm font-medium"
          title="Export workflow as JSON file"
        >
          📤 Export JSON
        </button>

        {/* Import */}
        <label className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-sm font-medium cursor-pointer text-center">
          📥 Import JSON
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </label>

        {/* Copy to Clipboard */}
        <button
          onClick={handleCopyToClipboard}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors text-sm font-medium"
          title="Copy workflow JSON to clipboard"
        >
          📋 Copy JSON
        </button>

        <div className="border-t border-gray-300 my-1"></div>

        {/* Stats */}
        <button
          onClick={handleShowStats}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm font-medium"
          title="Show workflow statistics in console"
        >
          📊 Stats
        </button>

        {/* Validate */}
        <button
          onClick={handleValidate}
          className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors text-sm font-medium"
          title="Validate workflow integrity"
        >
          🔍 Validate
        </button>

        {/* Clear */}
        <button
          onClick={handleClear}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm font-medium"
          title="Clear all data"
        >
          🗑️ Clear
        </button>
      </div>
    </div>
  );
};

export default SaveControls;
