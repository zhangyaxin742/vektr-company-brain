import { NextResponse } from "next/server";

import { AuthenticationError, AuthorizationError } from "@/lib/server/db/errors";
import {
  buildIngestionJobStatus,
  createPipelineJob,
  findActivePipelineJobByDedupeKey,
} from "@/lib/server/db/pipeline-jobs";
import { requireOrgAdminAccess } from "@/lib/server/db/shared";
import {
  MAX_UPLOAD_BYTES,
  createUploadDedupeKey,
  isAllowedUploadExtension,
  triggerWorkerUpload,
} from "@/lib/server/ingestion";
import { uploadResponseSchema } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const formData = await request.formData();
  const orgSlug = String(formData.get("orgSlug") ?? "").trim();

  if (!orgSlug) {
    return NextResponse.json(
      {
        error: "orgSlug is required.",
      },
      { status: 400 }
    );
  }

  try {
    const { org, user } = await requireOrgAdminAccess(orgSlug);
    const fileEntries = formData.getAll("files");
    const acceptedFiles: Array<{
      buffer: Buffer;
      contentType: string;
      name: string;
      sizeBytes: number;
    }> = [];
    const rejectedFiles: Array<{ name: string; reason: string }> = [];

    for (const entry of fileEntries) {
      if (!(entry instanceof File)) {
        rejectedFiles.push({
          name: "unknown",
          reason: "Unsupported form field.",
        });
        continue;
      }

      if (!isAllowedUploadExtension(entry.name)) {
        rejectedFiles.push({
          name: entry.name,
          reason: "Only .json, .md, and .txt are supported.",
        });
        continue;
      }

      if (entry.size > MAX_UPLOAD_BYTES) {
        rejectedFiles.push({
          name: entry.name,
          reason: `File exceeds the ${MAX_UPLOAD_BYTES} byte limit.`,
        });
        continue;
      }

      const buffer = Buffer.from(await entry.arrayBuffer());
      acceptedFiles.push({
        buffer,
        contentType: entry.type || "application/octet-stream",
        name: entry.name,
        sizeBytes: buffer.byteLength,
      });
    }

    if (!acceptedFiles.length) {
      return NextResponse.json(
        {
          acceptedFiles: [],
          error: "No valid upload files were provided.",
          rejectedFiles,
        },
        { status: 400 }
      );
    }

    const dedupeKey = createUploadDedupeKey({
      files: acceptedFiles.map((file) => ({
        buffer: file.buffer,
        name: file.name,
      })),
      orgId: org.id,
    });
    const activeJob = await findActivePipelineJobByDedupeKey(dedupeKey);

    if (activeJob) {
      const payload = buildIngestionJobStatus({
        job: activeJob,
        orgSlug,
      });

      return NextResponse.json(
        uploadResponseSchema.parse({
          acceptedFiles: acceptedFiles.map((file) => ({
            contentType: file.contentType,
            name: file.name,
            sizeBytes: file.sizeBytes,
          })),
          jobId: payload.jobId,
          rejectedFiles,
          status: payload.status,
        })
      );
    }

    const job = await createPipelineJob({
      dedupeKey,
      jobType: "upload_ingest",
      orgId: org.id,
      payload: {
        counts: {
          childJobsQueued: 0,
          chunks: 0,
          documents: 0,
          embeddings: 0,
          failures: 0,
          filesAccepted: acceptedFiles.length,
          filesRejected: rejectedFiles.length,
          warnings: 0,
        },
        filenames: acceptedFiles.map((file) => file.name),
        message: "Upload accepted and queued.",
      },
      source: "authenticated_upload",
      triggeredByUserId: user.id,
    });

    await triggerWorkerUpload({
      files: acceptedFiles,
      jobId: job.id,
      orgId: org.id,
      orgSlug,
      triggeredByUserId: user.id,
    });

    return NextResponse.json(
      uploadResponseSchema.parse({
        acceptedFiles: acceptedFiles.map((file) => ({
          contentType: file.contentType,
          name: file.name,
          sizeBytes: file.sizeBytes,
        })),
        jobId: job.id,
        rejectedFiles,
        status: job.status,
      }),
      { status: 202 }
    );
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    throw error;
  }
}
