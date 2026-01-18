import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import "./index.css";
import App from "./App.jsx";
import store from "./store/store";

// Phase 13: Load test suites
import "./utils/reduxStateTests";
import "./utils/localStorageTests";
import "./utils/undoRedoTests";
import "./utils/integrationTests";
import "./utils/performanceTests";
import "./utils/crossBrowserTests";
import "./utils/masterTestSuite";

// Expose store to window for testing
if (typeof window !== "undefined") {
  window.store = store;
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
);
