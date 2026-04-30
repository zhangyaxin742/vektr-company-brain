import { redirectToDefaultProductRoute } from "@/lib/server/product-routing";

export default async function SkillsPage() {
  await redirectToDefaultProductRoute("skills");
}
