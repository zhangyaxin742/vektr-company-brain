import {
  loadDemoResponseSchema,
  workerConnectorHealthResponseSchema,
  workerHealthResponseSchema,
} from "@/lib/types";
import type {
  LoadDemoResponse,
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

    async loadDemo(): Promise<LoadDemoResponse> {
      return loadDemoResponseSchema.parse({
        status: "stub" as const,
        route: "/worker/ingest/demo",
      });
    },
  };
}
