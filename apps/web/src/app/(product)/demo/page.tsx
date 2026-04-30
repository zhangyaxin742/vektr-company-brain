import { Activity, Blocks, Bot, FileText, Network, ShieldAlert, Sparkles } from "lucide-react";

import { AppPage } from "@/components/app-page";
import { RainbowButton } from "@/components/ui/vektr-button";
import { demoMetrics, demoTimeline } from "@/lib/mock-data";

const metricIcons = [FileText, Blocks, Sparkles, Network, Bot, ShieldAlert, Activity];

export default function DemoPage() {
  return (
    <AppPage
      eyebrow="Demo ingestion"
      title="Load the Acme Labs brain."
      description="Session A stops at the shell, but the demo page should already feel like a real ingestion control room."
      actions={<RainbowButton>Load Acme Labs Brain</RainbowButton>}
    >
      <section className="grid gap-4 xl:grid-cols-[1.12fr_0.88fr]">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {demoMetrics.map((metric, index) => {
            const Icon = metricIcons[index];

            return (
              <article key={metric.label} className="surface-card p-5">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="type-body-lg-300 text-white/50">{metric.label}</p>
                    <p className="type-heading-05 mt-2 text-white">{metric.value}</p>
                  </div>
                  <span className="inline-flex size-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80">
                    <Icon className="size-5" />
                  </span>
                </div>
                <p className="type-body-lg-300 text-white/50">{metric.detail}</p>
              </article>
            );
          })}
        </div>

        <aside className="surface-panel p-6">
          <div className="space-y-2">
            <p className="type-label text-white/50">Final state</p>
            <h2 className="type-heading-04 text-white">Acme Labs Brain Ready</h2>
            <p className="type-body-xxl-300 text-white/50">
              This remains static in Session A, but the shape mirrors the PRD's
              target ingestion flow and gives later sessions a fixed UI contract.
            </p>
          </div>
          <div className="mt-8 space-y-4">
            {demoTimeline.map((item, index) => (
              <div key={item} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span className="inline-flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/6 text-xs font-medium text-white">
                    {index + 1}
                  </span>
                  {index < demoTimeline.length - 1 ? (
                    <span className="mt-2 h-full w-px bg-white/10" />
                  ) : null}
                </div>
                <p className="type-body-xxl-300 pt-1 text-white/70">{item}</p>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </AppPage>
  );
}
