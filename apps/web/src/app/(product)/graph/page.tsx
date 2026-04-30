import { AppPage } from "@/components/app-page";
import { GraphWorkspace } from "@/components/graph-workspace";

export default function GraphPage() {
  return (
    <AppPage
      eyebrow="Operating graph"
      title="Inspect how Acme Labs actually works."
      description="This is the hero product surface. Session A stops at typed demo nodes, filters, and a node drawer shell."
    >
      <GraphWorkspace />
    </AppPage>
  );
}
