"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  Activity,
  Blocks,
  FileText,
  LoaderCircle,
  ShieldAlert,
  Sparkles,
  Workflow,
} from "lucide-react";

import { RainbowButton } from "@/components/ui/vektr-button";
import { cn } from "@/lib/utils";
import { ingestionJobStatusSchema, loadDemoResponseSchema } from "@/lib/types";
import type { IngestionJobStatus } from "@/lib/types";

const metricIcons = [FileText, Blocks, Sparkles, Workflow, ShieldAlert, Activity];

const defaultMetrics = [
  {
    detail: "The seeded Acme corpus contains Slack, email, markdown, and JSON artifacts.",
    label: "Seed documents",
    value: "8",
  },
  {
    detail: "Chunking and embedding counts populate here after the worker finishes.",
    label: "Chunk pipeline",
    value: "Pending",
  },
  {
    detail: "Embeddings are generated in the worker and written into pgvector-backed chunks.",
    label: "Embeddings",
    value: "Pending",
  },
  {
    detail: "The next GraphRAG job is queued as a child pipeline job for later stages.",
    label: "Follow-on jobs",
    value: "1",
  },
  {
    detail: "Rejected files and worker failures appear here instead of hiding inside logs.",
    label: "Failures",
    value: "0",
  },
  {
    detail: "Status transitions move from queued to running to completed or partial.",
    label: "Job state",
    value: "Idle",
  },
];

function isTerminalStatus(status: IngestionJobStatus["status"]) {
  return ["completed", "failed", "partial"].includes(status);
}

function buildMetrics(job: IngestionJobStatus | null) {
  if (!job) {
    return defaultMetrics;
  }

  return [
    {
      detail: "Documents persisted into the workspace document store.",
      label: "Documents processed",
      value: String(job.counts.documents),
    },
    {
      detail: "Citation chunks normalized and written to the chunks table.",
      label: "Chunks embedded",
      value: String(job.counts.chunks),
    },
    {
      detail: "Embedding vectors successfully stored against chunk rows.",
      label: "Embeddings",
      value: String(job.counts.embeddings),
    },
    {
      detail: "Queued child jobs hand off to the later GraphRAG indexing phase.",
      label: "Follow-on jobs",
      value: String(job.counts.childJobsQueued),
    },
    {
      detail: "Rejected artifacts and processing failures are counted separately.",
      label: "Failures",
      value: String(job.counts.failures + job.counts.filesRejected),
    },
    {
      detail: job.message ?? "Status is reported directly from pipeline_jobs.",
      label: "Job state",
      value: job.status,
    },
  ];
}

export function DemoIngestionWorkspace() {
  const [job, setJob] = useState<IngestionJobStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!activeJobId) {
      return;
    }

    let cancelled = false;

    const poll = async () => {
      try {
        const response = await fetch(`/api/ingestion/${activeJobId}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Status request failed with ${response.status}.`);
        }

        const payload = ingestionJobStatusSchema.parse(await response.json());

        if (cancelled) {
          return;
        }

        setJob(payload);

        if (!isTerminalStatus(payload.status)) {
          pollTimeoutRef.current = setTimeout(poll, 1500);
        }
      } catch (pollError) {
        if (!cancelled) {
          setError(
            pollError instanceof Error
              ? pollError.message
              : "Could not refresh ingestion status."
          );
        }
      }
    };

    void poll();

    return () => {
      cancelled = true;
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
      }
    };
  }, [activeJobId]);

  const metrics = buildMetrics(job);

  return (
    <section className="grid gap-4 xl:grid-cols-[1.12fr_0.88fr]">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric, index) => {
          const Icon = metricIcons[index];

          return (
            <article key={metric.label} className="surface-card p-5">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="type-body-lg-300 text-muted">{metric.label}</p>
                  <p className="type-heading-05 mt-2 capitalize">{metric.value}</p>
                </div>
                <span className="surface-icon size-11">
                  <Icon className="size-5" />
                </span>
              </div>
              <p className="type-body-lg-300 text-muted">{metric.detail}</p>
            </article>
          );
        })}
      </div>

      <aside className="surface-panel p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="type-label text-muted">Live pipeline</p>
            <h2 className="type-heading-04">Acme Labs ingestion control room</h2>
            <p className="type-body-xxl-300 text-muted">
              Load the seeded corpus, watch the worker progress, and verify that
              documents, chunks, embeddings, and the next GraphRAG handoff all land.
            </p>
          </div>
          <RainbowButton
            disabled={isPending || (!!job && !isTerminalStatus(job.status))}
            onClick={() =>
              startTransition(async () => {
                setError(null);
                const response = await fetch("/api/demo/load", {
                  method: "POST",
                });

                if (!response.ok) {
                  throw new Error(`Demo load failed with ${response.status}.`);
                }

                const payload = loadDemoResponseSchema.parse(await response.json());
                setActiveJobId(payload.jobId);
              })
            }
          >
            {isPending || (!!job && !isTerminalStatus(job.status))
              ? "Loading Acme Brain"
              : "Load Acme Labs Brain"}
          </RainbowButton>
        </div>

        <div className="mt-8 space-y-4">
          <div className="surface-stage flex items-center justify-between gap-4 p-5">
            <div>
              <p className="type-label text-muted">Current status</p>
              <p className="type-heading-06 mt-2 capitalize">
                {job ? job.status : "idle"}
              </p>
            </div>
            {job && !isTerminalStatus(job.status) ? (
              <LoaderCircle className="size-6 animate-spin" />
            ) : null}
          </div>

          <div className="space-y-3">
            {[
              "Seed corpus selected and job queued.",
              "Worker normalizes documents and writes raw source artifacts.",
              "Chunking and embeddings complete inside the ingestion worker.",
              "GraphRAG follow-on job is queued for later pipeline stages.",
            ].map((item, index) => (
              <div key={item} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span
                    className={cn(
                      "surface-icon size-9 text-xs font-medium",
                      job && index === 0 ? "status-pill" : undefined
                    )}
                  >
                    {index + 1}
                  </span>
                  {index < 3 ? <span className="surface-divider mt-2 h-full w-px" /> : null}
                </div>
                <p className="type-body-xxl-300 pt-1 text-soft">{item}</p>
              </div>
            ))}
          </div>

          {job ? (
            <div className="surface-well-soft space-y-3 p-4">
              <p className="type-label text-muted">Job details</p>
              <p className="type-body-lg-300 text-soft">Job ID: {job.jobId}</p>
              <p className="type-body-lg-300 text-soft">Org: {job.orgSlug}</p>
              <p className="type-body-lg-300 text-soft">
                Started: {job.startedAt ?? "Waiting for worker"}
              </p>
              <p className="type-body-lg-300 text-soft">
                Finished: {job.completedAt ?? "Not finished yet"}
              </p>
            </div>
          ) : null}

          {error ? (
            <div className="surface-card border border-[var(--color-signal-danger)]/30 p-4">
              <p className="type-label text-muted">Worker error</p>
              <p className="mt-2 type-body-lg-300 text-soft">{error}</p>
            </div>
          ) : null}
        </div>
      </aside>
    </section>
  );
}
