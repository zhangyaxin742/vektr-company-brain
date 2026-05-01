import { NextResponse } from "next/server";

import { AuthenticationError, AuthorizationError } from "@/lib/server/db/errors";
import {
  buildIngestionJobStatus,
  getOrganizationSlugById,
  getPipelineJobById,
  userHasOrgMembership,
} from "@/lib/server/db/pipeline-jobs";
import { requireAuthenticatedContext } from "@/lib/server/db/shared";

export const dynamic = "force-dynamic";

type RouteProps = {
  params: Promise<{
    jobId: string;
  }>;
};

export async function GET(_: Request, { params }: RouteProps) {
  const { jobId } = await params;
  const job = await getPipelineJobById(jobId);

  if (!job) {
    return NextResponse.json({ error: "Ingestion job not found." }, { status: 404 });
  }

  const orgSlug = await getOrganizationSlugById(job.org_id);

  if (!orgSlug) {
    return NextResponse.json({ error: "Organization not found." }, { status: 404 });
  }

  if (job.source !== "public_demo") {
    try {
      const { user } = await requireAuthenticatedContext();
      const hasMembership = await userHasOrgMembership({
        orgId: job.org_id,
        userId: user.id,
      });

      if (!hasMembership) {
        throw new AuthorizationError();
      }
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

  return NextResponse.json(buildIngestionJobStatus({ job, orgSlug }));
}
