import "server-only";

import { createHash } from "node:crypto";

import { getServerEnv } from "@/lib/env/server";

export const DEMO_ORG_NAME = "Acme Labs Demo";
export const DEMO_ORG_SLUG = "acme-labs-demo";
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const ALLOWED_UPLOAD_EXTENSIONS = new Set([".json", ".md", ".txt"]);

type WorkerUploadFile = {
  buffer: Buffer;
  contentType: string;
  name: string;
};

function getWorkerHeaders(contentType?: string) {
  const env = getServerEnv();

  if (!env.WORKER_SHARED_SECRET) {
    throw new Error("Missing WORKER_SHARED_SECRET.");
  }

  return {
    ...(contentType ? { "Content-Type": contentType } : {}),
    "x-worker-secret": env.WORKER_SHARED_SECRET,
  };
}

export function getFileExtension(filename: string) {
  const index = filename.lastIndexOf(".");
  return index >= 0 ? filename.slice(index).toLowerCase() : "";
}

export function isAllowedUploadExtension(filename: string) {
  return ALLOWED_UPLOAD_EXTENSIONS.has(getFileExtension(filename));
}

export function createUploadDedupeKey(input: {
  files: Array<{
    buffer: Buffer;
    name: string;
  }>;
  orgId: string;
}) {
  const hash = createHash("sha256");
  hash.update(input.orgId);

  input.files
    .slice()
    .sort((left, right) => left.name.localeCompare(right.name))
    .forEach((file) => {
      hash.update(file.name);
      hash.update(file.buffer);
    });

  return `upload:${input.orgId}:${hash.digest("hex")}`;
}

export async function triggerWorkerDemoLoad(input: {
  jobId: string;
  orgId: string;
  orgSlug: string;
}) {
  const env = getServerEnv();
  const response = await fetch(`${env.FASTAPI_WORKER_URL}/worker/ingest/demo`, {
    method: "POST",
    headers: getWorkerHeaders("application/json"),
    body: JSON.stringify(input),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Worker demo load failed with ${response.status}.`);
  }
}

export async function triggerWorkerUpload(input: {
  files: WorkerUploadFile[];
  jobId: string;
  orgId: string;
  orgSlug: string;
  triggeredByUserId: string | null;
}) {
  const env = getServerEnv();
  const formData = new FormData();
  formData.set("job_id", input.jobId);
  formData.set("org_id", input.orgId);
  formData.set("org_slug", input.orgSlug);

  if (input.triggeredByUserId) {
    formData.set("triggered_by_user_id", input.triggeredByUserId);
  }

  for (const file of input.files) {
    formData.append(
      "files",
      new Blob([new Uint8Array(file.buffer)], {
        type: file.contentType,
      }),
      file.name
    );
  }

  const response = await fetch(`${env.FASTAPI_WORKER_URL}/worker/ingest/document`, {
    method: "POST",
    headers: getWorkerHeaders(),
    body: formData,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Worker upload ingest failed with ${response.status}.`);
  }
}
