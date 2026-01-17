import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addNode, updateNodeLabel } from "../store/workflowSlice";
import { selectNodesArray, selectConnections } from "../store/selectors";

const WorkflowDebug = () => {
  const dispatch = useDispatch();
  const nodes = useSelector(selectNodesArray);
  const connections = useSelector(selectConnections);

  const handleAddTestNode = () => {
    dispatch(
      addNode({
        type: "action",
        label: "Test Node",
        position: { x: 500, y: 200 },
        parentNodeId: "start-node",
      })
    );
  };

  const handleAddBranchNode = () => {
    dispatch(
      addNode({
        type: "branch",
        label: "Decision Point",
        position: { x: 600, y: 300 },
        parentNodeId: "start-node",
      })
    );
  };

  const handleAddEndNode = () => {
    dispatch(
      addNode({
        type: "end",
        label: "End",
        position: { x: 700, y: 400 },
        parentNodeId: "start-node",
      })
    );
  };

  return (
    <div className="p-8 bg-white rounded-lg shadow-md max-w-4xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Workflow Debug Panel</h2>

      <div className="mb-6 space-x-2">
        <button
          onClick={handleAddTestNode}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add Action Node
        </button>
        <button
          onClick={handleAddBranchNode}
          className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
        >
          Add Branch Node
        </button>
        <button
          onClick={handleAddEndNode}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Add End Node
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Nodes ({nodes.length})</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {nodes.map((node) => (
              <div
                key={node.id}
                className="p-3 bg-gray-50 rounded border border-gray-200"
              >
                <div className="font-medium text-sm">{node.label}</div>
                <div className="text-xs text-gray-600">
                  Type: {node.type} | ID: {node.id.substring(0, 8)}...
                </div>
                <div className="text-xs text-gray-500">
                  Position: ({node.position.x}, {node.position.y})
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">
            Connections ({connections.length})
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {connections.map((conn) => (
              <div
                key={conn.id}
                className="p-3 bg-gray-50 rounded border border-gray-200"
              >
                <div className="text-xs font-mono">
                  {conn.fromNodeId.substring(0, 8)}... →{" "}
                  {conn.toNodeId.substring(0, 8)}...
                </div>
                {conn.branchLabel && (
                  <div className="text-xs text-blue-600 mt-1">
                    Branch: {conn.branchLabel}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowDebug;
