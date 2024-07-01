import { useCallback } from "react";
import ReactFlow, {
  addEdge,
  Node,
  Edge,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
  Background,
  Controls,
} from "reactflow";
import useUndoable from "use-undoable";

import "reactflow/dist/style.css";

const initialNodes: Node[] = [
  { id: "1", data: { label: "Node 1" }, position: { x: 5, y: 5 } },
  { id: "2", data: { label: "Node 2" }, position: { x: 5, y: 100 } },
];

function App() {
  const [elements, setElements, { undo, canUndo, redo, canRedo }] = useUndoable(
    { nodes: initialNodes as Node[], edges: [] as Edge[] },
    {
      behavior: "destroyFuture",
    }
  );

  const triggerUpdate = useCallback(
    (t: any, v: any, ignore = false) => {
      setElements(
        (e) => ({
          nodes: t === "nodes" ? v : e.nodes,
          edges: t === "edges" ? v : e.edges,
        }),
        "destroyFuture",
        ignore
      );
    },
    [setElements]
  );

  const onConnect: OnConnect = useCallback(
    (connection) => {
      setElements((e: any) => ({
        ...e,
        edges: addEdge(
          {
            ...connection,
          },
          elements.edges
        ),
      }));
    },
    [triggerUpdate, elements, setElements]
  );

  const onNodesChange = useCallback(
    (changes: any) => {
      let ignore = ["dimensions", "position"].includes(changes[0].type);

      if (!changes[0].dragging && changes[0].type === "position") {
        ignore = false;
      }
      
      triggerUpdate("nodes", applyNodeChanges(changes, elements.nodes), ignore);
    },
    [triggerUpdate, elements.nodes]
  );

  const onEdgesChange = useCallback(
    (changes: any) => {
      let ignore = ["select"].includes(changes[0].type);
      triggerUpdate("edges", applyEdgeChanges(changes, elements.edges), ignore);
    },
    [triggerUpdate, elements.edges]
  );

  const handleKeyPress = (event: any) => {
    //ctrl+z || ctrl+Z
    if (canUndo && event.ctrlKey && event.keyCode === 90) {
      undo();
    } //ctrl+y || ctrl+Y
    else if (canRedo && event.ctrlKey && event.keyCode === 89) {
      redo();
    }
  };

  return (
    <div style={{ height: "90vh" }}>
      <ReactFlow
        nodes={elements.nodes}
        edges={elements.edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onKeyDown={(e) => handleKeyPress(e)}
        tabIndex={0}
        fitView
      >
        <Background />
        <Controls style={{ display: "flex", flexDirection: "column" }}>
          <button disabled={!canUndo} onClick={() => undo()}>
            U
          </button>
          <button disabled={!canRedo} onClick={() => redo()}>
            R
          </button>
        </Controls>
      </ReactFlow>
    </div>
  );
}

export default App;
