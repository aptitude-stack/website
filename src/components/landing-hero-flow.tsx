"use client";

import {
  Background,
  BackgroundVariant,
  Handle,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import { BrandMarkIcon } from "@/components/icons/brand-mark-icon";

type HeroFlowNodeData = {
  eyebrow: string;
  title: string;
  tone: "mark" | "card";
};

type HeroFlowNode = Node<HeroFlowNodeData, "hero">;

const nodes: HeroFlowNode[] = [
  {
    id: "publish",
    type: "hero",
    position: { x: 0, y: 18 },
    data: {
      eyebrow: "Publish",
      title: "Validated artifacts",
      tone: "card",
    },
    sourcePosition: Position.Right,
  },
  {
    id: "registry",
    type: "hero",
    position: { x: 82, y: 130 },
    data: {
      eyebrow: "Registry",
      title: "Versioned skill graph",
      tone: "mark",
    },
    targetPosition: Position.Left,
    sourcePosition: Position.Right,
  },
  {
    id: "govern",
    type: "hero",
    position: { x: 166, y: 18 },
    data: {
      eyebrow: "Govern",
      title: "Policy + lifecycle",
      tone: "card",
    },
    targetPosition: Position.Left,
  },
  {
    id: "resolve",
    type: "hero",
    position: { x: 166, y: 242 },
    data: {
      eyebrow: "Resolve",
      title: "Lockfile + plan",
      tone: "card",
    },
    targetPosition: Position.Left,
  },
];

const edges: Edge[] = [
  {
    id: "publish-registry",
    source: "publish",
    target: "registry",
    type: "smoothstep",
    animated: true,
    className: "landing-hero-flow__edge",
  },
  {
    id: "registry-govern",
    source: "registry",
    target: "govern",
    type: "smoothstep",
    animated: true,
    className: "landing-hero-flow__edge",
  },
  {
    id: "registry-resolve",
    source: "registry",
    target: "resolve",
    type: "smoothstep",
    animated: true,
    className: "landing-hero-flow__edge",
  },
];

function HeroFlowNode({ data }: NodeProps<HeroFlowNode>) {
  if (data.tone === "mark") {
    return (
      <article className="landing-hero-flow-node landing-hero-flow-node--mark">
        <Handle
          type="target"
          position={Position.Left}
          className="landing-hero-flow-handle"
          isConnectable={false}
        />
        <span className="landing-hero-flow-node__logo" aria-hidden="true">
          <BrandMarkIcon />
        </span>
        <span>{data.eyebrow}</span>
        <strong>{data.title}</strong>
        <Handle
          type="source"
          position={Position.Right}
          className="landing-hero-flow-handle"
          isConnectable={false}
        />
      </article>
    );
  }

  return (
    <article className="landing-hero-flow-node">
      <Handle
        type="target"
        position={Position.Left}
        className="landing-hero-flow-handle"
        isConnectable={false}
      />
      <span>{data.eyebrow}</span>
      <strong>{data.title}</strong>
      <Handle
        type="source"
        position={Position.Right}
        className="landing-hero-flow-handle"
        isConnectable={false}
      />
    </article>
  );
}

const nodeTypes = {
  hero: HeroFlowNode,
};

export function LandingHeroFlow() {
  return (
    <div className="landing-hero-flow" aria-label="Aptitude publish govern resolve diagram">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        colorMode="dark"
        fitView
        fitViewOptions={{ padding: 0.02, minZoom: 0.72, maxZoom: 1.08 }}
        minZoom={0.72}
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
        <Background
          color="rgb(164 6 188 / 0.22)"
          gap={28}
          size={1}
          variant={BackgroundVariant.Dots}
        />
      </ReactFlow>
    </div>
  );
}
