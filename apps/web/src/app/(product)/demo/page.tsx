import { AppPage } from "@/components/app-page";
import { DemoIngestionWorkspace } from "@/components/demo-ingestion-workspace";

export default function DemoPage() {
  return (
    <AppPage
      eyebrow="Demo ingestion"
      title="Load the Acme Labs brain."
      description="Run the real seed ingestion pipeline: normalize raw artifacts, persist documents, chunk text, generate embeddings, and queue the next GraphRAG stage."
    >
      <DemoIngestionWorkspace />
    </AppPage>
  );
}
