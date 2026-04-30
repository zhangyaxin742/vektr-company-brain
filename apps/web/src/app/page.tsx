import { ArrowRight, Database, Network, Server, ShieldCheck } from "lucide-react";

import { GraphPreview } from "@/components/graph-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getConnectorStatuses, getEnvironmentStatus } from "@/lib/health";

export const dynamic = "force-dynamic";

const tracks = [
  {
    name: "Ask",
    summary: "Citation-first answers grounded in internal source material.",
  },
  {
    name: "Graph",
    summary: "Operating graph canvas for people, incidents, policies, and skills.",
  },
  {
    name: "Skills",
    summary: "Structured, approval-gated skill files generated from company knowledge.",
  },
  {
    name: "Health",
    summary: "Conflict, staleness, and missing-owner checks across the company brain.",
  },
];

const stack = [
  "Next.js App Router",
  "Tailwind CSS v4",
  "shadcn/ui",
  "React Flow",
  "FastAPI",
  "Supabase",
  "Neo4j AuraDB",
];

export default async function Home() {
  const [connectorStatuses, environmentStatus] = await Promise.all([
    getConnectorStatuses(),
    Promise.resolve(getEnvironmentStatus()),
  ]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-6 sm:px-8 lg:px-10">
      <section className="relative overflow-hidden rounded-[2.25rem] border border-black/8 bg-[linear-gradient(135deg,rgba(255,247,237,0.96),rgba(255,255,255,0.92)_38%,rgba(239,246,255,0.96))] px-6 py-7 shadow-[0_36px_120px_-52px_rgba(17,24,39,0.48)] sm:px-10 sm:py-10">
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(17,24,39,0.28),transparent)]" />
        <div className="grid gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="rounded-full bg-primary/12 px-3 py-1 text-primary hover:bg-primary/12">
                Hour 0-1 Infrastructure
              </Badge>
              <Badge
                variant="outline"
                className="rounded-full border-black/10 bg-white/70 px-3 py-1"
              >
                Session A
              </Badge>
            </div>
            <div className="space-y-4">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
                Vektr company brain sprint
              </p>
              <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.06em] text-balance text-foreground sm:text-5xl lg:text-6xl">
                Turn scattered company artifacts into graph-backed memory and
                executable agent skills.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                This scaffold boots the Next.js frontend, the FastAPI worker,
                and the first connector layer for Supabase and Neo4j Aura so
                the rest of the sprint can focus on ingestion, GraphRAG, and
                skill generation.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="rounded-full px-5">
                <a href="/api/health">
                  Inspect API health
                  <ArrowRight className="size-4" />
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-black/10 bg-white/70 px-5"
              >
                <a href="http://127.0.0.1:8000/docs" target="_blank" rel="noreferrer">
                  Open worker docs
                </a>
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {tracks.map((track) => (
                <Card
                  key={track.name}
                  className="border border-black/8 bg-white/72 backdrop-blur-sm"
                  size="sm"
                >
                  <CardHeader className="gap-2">
                    <CardTitle>{track.name}</CardTitle>
                    <CardDescription>{track.summary}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
          <GraphPreview />
        </div>
      </section>

      <section className="grid gap-6 py-6 lg:grid-cols-[0.94fr_1.06fr]">
        <Card className="border border-black/8 bg-white/86">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="size-4 text-primary" />
              Connector readiness
            </CardTitle>
            <CardDescription>
              The web app checks project reachability. The worker performs the
              direct Supabase Postgres check.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {connectorStatuses.map((status) => (
              <div
                key={status.name}
                className="rounded-2xl border border-black/8 bg-stone-50/90 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">{status.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {status.summary}
                    </p>
                  </div>
                  <Badge
                    variant={status.state === "ready" ? "default" : "outline"}
                    className="rounded-full capitalize"
                  >
                    {status.state.replace("_", " ")}
                  </Badge>
                </div>
                {status.detail ? (
                  <p className="mt-3 text-xs leading-5 text-muted-foreground">
                    {status.detail}
                  </p>
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border border-black/8 bg-white/86">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" />
              Environment contract
            </CardTitle>
            <CardDescription>
              Boot succeeds without secrets, but the connector checks need the
              variables below filled in.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-black/8 bg-stone-50/90 p-4">
                <p className="flex items-center gap-2 font-medium">
                  <Server className="size-4 text-primary" />
                  FastAPI worker URL
                </p>
                <p className="mt-2 font-mono text-sm">
                  {environmentStatus.fastapiWorkerUrl}
                </p>
              </div>
              <div className="rounded-2xl border border-black/8 bg-stone-50/90 p-4">
                <p className="flex items-center gap-2 font-medium">
                  <Database className="size-4 text-primary" />
                  Missing keys
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {environmentStatus.missingKeys.length > 0
                    ? environmentStatus.missingKeys.join(", ")
                    : "None. Web-side env schema is satisfied."}
                </p>
              </div>
            </div>
            <Separator />
            <div className="space-y-3">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Sprint stack
              </p>
              <div className="flex flex-wrap gap-2">
                {stack.map((item) => (
                  <Badge
                    key={item}
                    variant="outline"
                    className="rounded-full border-black/10 bg-white"
                  >
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
