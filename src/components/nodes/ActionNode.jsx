import React from 'react';
import { useSelector } from 'react-redux';
import { selectNodeById } from '../../store/selectors';
import BaseNode from './BaseNode';

/**
 * ActionNode Component
 * 
 * Represents a single action/step in the workflow
 * - Has one input connection point (except start node)
 * - Has one output connection point
 * - Blue color scheme
 */
const ActionNode = ({ nodeId, offset, zoom }) => {
  const node = useSelector(state => selectNodeById(nodeId)(state));

  if (!node) return null;

  return (
    <BaseNode
      nodeId={nodeId}
      offset={offset}
      zoom={zoom}
      color="blue"
      connectionPoints={{
        input: true,
        output: true
      }}
    >
      <div className="flex flex-col items-center justify-center w-full">
        <div className="text-2xl mb-1">⚡</div>
        <div className="text-sm font-medium text-center break-words w-full">
          {node.label}
        </div>
      </div>
    </BaseNode>
  );
};

export default ActionNode;
