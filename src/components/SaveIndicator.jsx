import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectWorkflowState } from "../store/selectors";
import { onNextSave } from "../store/localStorageMiddleware";

const SaveIndicator = () => {
  const [saveStatus, setSaveStatus] = useState("idle"); // 'idle' | 'saving' | 'saved' | 'error'
  const [lastSaved, setLastSaved] = useState(null);
  const workflowState = useSelector(selectWorkflowState);

  useEffect(() => {
    // Set status to saving when state changes
    setSaveStatus("saving");

    // Register callback for when save completes
    onNextSave((result) => {
      if (result.success) {
        setSaveStatus("saved");
        setLastSaved(result.timestamp);

        // Reset to idle after 2 seconds
        setTimeout(() => {
          setSaveStatus("idle");
        }, 2000);
      } else {
        setSaveStatus("error");
        setTimeout(() => {
          setSaveStatus("idle");
        }, 3000);
      }
    });
  }, [workflowState]);

  const getStatusDisplay = () => {
    switch (saveStatus) {
      case "saving":
        return {
          text: "Saving...",
          color: "text-yellow-600",
          icon: "⏳",
        };
      case "saved":
        return {
          text: "Saved",
          color: "text-green-600",
          icon: "✓",
        };
      case "error":
        return {
          text: "Save failed",
          color: "text-red-600",
          icon: "✗",
        };
      default:
        return null;
    }
  };

  const status = getStatusDisplay();

  if (!status) return null;

  return (
    <div
      className={`fixed top-4 right-4 flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md border ${status.color} transition-all duration-300`}
    >
      <span className="text-lg">{status.icon}</span>
      <span className="font-medium">{status.text}</span>
      {lastSaved && saveStatus === "saved" && (
        <span className="text-xs text-gray-500 ml-2">
          {new Date(lastSaved).toLocaleTimeString()}
        </span>
      )}
    </div>
  );
};

export default SaveIndicator;
