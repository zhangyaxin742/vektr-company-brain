import type { AppHealthResponse } from "@/lib/types";

export async function getAppHealth(baseUrl = ""): Promise<AppHealthResponse> {
  const response = await fetch(`${baseUrl}/api/health`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`App health request failed with ${response.status}.`);
  }

  return (await response.json()) as AppHealthResponse;
}
