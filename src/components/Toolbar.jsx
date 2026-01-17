import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addNode, resetView } from '../store/workflowSlice';
import { selectNodesArray, selectWorkflowStats } from '../store/selectors';

const Toolbar = () => {
  const dispatch = useDispatch();
  const nodes = useSelector(selectNodesArray);
  const stats = useSelector(selectWorkflowStats);

  const handleAddNode = (type) => {
    // Find the last node for positioning
    const lastNode = nodes[nodes.length - 1];
    const baseY = lastNode ? lastNode.position.y + 120 : 150;
    
    // Get the start node as default parent
    const startNode = nodes.find(n => n.id === 'start-node');
    
    dispatch(addNode({
      type,
      label: type === 'action' ? 'New Action' : type === 'branch' ? 'Decision?' : 'End',
      position: { 
        x: 400 + Math.random() * 100,
        y: baseY + Math.random() * 50
      },
      parentNodeId: startNode?.id
    }));
  };

  const handleResetView = () => {
    dispatch(resetView());
  };

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-xl border border-gray-200 flex items-center gap-4 px-6 py-3 z-10">
      <div className="flex items-center gap-2 border-r border-gray-300 pr-4">
        <span className="text-sm font-semibold text-gray-700">Add Node:</span>
        
        <button
          onClick={() => handleAddNode('action')}
          className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-medium transition-colors flex items-center gap-1"
          title="Add Action Node"
        >
          <span>⚡</span>
          <span>Action</span>
        </button>

        <button
          onClick={() => handleAddNode('branch')}
          className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded text-sm font-medium transition-colors flex items-center gap-1"
          title="Add Branch Node"
        >
          <span>◆</span>
          <span>Branch</span>
        </button>

        <button
          onClick={() => handleAddNode('end')}
          className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded text-sm font-medium transition-colors flex items-center gap-1"
          title="Add End Node"
        >
          <span>🏁</span>
          <span>End</span>
        </button>
      </div>

      <div className="flex items-center gap-2 border-r border-gray-300 pr-4">
        <button
          onClick={handleResetView}
          className="px-3 py-1.5 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm font-medium transition-colors"
          title="Reset pan and zoom"
        >
          Reset View
        </button>
      </div>

      <div className="flex items-center gap-3 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span>{stats.actionNodes} Actions</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
          <span>{stats.branchNodes} Branches</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <span>{stats.endNodes} Ends</span>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
