import { notFound } from "next/navigation";

import { AppPage } from "@/components/app-page";
import { AskWorkspace } from "@/components/ask-workspace";
import { WorkspaceSummaryCard } from "@/components/workspace-summary-card";
import { NotFoundError } from "@/lib/server/db/errors";
import { getWorkspaceSnapshot } from "@/lib/server/db/orgs";

type AskPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function AskPage({ params }: AskPageProps) {
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
      eyebrow="Citation-first answers"
      title="Ask operational questions with evidence."
      description="The retrieval and answer loop still lands later in the sprint, but auth, org scoping, and workspace context are now loaded through the server DAL."
      actions={
        <WorkspaceSummaryCard
          counts={snapshot.counts}
          organizationName={snapshot.org.name}
          recentDocuments={snapshot.recentDocuments}
          role={snapshot.membership.role}
        />
      }
    >
      <AskWorkspace />
    </AppPage>
  );
}
