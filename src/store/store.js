import { configureStore } from "@reduxjs/toolkit";
import workflowReducer from "./workflowSlice";
import { localStorageMiddleware, loadState } from "./localStorageMiddleware";

// Load persisted state from localStorage
const persistedState = loadState();

// Configure the Redux store
const store = configureStore({
  reducer: {
    workflow: workflowReducer,
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

  // Add localStorage middleware
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Disable serializable check for now (we'll ensure our state is serializable)
      serializableCheck: false,
    }).concat(localStorageMiddleware),

  // Enable Redux DevTools
  devTools: process.env.NODE_ENV !== "production",
});

export default store;
