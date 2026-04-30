"use client";

import "@xyflow/react/dist/style.css";

import { Background, Controls, MiniMap, ReactFlow } from "@xyflow/react";
import type { Edge, Node } from "@xyflow/react";

const nodes: Node[] = [
  {
    id: "incident",
    position: { x: 220, y: 24 },
    data: { label: "Nov 3 outage" },
    style: {
      width: 180,
      borderRadius: 24,
      border: "1px solid rgba(17, 24, 39, 0.14)",
      background: "#fff7ed",
      color: "#7c2d12",
      padding: 18,
      fontWeight: 600,
    },
  },
  {
    id: "customer",
    position: { x: 26, y: 194 },
    data: { label: "TeraCorp refund request" },
    style: {
      width: 220,
      borderRadius: 24,
      border: "1px solid rgba(17, 24, 39, 0.14)",
      background: "#f5f3ff",
      color: "#4c1d95",
      padding: 18,
      fontWeight: 600,
    },
  },
  {
    id: "policy",
    position: { x: 280, y: 248 },
    data: { label: "Refund policy" },
    style: {
      width: 160,
      borderRadius: 24,
      border: "1px solid rgba(17, 24, 39, 0.14)",
      background: "#ecfeff",
      color: "#155e75",
      padding: 18,
      fontWeight: 600,
    },
  },
  {
    id: "skill",
    position: { x: 508, y: 192 },
    data: { label: "Enterprise refund handling.skill" },
    style: {
      width: 250,
      borderRadius: 24,
      border: "1px solid rgba(17, 24, 39, 0.14)",
      background: "#f0fdf4",
      color: "#166534",
      padding: 18,
      fontWeight: 600,
    },
  },
];

const edges: Edge[] = [
  {
    id: "incident-customer",
    source: "incident",
    target: "customer",
    label: "caused",
    animated: true,
  },
  {
    id: "customer-policy",
    source: "customer",
    target: "policy",
    label: "checks",
  },
  {
    id: "policy-skill",
    source: "policy",
    target: "skill",
    label: "compiles into",
  },
  {
    id: "incident-skill",
    source: "incident",
    target: "skill",
    label: "cited in",
  },
];

export function GraphPreview() {
  return (
    <div className="h-[420px] overflow-hidden rounded-[2rem] border border-black/10 bg-white/90 shadow-[0_28px_90px_-40px_rgba(17,24,39,0.55)]">
      <ReactFlow
        fitView
        nodes={nodes}
        edges={edges}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        zoomOnDoubleClick={false}
        panOnDrag={false}
      >
        <MiniMap
          pannable
          zoomable
          style={{
            background: "rgba(255,255,255,0.92)",
            border: "1px solid rgba(17, 24, 39, 0.1)",
          }}
        />
        <Controls showInteractive={false} />
        <Background color="rgba(17, 24, 39, 0.08)" gap={22} />
      </ReactFlow>
    </div>
  );
}
