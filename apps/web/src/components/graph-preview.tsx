"use client";

import "@xyflow/react/dist/style.css";

import { Background, Controls, MiniMap, ReactFlow } from "@xyflow/react";
import type { Edge, Node } from "@xyflow/react";

const nodes: Node[] = [
  {
    id: "refund-request",
    position: { x: 36, y: 202 },
    data: { label: "TeraCorp refund request" },
    style: {
      width: 220,
      borderRadius: 24,
      border: "1px solid rgba(255,255,255,0.12)",
      background: "rgba(255,255,255,0.06)",
      color: "white",
      padding: 18,
      fontWeight: 500,
    },
  },
  {
    id: "outage",
    position: { x: 240, y: 36 },
    data: { label: "Nov 3 outage" },
    style: {
      width: 170,
      borderRadius: 24,
      border: "1px solid rgba(255,255,255,0.12)",
      background: "rgba(255,255,255,0.05)",
      color: "white",
      padding: 18,
      fontWeight: 500,
    },
  },
  {
    id: "policy",
    position: { x: 296, y: 282 },
    data: { label: "Refund policy" },
    style: {
      width: 170,
      borderRadius: 24,
      border: "1px solid rgba(255,255,255,0.12)",
      background: "rgba(255,255,255,0.05)",
      color: "white",
      padding: 18,
      fontWeight: 500,
    },
  },
  {
    id: "skill",
    position: { x: 520, y: 188 },
    data: { label: "Enterprise refund handling" },
    style: {
      width: 244,
      borderRadius: 24,
      border: "1px solid rgba(255,255,255,0.12)",
      background: "rgba(255,255,255,0.08)",
      color: "white",
      padding: 18,
      fontWeight: 500,
    },
  },
];

const edges: Edge[] = [
  { id: "a", source: "outage", target: "refund-request", label: "caused", animated: true },
  { id: "b", source: "refund-request", target: "policy", label: "checks" },
  { id: "c", source: "policy", target: "skill", label: "compiles into" },
  { id: "d", source: "outage", target: "skill", label: "cited in" },
];

export function GraphPreview() {
  return (
    <div className="surface-panel h-[460px] overflow-hidden p-4">
      <div className="gradient-frame h-full rounded-4xl p-px">
        <div className="surface-stage-inner h-full overflow-hidden rounded-4xl">
          <ReactFlow
            fitView
            nodes={nodes}
            edges={edges}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            zoomOnDoubleClick={false}
            panOnDrag={false}
            proOptions={{ hideAttribution: true }}
          >
            <MiniMap
              pannable
              zoomable
              style={{
                background: "rgba(13,13,13,0.98)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            />
            <Controls showInteractive={false} />
            <Background color="rgba(255,255,255,0.08)" gap={22} />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}
