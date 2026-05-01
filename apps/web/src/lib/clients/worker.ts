import {
  ingestionJobStatusSchema,
  workerConnectorHealthResponseSchema,
  workerHealthResponseSchema,
} from "@/lib/types";
import type {
  IngestionJobStatus,
  WorkerConnectorHealthResponse,
  WorkerHealthResponse,
} from "@/lib/types";

type WorkerClientOptions = {
  baseUrl: string;
};

export function createWorkerClient({ baseUrl }: WorkerClientOptions) {
  return {
    async getHealth(): Promise<WorkerHealthResponse> {
      const response = await fetch(`${baseUrl}/worker/health`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Worker health request failed with ${response.status}.`);
      }

      return workerHealthResponseSchema.parse(await response.json());
    },

    async getConnectorHealth(): Promise<WorkerConnectorHealthResponse> {
      const response = await fetch(`${baseUrl}/worker/health/connectors`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(
          `Worker connector health request failed with ${response.status}.`,
        );
      }

      return workerConnectorHealthResponseSchema.parse(await response.json());
    },

    async loadDemo(input: {
      jobId: string;
      orgId: string;
      orgSlug: string;
      workerSecret: string;
    }): Promise<IngestionJobStatus> {
      const response = await fetch(`${baseUrl}/worker/ingest/demo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-worker-secret": input.workerSecret,
        },
        body: JSON.stringify({
          jobId: input.jobId,
          orgId: input.orgId,
          orgSlug: input.orgSlug,
        }),
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Worker demo ingest request failed with ${response.status}.`);
      }

      return ingestionJobStatusSchema.parse(await response.json());
    },

    async ingestUpload(input: {
      formData: FormData;
      workerSecret: string;
    }): Promise<IngestionJobStatus> {
      const response = await fetch(`${baseUrl}/worker/ingest/document`, {
        method: "POST",
        headers: {
          "x-worker-secret": input.workerSecret,
        },
        body: input.formData,
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Worker upload ingest request failed with ${response.status}.`);
      }

      return ingestionJobStatusSchema.parse(await response.json());
    },
  };
}
