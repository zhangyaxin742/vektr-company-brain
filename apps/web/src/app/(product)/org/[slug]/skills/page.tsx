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

  try {
    const [snapshot, skills] = await Promise.all([
      getWorkspaceSnapshot(slug),
      getWorkspaceSkills(slug),
    ]);

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
                <p className="type-label text-white/50">Workspace skills</p>
                <h2 className="type-heading-05 text-white">{skills.length} records loaded</h2>
              </div>
              <p className="type-body-lg-300 text-white/55">
                Server-only DAL, org-scoped via RLS
              </p>
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
              {skills.map((skill) => (
                <article key={skill.id} className="surface-card p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <p className="type-label text-white/50">{skill.status}</p>
                      <h3 className="type-heading-06 text-white">{skill.name}</h3>
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 type-label text-white/65">
                      {skill.version}
                    </span>
                  </div>
                  <p className="mt-4 type-body-lg-300 text-white/70">{skill.trigger}</p>
                  <p className="mt-4 type-label text-white/45">
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
  } catch (error) {
    if (error instanceof NotFoundError) {
      notFound();
    }

    throw error;
  }
}
