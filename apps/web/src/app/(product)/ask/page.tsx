import { AppPage } from "@/components/app-page";
import { AskWorkspace } from "@/components/ask-workspace";

export default function AskPage() {
  return (
    <AppPage
      eyebrow="Citation-first answers"
      title="Ask operational questions with evidence."
      description="The UI contract is fixed now so Session F can wire retrieval, citations, and confidence later without reworking layout."
    >
      <AskWorkspace />
    </AppPage>
  );
}
