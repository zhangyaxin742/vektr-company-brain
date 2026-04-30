import { AppPage } from "@/components/app-page";
import { SkillsWorkspace } from "@/components/skills-workspace";

export default function SkillsPage() {
  return (
    <AppPage
      eyebrow="Skill compiler"
      title="Turn operating knowledge into executable skills."
      description="The wedge is visible now: list, inspect, and export draft skills before any generation logic exists."
    >
      <SkillsWorkspace />
    </AppPage>
  );
}
