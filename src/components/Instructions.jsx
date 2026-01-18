import React from "react";

/**
 * Instructions Panel
 * Shows helpful tips for using the workflow builder
 */
const Instructions = () => {
  return (
    <div className="absolute bottom-20 right-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border-2 border-gray-200 p-5 max-w-sm z-10 transition-all hover:shadow-2xl">
      <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
        <span className="text-lg">🎯</span> Quick Guide
      </h3>

      <div className="text-xs text-gray-600 space-y-2.5">
        <div className="flex items-start gap-2">
          <span className="text-blue-500 font-bold">🖱️</span>
          <div>
            <strong>Pan Canvas:</strong> Click and drag on empty space
          </div>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-green-500 font-bold">🔍</span>
          <div>
            <strong>Zoom:</strong> Ctrl + Scroll or use zoom controls
          </div>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-purple-500 font-bold">⏮️</span>
          <div>
            <strong>Undo/Redo:</strong> Ctrl+Z / Ctrl+Shift+Z
          </div>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-orange-500 font-bold">↔️</span>
          <div>
            <strong>Move Node:</strong> Click and drag a node
          </div>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-yellow-500 font-bold">✏️</span>
          <div>
            <strong>Edit Node:</strong> Double-click node, type, press Enter
            <div className="ml-0 text-xs text-gray-500 mt-0.5">
              • Esc to cancel • Max 50 characters
            </div>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-green-500 font-bold">➕</span>
          <div>
            <strong>Add Node:</strong> Click green connection point
          </div>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-red-500 font-bold">🗑️</span>
          <div>
            <strong>Delete Node:</strong> Hover node and click × (or press Del)
          </div>
        </div>
        <div className="pt-2 border-t-2 border-gray-200 mt-3">
          <strong className="flex items-center gap-2 mb-2">
            <span>🎨</span> Node Types:
          </strong>
          <div className="ml-2 mt-1 space-y-1.5">
            <div className="flex items-center gap-2 p-1.5 rounded bg-blue-50 border border-blue-200">
              <div className="w-3 h-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded shadow"></div>
              <span>
                <strong>Action</strong> - Single step
              </span>
            </div>
            <div className="flex items-center gap-2 p-1.5 rounded bg-yellow-50 border border-yellow-200">
              <div className="w-3 h-3 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded shadow"></div>
              <span>
                <strong>Branch</strong> - Decision point
              </span>
            </div>
            <div className="flex items-center gap-2 p-1.5 rounded bg-red-50 border border-red-200">
              <div className="w-3 h-3 bg-gradient-to-br from-red-400 to-red-600 rounded shadow"></div>
              <span>
                <strong>End</strong> - Terminal node
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Instructions;
