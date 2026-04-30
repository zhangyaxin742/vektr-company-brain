import { notFound } from "next/navigation";

import { AppPage } from "@/components/app-page";
import { SkillsWorkspace } from "@/components/skills-workspace";
import { WorkspaceSummaryCard } from "@/components/workspace-summary-card";
import { NotFoundError } from "@/lib/server/db/errors";
import { getWorkspaceSnapshot } from "@/lib/server/db/orgs";
import { getWorkspaceSkills } from "@/lib/server/db/skills";

type SkillsPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function SkillsPage({ params }: SkillsPageProps) {
  const { slug } = await params;
  let snapshot;
  let skills;

  try {
    [snapshot, skills] = await Promise.all([
      getWorkspaceSnapshot(slug),
      getWorkspaceSkills(slug),
    ]);
  } catch (error) {
    if (error instanceof NotFoundError) {
      notFound();
    }

    throw error;
  }

  return (
    <AppPage
      eyebrow="Skill compiler"
      title="Turn operating knowledge into executable skills."
      description="Draft skills now load through the authenticated DAL when the workspace has data; the static shell remains as the fallback product shape."
      actions={
        <WorkspaceSummaryCard
          counts={snapshot.counts}
          organizationName={snapshot.org.name}
          recentDocuments={snapshot.recentDocuments}
          role={snapshot.membership.role}
        />
      }
    >
      {skills.length ? (
        <section className="surface-panel space-y-4 px-6 py-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="type-label text-muted">Workspace skills</p>
              <h2 className="type-heading-05">{skills.length} records loaded</h2>
            </div>
            <p className="type-body-lg-300 text-quiet">
              Server-only DAL, org-scoped via RLS
            </p>
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            {skills.map((skill) => (
              <article key={skill.id} className="surface-card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <p className="type-label text-muted">{skill.status}</p>
                    <h3 className="type-heading-06">{skill.name}</h3>
                  </div>
                  <span className="status-pill px-3 py-1 type-label text-faint">
                    {skill.version}
                  </span>
                </div>
                <p className="mt-4 type-body-lg-300 text-soft">{skill.trigger}</p>
                <p className="mt-4 type-label text-muted">
                  Confidence {Math.round(skill.confidence * 100)}%
                </p>
              </article>
            ))}
          </div>
        </section>
      ) : (
        <SkillsWorkspace />
      )}
    </AppPage>
  );
}
