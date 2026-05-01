import { NextResponse } from "next/server";

import {
  buildIngestionJobStatus,
  createPipelineJob,
  ensureOrganizationBySlug,
  findActivePipelineJobByDedupeKey,
} from "@/lib/server/db/pipeline-jobs";
import {
  DEMO_ORG_NAME,
  DEMO_ORG_SLUG,
  triggerWorkerDemoLoad,
} from "@/lib/server/ingestion";
import { loadDemoResponseSchema } from "@/lib/types";

export const dynamic = "force-dynamic";

const DEMO_DEDUPE_KEY = "demo:acme-seed:v1";

export async function POST() {
  const organization = await ensureOrganizationBySlug({
    name: DEMO_ORG_NAME,
    slug: DEMO_ORG_SLUG,
  });
  const activeJob = await findActivePipelineJobByDedupeKey(DEMO_DEDUPE_KEY);

  if (activeJob) {
    const payload = buildIngestionJobStatus({
      job: activeJob,
      orgSlug: DEMO_ORG_SLUG,
    });

    return NextResponse.json(
      loadDemoResponseSchema.parse({
        jobId: payload.jobId,
        jobType: payload.jobType,
        orgSlug: payload.orgSlug,
        source: payload.source,
        status: payload.status,
      })
    );
  }

  const job = await createPipelineJob({
    dedupeKey: DEMO_DEDUPE_KEY,
    jobType: "demo_load",
    orgId: organization.id,
    payload: {
      corpus: "acme",
      counts: {
        childJobsQueued: 0,
        chunks: 0,
        documents: 0,
        embeddings: 0,
        failures: 0,
        filesAccepted: 8,
        filesRejected: 0,
        warnings: 0,
      },
      seedVersion: "v1",
    },
    source: "public_demo",
    triggeredByUserId: null,
  });

  await triggerWorkerDemoLoad({
    jobId: job.id,
    orgId: organization.id,
    orgSlug: organization.slug,
  });

  return NextResponse.json(
    loadDemoResponseSchema.parse({
      jobId: job.id,
      jobType: "demo_load",
      orgSlug: organization.slug,
      source: "public_demo",
      status: job.status,
    }),
    { status: 202 }
  );
}
