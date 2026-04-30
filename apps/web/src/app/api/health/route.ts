import { NextResponse } from "next/server";

import { getConnectorStatuses, getEnvironmentStatus } from "@/lib/health";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    environment: getEnvironmentStatus(),
    connectors: await getConnectorStatuses(),
  });
}
