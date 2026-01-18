import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectZoom } from "../store/selectors";
import { updateZoom } from "../store/workflowSlice";

/**
 * ZoomControls Component
 *
 * Provides UI controls for zooming in/out and resetting zoom
 * - Zoom in/out buttons
 * - Reset to 100% button
 * - Current zoom percentage display
 */
const ZoomControls = () => {
  const dispatch = useDispatch();
  const zoom = useSelector(selectZoom);

  const handleZoomIn = () => {
    const newZoom = Math.min(2, zoom + 0.1);
    dispatch(updateZoom(newZoom));
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(0.1, zoom - 0.1);
    dispatch(updateZoom(newZoom));
  };

  const handleZoomReset = () => {
    dispatch(updateZoom(1));
  };

  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-2 transition-all hover:shadow-xl">
      {/* Zoom In */}
      <button
        onClick={handleZoomIn}
        disabled={zoom >= 2}
        className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 font-bold text-lg"
        title="Zoom In (Ctrl + Scroll Up)"
      >
        +
      </button>

      {/* Current Zoom */}
      <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg text-xs font-bold text-gray-700 border border-gray-200">
        {(zoom * 100).toFixed(0)}%
      </div>

      {/* Zoom Out */}
      <button
        onClick={handleZoomOut}
        disabled={zoom <= 0.1}
        className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 font-bold text-lg"
        title="Zoom Out (Ctrl + Scroll Down)"
      >
        −
      </button>

      {/* Divider */}
      <div className="border-t border-gray-300 my-1"></div>

      {/* Reset Zoom */}
      <button
        onClick={handleZoomReset}
        disabled={zoom === 1}
        className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 text-xs font-bold"
        title="Reset Zoom to 100%"
      >
        1:1
      </button>
    </div>
  );
};

export default ZoomControls;
