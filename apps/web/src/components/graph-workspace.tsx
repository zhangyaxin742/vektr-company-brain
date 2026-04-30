"use client";

import "@xyflow/react/dist/style.css";

import { useMemo, useState } from "react";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  type Edge,
  type Node,
} from "@xyflow/react";

import { graphEdges, graphFilters, graphNodeDetails } from "@/lib/mock-data";
import type { GraphNodeDetail, GraphNodeKind } from "@/lib/types";

function buildNodes(selectedFilters: GraphNodeKind[]): Node[] {
  return graphNodeDetails
    .filter((detail) => selectedFilters.includes(detail.type))
    .map((detail) => ({
      id: detail.id,
      position: detail.position,
      data: {
        label: detail.label,
      },
      style: {
        width: detail.width ?? 210,
        borderRadius: 26,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(255,255,255,0.05)",
        color: "white",
        padding: 18,
        boxShadow: "0 24px 70px -40px rgba(0,0,0,0.9)",
      },
    }));
}

function buildEdges(selectedFilters: GraphNodeKind[]): Edge[] {
  const ids = new Set(
    graphNodeDetails
      .filter((detail) => selectedFilters.includes(detail.type))
      .map((detail) => detail.id),
  );

  return graphEdges.filter((edge) => ids.has(edge.source) && ids.has(edge.target));
}

export function GraphWorkspace() {
  const [activeFilters, setActiveFilters] = useState<GraphNodeKind[]>(graphFilters);
  const [selectedNode, setSelectedNode] = useState<GraphNodeDetail>(graphNodeDetails[0]);

  const nodes = useMemo(() => buildNodes(activeFilters), [activeFilters]);
  const edges = useMemo(() => buildEdges(activeFilters), [activeFilters]);

  return (
    <section className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
      <div className="surface-panel overflow-hidden p-4">
        <div className="mb-4 flex flex-wrap gap-2">
          {graphFilters.map((filter) => {
            const active = activeFilters.includes(filter);

            return (
              <button
                key={filter}
                type="button"
                onClick={() =>
                  setActiveFilters((current) =>
                    active
                      ? current.filter((value) => value !== filter)
                      : [...current, filter],
                  )
                }
                className={`surface-chip px-3 py-1 capitalize transition ${
                  active ? "border-white/16 bg-white/9 text-white" : "text-white/50"
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>

        <div className="h-[680px] overflow-hidden rounded-[28px] border border-white/10 bg-black/35">
          <ReactFlow
            fitView
            nodes={nodes}
            edges={edges}
            onNodeClick={(_, node) => {
              const detail = graphNodeDetails.find((item) => item.id === node.id);
              if (detail) {
                setSelectedNode(detail);
              }
            }}
            proOptions={{ hideAttribution: true }}
          >
            <MiniMap
              pannable
              zoomable
              style={{
                background: "rgba(13,13,13,0.96)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            />
            <Controls showInteractive={false} />
            <Background color="rgba(255,255,255,0.08)" gap={22} />
          </ReactFlow>
        </div>
      </div>

      <aside className="surface-panel p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="type-label text-white/50">Node drawer</p>
            <h2 className="type-heading-05 mt-2 text-white">{selectedNode.label}</h2>
            <p className="mt-2 type-body-lg-300 capitalize text-white/50">
              {selectedNode.type} | confidence {selectedNode.confidence}
            </p>
          </div>
          <span className="surface-chip px-3 py-1 text-white/70">Ask about this node</span>
        </div>

        <p className="mt-6 type-body-xxl-300 text-white/70">{selectedNode.summary}</p>

        <div className="mt-7 space-y-5">
          <div>
            <p className="type-label text-white/50">Evidence snippets</p>
            <ul className="mt-3 space-y-2">
              {selectedNode.evidence.map((item) => (
                <li key={item} className="type-body-lg-300 text-white/60">
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="type-label text-white/50">Related documents</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedNode.relatedDocuments.map((item) => (
                <span key={item} className="surface-chip px-3 py-1 text-white/70">
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="type-label text-white/50">Related skills</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedNode.relatedSkills.map((item) => (
                <span key={item} className="surface-chip px-3 py-1 text-white/70">
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="type-label text-white/50">Connected nodes</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedNode.connectedNodes.map((item) => (
                <span key={item} className="surface-chip px-3 py-1 text-white/70">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </section>
  );
}
