import React from "react";
import { useSelector } from "react-redux";
import { selectNodeById } from "../../store/selectors";
import BaseNode from "./BaseNode";

/**
 * BranchNode Component
 *
 * Represents a decision/branching point in the workflow
 * - Has one input connection point
 * - Has multiple output connection points (for different branches)
 * - Yellow color scheme to indicate decision point
 * - Diamond-shaped visual distinction
 */
const BranchNode = ({ nodeId, offset, zoom }) => {
  const node = useSelector((state) => selectNodeById(nodeId)(state));

  if (!node) return null;

  // Branch nodes can have multiple outputs
  const outputPoints =
    node.connections?.map((connId, index) => ({
      id: connId,
      label: node.branchLabels?.[connId] || `Option ${index + 1}`,
    })) || [];

  return (
    <BaseNode
      nodeId={nodeId}
      offset={offset}
      zoom={zoom}
      color="yellow"
      className="rotate-0"
      connectionPoints={{
        input: true,
        output: false,
        outputs:
          outputPoints.length > 0
            ? outputPoints
            : [{ label: "Yes" }, { label: "No" }],
      }}
    >
      <div className="flex flex-col items-center justify-center w-full">
        <div className="text-2xl mb-1">◆</div>
        <div className="text-sm font-medium text-center break-words w-full">
          {node.label}
        </div>
        {outputPoints.length > 0 && (
          <div className="text-xs mt-1 opacity-80">
            {outputPoints.length} branches
          </div>
        )}
      </div>
    </BaseNode>
  );
};

export default BranchNode;
