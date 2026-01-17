import React from 'react';

/**
 * Instructions Panel
 * Shows helpful tips for using the workflow builder
 */
const Instructions = () => {
  return (
    <div className="absolute bottom-20 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm z-10">
      <h3 className="text-sm font-bold text-gray-800 mb-2">🎯 Quick Guide</h3>
      
      <div className="text-xs text-gray-600 space-y-2">
        <div>
          <strong>Pan Canvas:</strong> Click and drag on empty space
        </div>
        <div>
          <strong>Zoom:</strong> Ctrl + Scroll
        </div>
        <div>
          <strong>Move Node:</strong> Click and drag a node
        </div>
        <div>
          <strong>Edit Node:</strong> Double-click a node
        </div>
        <div>
          <strong>Delete Node:</strong> Select node, click × button
        </div>
        <div className="pt-2 border-t border-gray-200 mt-2">
          <strong>Node Types:</strong>
          <div className="ml-2 mt-1 space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Action - Single step</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span>Branch - Decision point</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>End - Terminal node</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Instructions;
