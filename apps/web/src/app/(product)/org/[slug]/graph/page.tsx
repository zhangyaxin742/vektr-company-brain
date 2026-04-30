import { notFound } from "next/navigation";

import { AppPage } from "@/components/app-page";
import { GraphWorkspace } from "@/components/graph-workspace";
import { WorkspaceSummaryCard } from "@/components/workspace-summary-card";
import { NotFoundError } from "@/lib/server/db/errors";
import { getWorkspaceSnapshot } from "@/lib/server/db/orgs";

type GraphPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function GraphPage({ params }: GraphPageProps) {
  const { slug } = await params;
  let snapshot;

  try {
    snapshot = await getWorkspaceSnapshot(slug);
  } catch (error) {
    if (error instanceof NotFoundError) {
      notFound();
    }

    throw error;
  }

  return (
    <AppPage
      eyebrow="Operating graph"
      title="Inspect how the workspace actually works."
      description="The graph surface remains a shell in this slice, but access now resolves through authenticated org membership and real workspace counts."
      actions={
        <WorkspaceSummaryCard
          counts={snapshot.counts}
          organizationName={snapshot.org.name}
          recentDocuments={snapshot.recentDocuments}
          role={snapshot.membership.role}
        />
      }
    >
      <GraphWorkspace />
    </AppPage>
  );
}
