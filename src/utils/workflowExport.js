import {
  saveToLocalStorage,
  loadFromLocalStorage,
  clearLocalStorage,
} from "../store/localStorageMiddleware";

/**
 * Manual save - explicitly save current workflow state
 * @param {Object} state - Workflow state from Redux
 * @returns {Object} Save result
 */
export const manualSave = (state) => {
  console.log("📝 Manual Save Initiated");
  console.log("Current Workflow State:", JSON.stringify(state, null, 2));

  const result = saveToLocalStorage(state);

  if (result.success) {
    console.log("✅ Manual save completed successfully");
    console.log("Saved at:", result.timestamp);
    console.log("Size:", `${(result.size / 1024).toFixed(2)}KB`);
  } else {
    console.error("❌ Manual save failed:", result.message);
  }

  return result;
};

/**
 * Export workflow as JSON file (download)
 * @param {Object} state - Workflow state from Redux
 * @param {string} filename - Optional filename (default: workflow-{timestamp}.json)
 * @returns {Object} Export result
 */
export const exportToJSON = (state, filename) => {
  try {
    const exportData = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      workflow: {
        nodes: state.nodes || {},
        connections: state.connections || [],
        canvasOffset: state.canvasOffset || { x: 0, y: 0 },
        zoom: state.zoom || 1,
      },
    };

    // Log to console as required
    console.log("📤 Exporting Workflow as JSON:");
    console.log(JSON.stringify(exportData, null, 2));

    // Create blob and download
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename || `workflow-${Date.now()}.json`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log("✅ Workflow exported successfully");

    return {
      success: true,
      message: "Workflow exported successfully",
      filename: link.download,
    };
  } catch (error) {
    console.error("❌ Error exporting workflow:", error);
    return {
      success: false,
      error: "export_failed",
      message: error.message || "Failed to export workflow",
    };
  }
};

/**
 * Import workflow from JSON file
 * @param {File} file - JSON file to import
 * @returns {Promise<Object>} Import result with workflow data
 */
export const importFromJSON = (file) => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const importedData = JSON.parse(event.target.result);

          // Validate structure
          if (!importedData.workflow) {
            throw new Error("Invalid workflow file: missing workflow data");
          }

          if (
            !importedData.workflow.nodes ||
            !importedData.workflow.connections
          ) {
            throw new Error(
              "Invalid workflow file: missing nodes or connections"
            );
          }

          console.log("📥 Importing Workflow from JSON:");
          console.log(JSON.stringify(importedData, null, 2));
          console.log("✅ Workflow imported successfully");

          resolve({
            success: true,
            message: "Workflow imported successfully",
            workflow: importedData.workflow,
            metadata: {
              version: importedData.version,
              exportedAt: importedData.exportedAt,
            },
          });
        } catch (parseError) {
          console.error("❌ Error parsing imported file:", parseError);
          resolve({
            success: false,
            error: "parse_error",
            message: "Invalid JSON file or corrupted workflow data",
          });
        }
      };

      reader.onerror = () => {
        console.error("❌ Error reading file");
        resolve({
          success: false,
          error: "read_error",
          message: "Failed to read file",
        });
      };

      reader.readAsText(file);
    } catch (error) {
      console.error("❌ Error importing workflow:", error);
      resolve({
        success: false,
        error: "unknown",
        message: error.message || "Failed to import workflow",
      });
    }
  });
};

/**
 * Copy workflow JSON to clipboard
 * @param {Object} state - Workflow state from Redux
 * @returns {Promise<Object>} Copy result
 */
export const copyToClipboard = async (state) => {
  try {
    const workflowJSON = JSON.stringify(
      {
        version: "1.0",
        exportedAt: new Date().toISOString(),
        workflow: {
          nodes: state.nodes || {},
          connections: state.connections || [],
          canvasOffset: state.canvasOffset || { x: 0, y: 0 },
          zoom: state.zoom || 1,
        },
      },
      null,
      2
    );

    console.log("📋 Copying Workflow to Clipboard:");
    console.log(workflowJSON);

    await navigator.clipboard.writeText(workflowJSON);

    console.log("✅ Workflow copied to clipboard");

    return {
      success: true,
      message: "Workflow copied to clipboard",
    };
  } catch (error) {
    console.error("❌ Error copying to clipboard:", error);
    return {
      success: false,
      error: "copy_failed",
      message: error.message || "Failed to copy to clipboard",
    };
  }
};

/**
 * Get workflow statistics
 * @param {Object} state - Workflow state from Redux
 * @returns {Object} Workflow statistics
 */
export const getWorkflowStats = (state) => {
  const nodes = state.nodes || {};
  const connections = state.connections || [];

  const nodeTypes = Object.values(nodes).reduce((acc, node) => {
    acc[node.type] = (acc[node.type] || 0) + 1;
    return acc;
  }, {});

  return {
    totalNodes: Object.keys(nodes).length,
    nodeTypes,
    totalConnections: connections.length,
    canvasOffset: state.canvasOffset,
    zoom: state.zoom,
  };
};

/**
 * Validate workflow integrity
 * @param {Object} state - Workflow state
 * @returns {Object} Validation result with any issues found
 */
export const validateWorkflow = (state) => {
  const issues = [];
  const nodes = state.nodes || {};
  const connections = state.connections || [];

  // Check for orphaned connections (connections to non-existent nodes)
  connections.forEach((conn) => {
    if (!nodes[conn.fromNodeId]) {
      issues.push({
        type: "orphaned_connection",
        message: `Connection ${conn.id} references non-existent source node ${conn.fromNodeId}`,
      });
    }
    if (!nodes[conn.toNodeId]) {
      issues.push({
        type: "orphaned_connection",
        message: `Connection ${conn.id} references non-existent target node ${conn.toNodeId}`,
      });
    }
  });

  // Check for nodes with invalid positions
  Object.values(nodes).forEach((node) => {
    if (
      !node.position ||
      typeof node.position.x !== "number" ||
      typeof node.position.y !== "number"
    ) {
      issues.push({
        type: "invalid_position",
        message: `Node ${node.id} has invalid position`,
      });
    }
  });

  // Check for circular references (simple check)
  const visited = new Set();
  const checkCircular = (nodeId, path = []) => {
    if (path.includes(nodeId)) {
      issues.push({
        type: "circular_reference",
        message: `Circular reference detected: ${path.join(
          " -> "
        )} -> ${nodeId}`,
      });
      return;
    }

    if (visited.has(nodeId)) return;
    visited.add(nodeId);

    const node = nodes[nodeId];
    if (node && node.connections) {
      node.connections.forEach((childId) => {
        checkCircular(childId, [...path, nodeId]);
      });
    }
  };

  // Start from start node
  if (nodes["start-node"]) {
    checkCircular("start-node");
  }

  return {
    valid: issues.length === 0,
    issues,
    message:
      issues.length === 0
        ? "Workflow is valid"
        : `Found ${issues.length} issue(s)`,
  };
};

// Re-export localStorage utilities
export { saveToLocalStorage, loadFromLocalStorage, clearLocalStorage };
