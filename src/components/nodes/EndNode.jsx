import React from 'react';
import { useSelector } from 'react-redux';
import { selectNodeById } from '../../store/selectors';
import BaseNode from './BaseNode';

/**
 * EndNode Component
 * 
 * Represents the terminal/final step in the workflow
 * - Has one input connection point
 * - Has NO output connection points (terminal node)
 * - Red color scheme to indicate endpoint
 */
const EndNode = ({ nodeId, offset, zoom }) => {
  const node = useSelector(state => selectNodeById(nodeId)(state));

  if (!node) return null;

  return (
    <BaseNode
      nodeId={nodeId}
      offset={offset}
      zoom={zoom}
      color="red"
      connectionPoints={{
        input: true,
        output: false // End nodes have no output
      }}
    >
      <div className="flex flex-col items-center justify-center w-full">
        <div className="text-2xl mb-1">🏁</div>
        <div className="text-sm font-medium text-center break-words w-full">
          {node.label}
        </div>
      </div>
    </BaseNode>
  );
};

export default EndNode;
