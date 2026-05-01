import "server-only";

import { z } from "zod";

import type { Database, Json } from "@/lib/supabase/database.types";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  ingestionCountsSchema,
  ingestionJobStatusSchema,
  pipelineJobStatusSchema,
  pipelineJobTypeSchema,
} from "@/lib/types";

type PipelineJobRow = Database["public"]["Tables"]["pipeline_jobs"]["Row"];
type JobStatus = Database["public"]["Tables"]["pipeline_jobs"]["Row"]["status"];
type JobType = Database["public"]["Tables"]["pipeline_jobs"]["Row"]["job_type"];
type JobSource = Database["public"]["Tables"]["pipeline_jobs"]["Row"]["source"];

const createPipelineJobSchema = z.object({
  dedupeKey: z.string().trim().min(1).max(400).nullable().optional(),
  jobType: pipelineJobTypeSchema,
  orgId: z.string().uuid(),
  parentJobId: z.string().uuid().nullable().optional(),
  payload: z.custom<Json>((value) => value !== undefined).default({}),
  source: z.enum(["public_demo", "authenticated_upload", "system"]),
  triggeredByUserId: z.string().uuid().nullable().optional(),
});

const pipelineJobPayloadSchema = z.object({
  counts: ingestionCountsSchema.default({
    childJobsQueued: 0,
    chunks: 0,
    documents: 0,
    embeddings: 0,
    failures: 0,
    filesAccepted: 0,
    filesRejected: 0,
    warnings: 0,
  }),
  childJobIds: z.array(z.string().uuid()).default([]),
  message: z.string().nullable().default(null),
});

function parseJobResult(result: Json) {
  const parsed = pipelineJobPayloadSchema.safeParse(result);

  if (!parsed.success) {
    return {
      childJobIds: [],
      counts: ingestionCountsSchema.parse({}),
      message: null,
    };
  }

  return parsed.data;
}

export async function ensureOrganizationBySlug(input: {
  name: string;
  slug: string;
}) {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("organizations")
    .upsert(
      {
        name: input.name,
        slug: input.slug,
      },
      {
        onConflict: "slug",
      }
    )
    .select("id, name, slug, created_at, updated_at")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function findActivePipelineJobByDedupeKey(dedupeKey: string) {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("pipeline_jobs")
    .select("*")
    .eq("dedupe_key", dedupeKey)
    .in("status", ["queued", "running"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function createPipelineJob(input: {
  dedupeKey?: string | null;
  jobType: JobType;
  orgId: string;
  parentJobId?: string | null;
  payload?: Json;
  source: JobSource;
  triggeredByUserId?: string | null;
}) {
  const parsed = createPipelineJobSchema.parse(input);
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("pipeline_jobs")
    .insert({
      dedupe_key: parsed.dedupeKey ?? null,
      job_type: parsed.jobType,
      org_id: parsed.orgId,
      parent_job_id: parsed.parentJobId ?? null,
      payload: parsed.payload,
      source: parsed.source,
      triggered_by_user_id: parsed.triggeredByUserId ?? null,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getPipelineJobById(jobId: string) {
  const parsedId = z.string().uuid().parse(jobId);
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("pipeline_jobs")
    .select("*")
    .eq("id", parsedId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getOrganizationSlugById(orgId: string) {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("organizations")
    .select("slug")
    .eq("id", orgId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data?.slug ?? null;
}

export async function userHasOrgMembership(input: {
  orgId: string;
  userId: string;
}) {
  const admin = createSupabaseAdminClient();
  const { count, error } = await admin
    .from("memberships")
    .select("id", { count: "exact", head: true })
    .eq("org_id", input.orgId)
    .eq("user_id", input.userId);

  if (error) {
    throw new Error(error.message);
  }

  return (count ?? 0) > 0;
}

export function buildIngestionJobStatus(input: {
  job: PipelineJobRow;
  orgSlug: string;
}) {
  const result = parseJobResult(input.job.result);

  return ingestionJobStatusSchema.parse({
    childJobIds: result.childJobIds,
    completedAt: input.job.completed_at,
    counts: result.counts,
    createdAt: input.job.created_at,
    errorMessage: input.job.error_message,
    jobId: input.job.id,
    jobType: input.job.job_type,
    message: result.message,
    orgId: input.job.org_id,
    orgSlug: input.orgSlug,
    source: input.job.source,
    startedAt: input.job.started_at,
    status: input.job.status,
  });
}

export function isTerminalPipelineJobStatus(status: JobStatus) {
  return ["completed", "failed", "partial"].includes(
    pipelineJobStatusSchema.parse(status)
  );
}
