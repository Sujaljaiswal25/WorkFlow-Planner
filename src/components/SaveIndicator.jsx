import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectWorkflowState } from "../store/selectors";
import { onNextSave } from "../store/localStorageMiddleware";

const SaveIndicator = () => {
  const [saveStatus, setSaveStatus] = useState("idle"); // 'idle' | 'saving' | 'saved' | 'error'
  const [lastSaved, setLastSaved] = useState(null);
  const [storageInfo, setStorageInfo] = useState({ used: 0, quota: 0 });
  const workflowState = useSelector(selectWorkflowState);

  // Check storage quota
  useEffect(() => {
    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then((estimate) => {
        setStorageInfo({
          used: estimate.usage || 0,
          quota: estimate.quota || 0,
        });
      });
    }
  }, [saveStatus]);

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
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
          icon: "⏳",
        };
      case "saved":
        return {
          text: "Saved",
          color: "text-green-600",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          icon: "✓",
        };
      case "error":
        return {
          text: "Save failed",
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          icon: "✗",
        };
      default:
        return null;
    }
  };

  const status = getStatusDisplay();
  const usagePercent =
    storageInfo.quota > 0 ? (storageInfo.used / storageInfo.quota) * 100 : 0;
  const isQuotaNearFull = usagePercent > 80;

  if (!status) return null;

  return (
    <div
      className={`fixed top-4 right-4 flex flex-col gap-2 px-4 py-3 ${status.bgColor} rounded-xl shadow-lg border-2 ${status.borderColor} transition-all duration-300 backdrop-blur-sm min-w-[200px]`}
    >
      {/* Save Status */}
      <div className="flex items-center gap-2">
        <span className="text-lg">{status.icon}</span>
        <span className={`font-semibold ${status.color}`}>{status.text}</span>
        {lastSaved && saveStatus === "saved" && (
          <span className="text-xs text-gray-500 ml-auto">
            {new Date(lastSaved).toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Storage Info */}
      {storageInfo.quota > 0 && (
        <div className="border-t border-gray-200 pt-2">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span className="font-medium">Storage</span>
            <span
              className={isQuotaNearFull ? "text-orange-600 font-bold" : ""}
            >
              {usagePercent.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                isQuotaNearFull
                  ? "bg-gradient-to-r from-orange-500 to-red-500"
                  : "bg-gradient-to-r from-blue-500 to-green-500"
              }`}
              style={{ width: `${Math.min(100, usagePercent)}%` }}
            ></div>
          </div>
          {isQuotaNearFull && (
            <div className="text-xs text-orange-600 mt-1 font-medium">
              ⚠️ Storage nearly full
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SaveIndicator;
