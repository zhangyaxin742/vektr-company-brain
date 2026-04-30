import { redirectToDefaultProductRoute } from "@/lib/server/product-routing";

export default async function HealthPage() {
  await redirectToDefaultProductRoute("health");
}
