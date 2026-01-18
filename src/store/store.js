import { configureStore } from "@reduxjs/toolkit";
import workflowReducer from "./workflowSlice";
import uiReducer from "./uiSlice";
import { localStorageMiddleware, loadState } from "./localStorageMiddleware";
import historyMiddleware from "./historyMiddleware";

// Load persisted state from localStorage
const persistedState = loadState();

// Configure the Redux store
const store = configureStore({
  reducer: {
    workflow: workflowReducer,
    ui: uiReducer,
  },

  // Preload state from localStorage if available
  preloadedState: persistedState
    ? {
        workflow: {
          ...persistedState,
          // Reset UI state that shouldn't be persisted
          selectedNodeId: null,
          history: { past: [], future: [] },
        },
      }
    : undefined,

  // Add middleware (history middleware must come before localStorage)
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Disable serializable check for now (we'll ensure our state is serializable)
      serializableCheck: false,
    })
      .concat(historyMiddleware)
      .concat(localStorageMiddleware),

  // Enable Redux DevTools
  devTools: process.env.NODE_ENV !== "production",
});

// Expose store globally for debugging and utilities
if (typeof window !== "undefined") {
  window.store = store;
}

export default store;
