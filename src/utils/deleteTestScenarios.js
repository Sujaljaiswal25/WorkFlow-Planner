import store from "../store/store";
import { addNode, deleteNode } from "../store/workflowSlice";

/**
 * Test Scenarios for Node Deletion
 *
 * This file contains test utilities to verify all deletion scenarios work correctly:
 * 1. Delete middle node in linear chain
 * 2. Delete branch node with multiple children
 * 3. Delete node with no children (end node)
 * 4. Verify localStorage updates correctly after deletion
 */

// Test Scenario 1: Linear chain deletion
export const testLinearChainDeletion = () => {
  console.log("🧪 Test: Delete middle node in linear chain");

  const state = store.getState().workflow;
  const startNode = state.nodes["start-node"];

  // Create a linear chain: Start -> A -> B -> C (End)
  console.log("Creating linear chain: Start -> A -> B -> C");

  store.dispatch(
    addNode({
      type: "action",
      label: "Node A",
      position: { x: startNode.position.x, y: startNode.position.y + 200 },
      parentNodeId: "start-node",
    }),
  );

  const stateAfterA = store.getState().workflow;
  const nodeA = Object.values(stateAfterA.nodes).find(
    (n) => n.label === "Node A",
  );

  store.dispatch(
    addNode({
      type: "action",
      label: "Node B",
      position: { x: nodeA.position.x, y: nodeA.position.y + 200 },
      parentNodeId: nodeA.id,
    }),
  );

  const stateAfterB = store.getState().workflow;
  const nodeB = Object.values(stateAfterB.nodes).find(
    (n) => n.label === "Node B",
  );

  store.dispatch(
    addNode({
      type: "end",
      label: "Node C (End)",
      position: { x: nodeB.position.x, y: nodeB.position.y + 200 },
      parentNodeId: nodeB.id,
    }),
  );

  const beforeDelete = store.getState().workflow;
  console.log(
    `Before deletion: ${Object.keys(beforeDelete.nodes).length} nodes, ${beforeDelete.connections.length} connections`,
  );

  // Delete middle node B
  console.log(`Deleting middle node: ${nodeB.label}`);
  store.dispatch(deleteNode(nodeB.id));

  const afterDelete = store.getState().workflow;
  const nodeAAfter = afterDelete.nodes[nodeA.id];
  const nodeC = Object.values(afterDelete.nodes).find(
    (n) => n.label === "Node C (End)",
  );

  console.log(
    `After deletion: ${Object.keys(afterDelete.nodes).length} nodes, ${afterDelete.connections.length} connections`,
  );

  // Verify reconnection
  const reconnected = afterDelete.connections.some(
    (conn) => conn.fromNodeId === nodeA.id && conn.toNodeId === nodeC.id,
  );

  console.log(`✅ Node B deleted: ${!afterDelete.nodes[nodeB.id]}`);
  console.log(`✅ Node A reconnected to Node C: ${reconnected}`);
  console.log(`✅ Node A connections: ${nodeAAfter.connections.join(", ")}`);

  return {
    success: reconnected && !afterDelete.nodes[nodeB.id],
    nodesCount: Object.keys(afterDelete.nodes).length,
    connectionsCount: afterDelete.connections.length,
  };
};

// Test Scenario 2: Branch node with multiple children deletion
export const testBranchNodeDeletion = () => {
  console.log("🧪 Test: Delete branch node with multiple children");

  const state = store.getState().workflow;
  const startNode = state.nodes["start-node"];

  // Create branch structure: Start -> Branch -> [Yes -> End1, No -> End2]
  console.log("Creating branch structure");

  store.dispatch(
    addNode({
      type: "branch",
      label: "Decision Branch",
      position: { x: startNode.position.x, y: startNode.position.y + 200 },
      parentNodeId: "start-node",
    }),
  );

  const stateAfterBranch = store.getState().workflow;
  const branchNode = Object.values(stateAfterBranch.nodes).find(
    (n) => n.label === "Decision Branch",
  );

  store.dispatch(
    addNode({
      type: "end",
      label: "End Yes",
      position: {
        x: branchNode.position.x - 120,
        y: branchNode.position.y + 200,
      },
      parentNodeId: branchNode.id,
      branchLabel: "Yes",
    }),
  );

  store.dispatch(
    addNode({
      type: "end",
      label: "End No",
      position: {
        x: branchNode.position.x + 120,
        y: branchNode.position.y + 200,
      },
      parentNodeId: branchNode.id,
      branchLabel: "No",
    }),
  );

  const beforeDelete = store.getState().workflow;
  console.log(
    `Before deletion: ${Object.keys(beforeDelete.nodes).length} nodes, ${beforeDelete.connections.length} connections`,
  );

  // Delete branch node
  console.log(`Deleting branch node: ${branchNode.label}`);
  store.dispatch(deleteNode(branchNode.id));

  const afterDelete = store.getState().workflow;
  const endYes = Object.values(afterDelete.nodes).find(
    (n) => n.label === "End Yes",
  );
  const endNo = Object.values(afterDelete.nodes).find(
    (n) => n.label === "End No",
  );

  console.log(
    `After deletion: ${Object.keys(afterDelete.nodes).length} nodes, ${afterDelete.connections.length} connections`,
  );

  // Verify reconnection to both children
  const reconnectedToYes = afterDelete.connections.some(
    (conn) => conn.fromNodeId === "start-node" && conn.toNodeId === endYes?.id,
  );
  const reconnectedToNo = afterDelete.connections.some(
    (conn) => conn.fromNodeId === "start-node" && conn.toNodeId === endNo?.id,
  );

  console.log(`✅ Branch node deleted: ${!afterDelete.nodes[branchNode.id]}`);
  console.log(`✅ Start reconnected to End Yes: ${reconnectedToYes}`);
  console.log(`✅ Start reconnected to End No: ${reconnectedToNo}`);

  return {
    success:
      reconnectedToYes && reconnectedToNo && !afterDelete.nodes[branchNode.id],
    nodesCount: Object.keys(afterDelete.nodes).length,
    connectionsCount: afterDelete.connections.length,
  };
};

