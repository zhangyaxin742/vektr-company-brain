import type { WorkerConnectorHealthResponse, WorkerHealthResponse } from "@/lib/types";

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

      return (await response.json()) as WorkerHealthResponse;
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

      return (await response.json()) as WorkerConnectorHealthResponse;
    },

    async loadDemo() {
      return {
        status: "stub" as const,
        route: "/worker/ingest/demo",
      };
    },
  };
}
