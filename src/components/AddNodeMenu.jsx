import React, { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectNodeById } from "../store/selectors";
import { addNode } from "../store/workflowSlice";
import { closeAddNodeMenu } from "../store/uiSlice";

const AddNodeMenu = ({
  isOpen,
  position,
  parentNodeId,
  zoom,
  canvasOffset,
}) => {
  const dispatch = useDispatch();
  const menuRef = useRef(null);
  const parentNode = useSelector((state) =>
    parentNodeId ? selectNodeById(parentNodeId)(state) : null,
  );

  // Close menu when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        dispatch(closeAddNodeMenu());
      }
    };

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        dispatch(closeAddNodeMenu());
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, dispatch]);

  if (!isOpen) return null;

  const handleAddNode = (nodeType, branchLabel = null) => {
    if (!parentNode) return;

    // Calculate position below parent node
    const nodeWidth = 144; // w-36 = 144px
    const nodeHeight = 80;
    const verticalSpacing = 120;

    // For branch nodes, offset horizontally based on branch label
    let horizontalOffset = 0;
    if (branchLabel) {
      if (branchLabel === "Yes") {
        horizontalOffset = -120;
      } else if (branchLabel === "No") {
        horizontalOffset = 120;
      }
    }

    const newPosition = {
      x: Math.max(50, parentNode.position.x + horizontalOffset),
      y: parentNode.position.y + nodeHeight + verticalSpacing,
    };

    dispatch(
      addNode({
        type: nodeType,
        label: `New ${nodeType.charAt(0).toUpperCase() + nodeType.slice(1)}`,
        position: newPosition,
        parentNodeId: parentNode.id,
        branchLabel: branchLabel,
      }),
    );

    dispatch(closeAddNodeMenu());
  };

  const nodeTypes = [
    {
      type: "action",
      label: "Action",
      icon: "⚡",
      color: "bg-blue-500 hover:bg-blue-600",
      description: "Sequential task",
    },
    {
      type: "branch",
      label: "Branch",
      icon: "◆",
      color: "bg-yellow-500 hover:bg-yellow-600",
      description: "Decision point",
    },
    {
      type: "end",
      label: "End",
      icon: "🏁",
      color: "bg-red-500 hover:bg-red-600",
      description: "Workflow end",
    },
  ];

  // Check if parent is a branch node
  const isBranchParent = parentNode?.type === "branch";

  return (
    <div
      ref={menuRef}
      className="fixed z-[2000] bg-white rounded-lg shadow-2xl border border-gray-200 p-2 min-w-[200px] animate-fadeIn"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        animation: "fadeIn 0.15s ease-out",
      }}
    >
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>

      <div className="text-xs font-semibold text-gray-500 px-2 py-1 mb-1">
        Add Node {parentNode && `→ ${parentNode.label}`}
      </div>

      {isBranchParent ? (
        // Branch parent: show branch label options
        <div className="space-y-1">
          <div className="text-xs text-gray-400 px-2 py-1">
            Select branch path:
          </div>
          {["Yes", "No"].map((branchLabel) => (
            <div key={branchLabel} className="space-y-1">
              <div className="text-xs font-medium text-gray-600 px-2 py-1 bg-gray-50 rounded">
                {branchLabel}
              </div>
              {nodeTypes.map((nodeType) => (
                <button
                  key={`${branchLabel}-${nodeType.type}`}
                  onClick={() => handleAddNode(nodeType.type, branchLabel)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded transition-colors text-white ${nodeType.color} ml-2`}
                  style={{ width: "calc(100% - 8px)" }}
                >
                  <span className="text-lg">{nodeType.icon}</span>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium">{nodeType.label}</div>
                    <div className="text-xs opacity-80">
                      {nodeType.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ))}
        </div>
      ) : (
        // Regular parent: show node type options
        <div className="space-y-1">
          {nodeTypes.map((nodeType) => (
            <button
              key={nodeType.type}
              onClick={() => handleAddNode(nodeType.type)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded transition-colors text-white ${nodeType.color}`}
            >
              <span className="text-lg">{nodeType.icon}</span>
              <div className="flex-1 text-left">
                <div className="text-sm font-medium">{nodeType.label}</div>
                <div className="text-xs opacity-80">{nodeType.description}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddNodeMenu;
