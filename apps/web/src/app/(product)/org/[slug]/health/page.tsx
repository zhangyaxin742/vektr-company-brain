import { notFound } from "next/navigation";
import { AlertTriangle, Info, ShieldAlert } from "lucide-react";

import { AppPage } from "@/components/app-page";
import { WorkspaceSummaryCard } from "@/components/workspace-summary-card";
import { healthFlags } from "@/lib/mock-data";
import { NotFoundError } from "@/lib/server/db/errors";
import { getWorkspaceHealthFlags } from "@/lib/server/db/health";
import { getWorkspaceSnapshot } from "@/lib/server/db/orgs";

const severityIcons = {
  critical: ShieldAlert,
  warning: AlertTriangle,
  info: Info,
} as const;

const groups = [
  { key: "critical", title: "Critical" },
  { key: "warning", title: "Warning" },
  { key: "info", title: "Info" },
] as const;

type HealthPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function HealthPage({ params }: HealthPageProps) {
  const { slug } = await params;
  let snapshot;
  let flags;

  try {
    [snapshot, flags] = await Promise.all([
      getWorkspaceSnapshot(slug),
      getWorkspaceHealthFlags(slug),
    ]);
  } catch (error) {
    if (error instanceof NotFoundError) {
      notFound();
    }

    throw error;
  }

  return (
    <AppPage
      eyebrow="Knowledge health"
      title="Catch broken knowledge before an agent acts."
      description="Health flags now load from the authenticated workspace when present; the static PRD-aligned cards remain as the visual fallback."
      actions={
        <WorkspaceSummaryCard
          counts={snapshot.counts}
          organizationName={snapshot.org.name}
          recentDocuments={snapshot.recentDocuments}
          role={snapshot.membership.role}
        />
      }
    >
      {flags.length ? (
        <section className="grid gap-4 xl:grid-cols-2">
          {flags.map((flag) => {
            const Icon = severityIcons[flag.severity];

            return (
              <article key={flag.id} className="surface-card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <p className="type-label text-muted">{flag.type.replace("_", " ")}</p>
                    <h3 className="type-heading-06">{flag.title}</h3>
                  </div>
                  <span className="surface-icon size-11">
                    <Icon className="size-5" />
                  </span>
                </div>
                <p className="mt-4 type-body-xxl-300 text-soft">{flag.description}</p>
                <div className="mt-4 flex items-center justify-between text-quiet">
                  <span className="type-label">{flag.status}</span>
                  <span className="type-label">
                    Updated {new Date(flag.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </article>
            );
          })}
        </section>
      ) : (
        <div className="space-y-8">
          {groups.map((group) => {
            const items = healthFlags.filter((flag) => flag.severity === group.key);

            return (
              <section key={group.key} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="type-heading-05">{group.title}</h2>
                  <span className="type-body-lg-300 text-muted">{items.length} flags</span>
                </div>
                <div className="grid gap-4 xl:grid-cols-2">
                  {items.map((flag) => {
                    const Icon = severityIcons[flag.severity];

                    return (
                      <article key={flag.id} className="surface-card p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-2">
                            <p className="type-label text-muted">
                              {flag.type.replace("_", " ")}
                            </p>
                            <h3 className="type-heading-06">{flag.title}</h3>
                          </div>
                          <span className="surface-icon size-11">
                            <Icon className="size-5" />
                          </span>
                        </div>
                        <p className="mt-4 type-body-xxl-300 text-soft">
                          {flag.description}
                        </p>
                      </article>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </AppPage>
  );
}
