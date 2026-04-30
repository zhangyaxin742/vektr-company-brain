import { AlertTriangle, Info, ShieldAlert } from "lucide-react";

import { AppPage } from "@/components/app-page";
import { healthFlags } from "@/lib/mock-data";

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

export default function HealthPage() {
  return (
    <AppPage
      eyebrow="Knowledge health"
      title="Catch broken knowledge before an agent acts."
      description="These cards stay static in Session A but match the exact product behavior the PRD calls for."
    >
      <div className="space-y-8">
        {groups.map((group) => {
          const items = healthFlags.filter((flag) => flag.severity === group.key);

          return (
            <section key={group.key} className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="type-heading-05 text-white">{group.title}</h2>
                <span className="type-body-lg-300 text-white/50">{items.length} flags</span>
              </div>
              <div className="grid gap-4 xl:grid-cols-2">
                {items.map((flag) => {
                  const Icon = severityIcons[flag.severity];

                  return (
                    <article key={flag.id} className="surface-card p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2">
                          <p className="type-label text-white/50">{flag.type.replace("_", " ")}</p>
                          <h3 className="type-heading-06 text-white">{flag.title}</h3>
                        </div>
                        <span className="inline-flex size-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80">
                          <Icon className="size-5" />
                        </span>
                      </div>
                      <p className="mt-4 type-body-xxl-300 text-white/70">{flag.description}</p>
                      <div className="mt-5 grid gap-4 lg:grid-cols-2">
                        <div>
                          <p className="type-label text-white/50">Related nodes</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {flag.relatedNodes.map((node) => (
                              <span key={node} className="surface-chip px-3 py-1 text-white/70">
                                {node}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="type-label text-white/50">Suggested fix</p>
                          <p className="mt-2 type-body-lg-300 text-white/70">{flag.suggestedFix}</p>
                        </div>
                      </div>
                      <div className="mt-5">
                        <p className="type-label text-white/50">Evidence snippets</p>
                        <ul className="mt-2 space-y-2">
                          {flag.evidence.map((item) => (
                            <li key={item} className="type-body-lg-300 text-white/60">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </AppPage>
  );
}
