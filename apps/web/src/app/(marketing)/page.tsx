import Link from "next/link";
import { ArrowRight, Database, FileStack, GitBranch, ShieldAlert } from "lucide-react";

import { GraphPreview } from "@/components/graph-preview";
import { Badge } from "@/components/ui/badge";
import { BasicButton, RainbowButton } from "@/components/ui/vektr-button";
import { landingSections } from "@/lib/mock-data";

const connectorCards = [
  "Slack",
  "Google Drive",
  "Gmail",
  "Notion",
  "GitHub",
  "Linear",
  "Jira",
  "Zendesk",
  "Intercom",
];

const sectionIcons = [FileStack, GitBranch, Database, ArrowRight, ShieldAlert];

export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1280px] flex-col gap-18 px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
      <header className="surface-panel flex items-center justify-between gap-4 px-5 py-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="inline-flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/6 text-sm font-medium text-white">
            V
          </span>
          <div>
            <p className="type-body-lg-400 text-white">Vektr</p>
            <p className="type-label text-white/50">The company brain for AI agents.</p>
          </div>
        </Link>
        <nav className="hidden items-center gap-6 lg:flex">
          <Link href="/graph" className="type-body-lg-300 text-white/70 transition hover:text-white">
            Graph
          </Link>
          <Link href="/skills" className="type-body-lg-300 text-white/70 transition hover:text-white">
            Skills
          </Link>
          <Link href="/ask" className="type-body-lg-300 text-white/70 transition hover:text-white">
            Ask
          </Link>
          <Link href="/health" className="type-body-lg-300 text-white/70 transition hover:text-white">
            Health
          </Link>
        </nav>
      </header>

      <section className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
        <div className="space-y-7">
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="surface-chip border-white/10 bg-white/6 px-3 py-1 text-white hover:bg-white/6">
              The company brain for AI agents.
            </Badge>
            <Badge className="surface-chip border-white/10 bg-transparent px-3 py-1 text-white/60 hover:bg-transparent">
              YC Company Brain demo
            </Badge>
          </div>
          <div className="space-y-5">
            <p className="type-label text-white/50">Your company brain, mapped.</p>
            <h1 className="type-heading-01 max-w-4xl text-balance text-white">
              Vektr turns Slack threads, emails, docs, and tickets into a living
              operating graph, then generates executable skills for AI agents.
            </h1>
            <p className="type-body-xxl-300 max-w-2xl text-white/50">
              This sprint build centers on Acme Labs and the TeraCorp refund
              dispute. Lead with graph + skills, answer with citations, and
              surface conflicts before an agent acts.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <RainbowButton href="/demo">Try Acme Labs Demo</RainbowButton>
            <BasicButton href="#connectors">Join Waitlist</BasicButton>
          </div>
        </div>
        <GraphPreview />
      </section>

      <section className="grid gap-4 lg:grid-cols-5">
        {landingSections.map((section, index) => {
          const Icon = sectionIcons[index];

          return (
            <article key={section.title} className="surface-card flex flex-col gap-4 p-5">
              <span className="inline-flex size-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80">
                <Icon className="size-5" />
              </span>
              <div className="space-y-2">
                <h2 className="type-heading-06 text-white">{section.title}</h2>
                <p className="type-body-lg-300 text-white/50">{section.description}</p>
              </div>
            </article>
          );
        })}
      </section>

      <section
        id="connectors"
        className="surface-panel flex flex-col gap-6 px-6 py-6 sm:px-7 sm:py-7"
      >
        <div className="space-y-2">
          <p className="type-label text-white/50">Connector-looking interface</p>
          <h2 className="type-heading-04 text-white">Messy inputs in, operating graph out.</h2>
          <p className="type-body-xxl-300 max-w-2xl text-white/50">
            For the sprint, real OAuth is intentionally out of scope. Show the
            future integration surface without blocking the demo.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {connectorCards.map((connector) => (
            <div
              key={connector}
              className="surface-card flex items-center justify-between gap-4 p-4"
            >
              <div>
                <p className="type-body-xxl-400 text-white">{connector}</p>
                <p className="type-body-lg-300 text-white/50">Coming soon / Join waitlist</p>
              </div>
              <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-white/60">
                Soon
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
