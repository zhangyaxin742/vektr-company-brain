import { redirectToDefaultProductRoute } from "@/lib/server/product-routing";

export default async function AskPage() {
  await redirectToDefaultProductRoute("ask");
}
