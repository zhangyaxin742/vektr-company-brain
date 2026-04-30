import { redirectToDefaultProductRoute } from "@/lib/server/product-routing";

export default async function GraphPage() {
  await redirectToDefaultProductRoute("graph");
}