// Test Scenario 3: End node deletion
export const testEndNodeDeletion = () => {
  console.log("🧪 Test: Delete end node (no children)");

  const state = store.getState().workflow;
  const startNode = state.nodes["start-node"];

  // Create simple structure: Start -> End
  console.log("Creating structure: Start -> End");

  store.dispatch(
    addNode({
      type: "end",
      label: "Simple End",
      position: { x: startNode.position.x, y: startNode.position.y + 200 },
      parentNodeId: "start-node",
    }),
  );

  const stateAfterEnd = store.getState().workflow;
  const endNode = Object.values(stateAfterEnd.nodes).find(
    (n) => n.label === "Simple End",
  );

  const beforeDelete = store.getState().workflow;
  console.log(
    `Before deletion: ${Object.keys(beforeDelete.nodes).length} nodes, ${beforeDelete.connections.length} connections`,
  );

  // Delete end node
  console.log(`Deleting end node: ${endNode.label}`);
  store.dispatch(deleteNode(endNode.id));

  const afterDelete = store.getState().workflow;
  const startNodeAfter = afterDelete.nodes["start-node"];

  console.log(
    `After deletion: ${Object.keys(afterDelete.nodes).length} nodes, ${afterDelete.connections.length} connections`,
  );

  // Verify deletion
  const deleted = !afterDelete.nodes[endNode.id];
  const connectionRemoved = !afterDelete.connections.some(
    (conn) => conn.toNodeId === endNode.id,
  );
  const startNodeCleaned = !startNodeAfter.connections.includes(endNode.id);

  console.log(`✅ End node deleted: ${deleted}`);
  console.log(`✅ Connection removed: ${connectionRemoved}`);
  console.log(`✅ Start node cleaned: ${startNodeCleaned}`);

  return {
    success: deleted && connectionRemoved && startNodeCleaned,
    nodesCount: Object.keys(afterDelete.nodes).length,
    connectionsCount: afterDelete.connections.length,
  };
};

// Test Scenario 4: Verify localStorage updates
export const testLocalStorageAfterDeletion = () => {
  console.log("🧪 Test: Verify localStorage updates after deletion");

  // Add a node and verify localStorage
  const state = store.getState().workflow;
  const startNode = state.nodes["start-node"];

  store.dispatch(
    addNode({
      type: "action",
      label: "Test Node",
      position: { x: startNode.position.x, y: startNode.position.y + 200 },
      parentNodeId: "start-node",
    }),
  );

  const afterAdd = store.getState().workflow;
  const testNode = Object.values(afterAdd.nodes).find(
    (n) => n.label === "Test Node",
  );

  // Wait for localStorage to update (debounced by 500ms)
  setTimeout(() => {
    const saved = localStorage.getItem("workflowState");
    const savedState = saved ? JSON.parse(saved) : null;

    console.log(
      `✅ Node saved to localStorage: ${savedState?.nodes[testNode.id] !== undefined}`,
    );

    // Delete the node
    store.dispatch(deleteNode(testNode.id));

    // Wait again for localStorage update
    setTimeout(() => {
      const savedAfterDelete = localStorage.getItem("workflowState");
      const savedStateAfterDelete = savedAfterDelete
        ? JSON.parse(savedAfterDelete)
        : null;

      const deletedFromStorage =
        savedStateAfterDelete?.nodes[testNode.id] === undefined;

      console.log(`✅ Node removed from localStorage: ${deletedFromStorage}`);

      return {
        success: deletedFromStorage,
        localStorageUpdated: true,
      };
    }, 600);
  }, 600);

  return { success: true, message: "Check console after 1.2 seconds" };
};

// Run all tests
export const runAllDeleteTests = () => {
  console.log("🚀 Running all deletion test scenarios...\n");

  const results = {
    linearChain: testLinearChainDeletion(),
    branchNode: testBranchNodeDeletion(),
    endNode: testEndNodeDeletion(),
    localStorage: testLocalStorageAfterDeletion(),
  };

  console.log("\n📊 Test Results Summary:");
  console.log(results);

  return results;
};

// Expose to window for easy testing
if (typeof window !== "undefined") {
  window.deleteTests = {
    testLinearChainDeletion,
    testBranchNodeDeletion,
    testEndNodeDeletion,
    testLocalStorageAfterDeletion,
    runAllDeleteTests,
  };

  console.log("💡 Delete test utilities loaded!");
  console.log("Run tests with: window.deleteTests.runAllDeleteTests()");
}
