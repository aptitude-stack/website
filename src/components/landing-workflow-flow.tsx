"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
  type ReactFlowInstance,
} from "@xyflow/react";

type WorkflowNodeData = {
  index: string;
  title: string;
  detail: string;
  icon: "author" | "review" | "publish" | "resolve" | "install" | "improve";
};

type WorkflowNode = Node<WorkflowNodeData, "workflow">;

const nodes: WorkflowNode[] = [
  {
    id: "author",
    type: "workflow",
    position: { x: 0, y: 190 },
    data: {
      index: "01",
      title: "Author",
      detail: "Capture team practice",
      icon: "author",
    },
  },
  {
    id: "review",
    type: "workflow",
    position: { x: 180, y: 0 },
    data: {
      index: "02",
      title: "Review",
      detail: "Evaluate trust and quality",
      icon: "review",
    },
  },
  {
    id: "publish",
    type: "workflow",
    position: { x: 360, y: 190 },
    data: {
      index: "03",
      title: "Publish",
      detail: "Ship a versioned skill",
      icon: "publish",
    },
  },
  {
    id: "resolve",
    type: "workflow",
    position: { x: 540, y: 0 },
    data: {
      index: "04",
      title: "Discover",
      detail: "Find the best match",
      icon: "resolve",
    },
  },
  {
    id: "install",
    type: "workflow",
    position: { x: 720, y: 190 },
    data: {
      index: "05",
      title: "Resolve",
      detail: "Select the best skill",
      icon: "resolve",
    },
  },
  {
    id: "improve",
    type: "workflow",
    position: { x: 900, y: 0 },
    data: {
      index: "06",
      title: "Install",
      detail: "Install into the agent",
      icon: "install",
    },
  },
];

const edges: Edge[] = [
  ["author", "review"],
  ["review", "publish"],
  ["publish", "resolve"],
  ["resolve", "install"],
  ["install", "improve"],
].map(([source, target], index) => ({
  id: `${source}-${target}`,
  source,
  target,
  sourceHandle: "out",
  targetHandle: "in",
  animated: false,
  type: "smoothstep",
  pathOptions: {
    borderRadius: 0,
    offset: 26,
  },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: "rgba(164, 6, 188, 0.42)",
    width: 16,
    height: 16,
  },
  className: `landing-workflow-edge landing-workflow-edge--${index + 1}`,
}));

function WorkflowIcon({ icon }: { icon: WorkflowNodeData["icon"] }) {
  const paths = {
    author: (
      <>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </>
    ),
    review: (
      <path d="M20 6 9 17l-5-5" />
    ),
    publish: (
      <>
        <path d="M12 3v12" />
        <path d="m7 8 5-5 5 5" />
        <path d="M5 21h14" />
      </>
    ),
    resolve: (
      <>
        <circle cx="11" cy="11" r="6" />
        <path d="m16 16 4 4" />
      </>
    ),
    install: (
      <>
        <path d="M12 3v12" />
        <path d="m7 10 5 5 5-5" />
        <path d="M5 21h14" />
      </>
    ),
    improve: (
      <>
        <path d="M3 12a9 9 0 0 1 15.6-6" />
        <path d="M18 3v5h-5" />
        <path d="M21 12a9 9 0 0 1-15.6 6" />
        <path d="M6 21v-5h5" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      className="landing-workflow-node__icon-svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      {paths[icon]}
    </svg>
  );
}

function WorkflowStepNode({ data }: NodeProps<WorkflowNode>) {
  return (
    <article className="landing-workflow-node">
      <Handle
        id="in"
        className="landing-workflow-handle"
        type="target"
        position={Position.Left}
        isConnectable={false}
      />
      <span className="landing-workflow-node__icon" aria-hidden="true">
        <WorkflowIcon icon={data.icon} />
      </span>
      <span className="landing-workflow-node__index">{data.index}</span>
      <strong>{data.title}</strong>
      <em>{data.detail}</em>
      <Handle
        id="out"
        className="landing-workflow-handle"
        type="source"
        position={Position.Right}
        isConnectable={false}
      />
    </article>
  );
}

const nodeTypes = {
  workflow: WorkflowStepNode,
};

const MIN_WORKFLOW_WIDTH = 760;

function useCanRenderWorkflow() {
  const [canRender, setCanRender] = useState(false);

  useEffect(() => {
    const sync = () => setCanRender(window.innerWidth >= MIN_WORKFLOW_WIDTH);

    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  return canRender;
}

export function LandingWorkflowFlow() {
  const canRender = useCanRenderWorkflow();
  const instanceRef = useRef<ReactFlowInstance<WorkflowNode, Edge> | null>(null);
  const fitOptions = useMemo(() => ({ padding: 0.04 }), []);

  useEffect(() => {
    if (!canRender || !instanceRef.current) {
      return;
    }

    const fit = () => {
      instanceRef.current?.fitView(fitOptions);
    };
    const rafId = window.requestAnimationFrame(fit);
    window.addEventListener("resize", fit);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", fit);
    };
  }, [canRender, fitOptions]);

  if (!canRender) {
    return null;
  }

  function handleInit(instance: ReactFlowInstance<WorkflowNode, Edge>) {
    instanceRef.current = instance;
    window.requestAnimationFrame(() => {
      instance.fitView(fitOptions);
    });
  }

  return (
    <div className="landing-workflow-flow" aria-label="Skill lifecycle">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onInit={handleInit}
        fitView
        fitViewOptions={fitOptions}
        minZoom={0.2}
        maxZoom={1.2}
        nodesDraggable={false}
        nodesConnectable={false}
        edgesReconnectable={false}
        elementsSelectable={false}
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        preventScrolling={false}
        proOptions={{ hideAttribution: true }}
      >
        <svg aria-hidden="true" className="landing-workflow-defs">
          <defs>
            <linearGradient id="landing-workflow-edge-gradient" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="rgba(164, 6, 188, 0.22)" />
              <stop offset="100%" stopColor="rgba(164, 6, 188, 0.48)" />
            </linearGradient>
          </defs>
        </svg>
      </ReactFlow>
    </div>
  );
}
