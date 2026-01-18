import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addNode, resetView, undo, redo } from "../store/workflowSlice";
import { selectNodesArray, selectWorkflowStats } from "../store/selectors";

const Toolbar = () => {
  const dispatch = useDispatch();
  const nodes = useSelector(selectNodesArray);
  const stats = useSelector(selectWorkflowStats);
  const historyPast = useSelector((state) => state.workflow.history.past);
  const historyFuture = useSelector((state) => state.workflow.history.future);

  const canUndo = historyPast.length > 0;
  const canRedo = historyFuture.length > 0;

  const handleAddNode = (type) => {
    // Find the last node for positioning
    const lastNode = nodes[nodes.length - 1];
    const baseY = lastNode ? lastNode.position.y + 120 : 150;

    // Get the start node as default parent
    const startNode = nodes.find((n) => n.id === "start-node");

    dispatch(
      addNode({
        type,
        label:
          type === "action"
            ? "New Action"
            : type === "branch"
              ? "Decision?"
              : "End",
        position: {
          x: 400 + Math.random() * 100,
          y: baseY + Math.random() * 50,
        },
        parentNodeId: startNode?.id,
      }),
    );
  };

  const handleResetView = () => {
    dispatch(resetView());
  };

  const handleUndo = () => {
    if (canUndo) {
      dispatch(undo());
    }
  };

  const handleRedo = () => {
    if (canRedo) {
      dispatch(redo());
    }
  };

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+Z or Cmd+Z for undo
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      // Ctrl+Shift+Z or Cmd+Shift+Z for redo
      else if ((e.ctrlKey || e.metaKey) && e.key === "z" && e.shiftKey) {
        e.preventDefault();
        handleRedo();
      }
      // Ctrl+Y or Cmd+Y for redo (alternative)
      else if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canUndo, canRedo]);

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border-2 border-gray-200 flex items-center gap-4 px-6 py-3 z-10 transition-all hover:shadow-3xl">
      <div className="flex items-center gap-2 border-r-2 border-gray-300 pr-4">
        <span className="text-sm font-bold text-gray-700 flex items-center gap-1">
          <span className="text-lg">➕</span> Add Node:
        </span>

        <button
          onClick={() => handleAddNode("action")}
          className="px-4 py-2 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg hover:scale-105 border border-blue-700"
          title="Add Action Node"
        >
          <span className="text-lg">⚡</span>
          <span>Action</span>
        </button>

        <button
          onClick={() => handleAddNode("branch")}
          className="px-4 py-2 bg-gradient-to-br from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg hover:scale-105 border border-yellow-700"
          title="Add Branch Node"
        >
          <span className="text-lg">◆</span>
          <span>Branch</span>
        </button>

        <button
          onClick={() => handleAddNode("end")}
          className="px-4 py-2 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg hover:scale-105 border border-red-700"
          title="Add End Node"
        >
          <span className="text-lg">🏁</span>
          <span>End</span>
        </button>
      </div>

      <div className="flex items-center gap-2 border-r-2 border-gray-300 pr-4">
        <button
          onClick={handleUndo}
          disabled={!canUndo}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 shadow-md border ${
            canUndo
              ? "bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-purple-700 hover:shadow-lg hover:scale-105"
              : "bg-gray-200 text-gray-400 cursor-not-allowed border-gray-300 opacity-50"
          }`}
          title={`Undo (Ctrl+Z)${canUndo ? ` - ${historyPast.length} action(s)` : ""}`}
        >
          <span className="text-lg">↶</span>
          <span>Undo</span>
        </button>

        <button
          onClick={handleRedo}
          disabled={!canRedo}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 shadow-md border ${
            canRedo
              ? "bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-purple-700 hover:shadow-lg hover:scale-105"
              : "bg-gray-200 text-gray-400 cursor-not-allowed border-gray-300 opacity-50"
          }`}
          title={`Redo (Ctrl+Shift+Z)${canRedo ? ` - ${historyFuture.length} action(s)` : ""}`}
        >
          <span className="text-lg">↷</span>
          <span>Redo</span>
        </button>
      </div>

      <div className="flex items-center gap-2 border-r-2 border-gray-300 pr-4">
        <button
          onClick={handleResetView}
          className="px-4 py-2 bg-gradient-to-br from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-lg text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 border border-gray-700"
          title="Reset pan and zoom"
        >
          🔄 Reset View
        </button>
      </div>

      <div className="flex items-center gap-3 text-xs font-semibold text-gray-600">
        <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 rounded-md border border-blue-200">
          <div className="w-2.5 h-2.5 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full shadow"></div>
          <span>{stats.actionNodes} Actions</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-yellow-50 rounded-md border border-yellow-200">
          <div className="w-2.5 h-2.5 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full shadow"></div>
          <span>{stats.branchNodes} Branches</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-red-50 rounded-md border border-red-200">
          <div className="w-2.5 h-2.5 bg-gradient-to-br from-red-400 to-red-600 rounded-full shadow"></div>
          <span>{stats.endNodes} Ends</span>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
