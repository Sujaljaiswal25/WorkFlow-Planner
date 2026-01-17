import React, { useState } from "react";
import { useDispatch } from "react-redux";

/**
 * Line Type Selector Component
 * Allows users to switch between different line rendering styles
 */
const LineTypeSelector = ({ currentType, onChange }) => {
  const lineTypes = [
    { value: "smart-bezier", label: "Smart Bezier", icon: "〜" },
    { value: "bezier", label: "Bezier", icon: "∿" },
    { value: "straight", label: "Straight", icon: "━" },
    { value: "step", label: "Step", icon: "┘" },
  ];

  return (
    <div className="absolute top-20 left-4 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-10">
      <h3 className="text-xs font-semibold text-gray-700 mb-2">
        Connection Style
      </h3>
      <div className="flex flex-col gap-1">
        {lineTypes.map((type) => (
          <button
            key={type.value}
            onClick={() => onChange(type.value)}
            className={`
              px-3 py-1.5 rounded text-xs font-medium transition-colors text-left flex items-center gap-2
              ${
                currentType === type.value
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }
            `}
          >
            <span className="text-base">{type.icon}</span>
            <span>{type.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
        <div className="space-y-1">
          <div>
            <strong>Smart Bezier:</strong> Adaptive curves
          </div>
          <div>
            <strong>Bezier:</strong> Smooth S-curves
          </div>
          <div>
            <strong>Straight:</strong> Direct lines
          </div>
          <div>
            <strong>Step:</strong> Right angles
          </div>
        </div>
      </div>
    </div>
  );
};

export default LineTypeSelector;
