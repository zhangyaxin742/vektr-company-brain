import { NextResponse } from "next/server";

import { getConnectorStatuses, getEnvironmentStatus } from "@/lib/health";
import { appHealthResponseSchema } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const payload = appHealthResponseSchema.parse({
    generatedAt: new Date().toISOString(),
    environment: getEnvironmentStatus(),
    connectors: await getConnectorStatuses(),
  });

  return NextResponse.json(payload);
}
