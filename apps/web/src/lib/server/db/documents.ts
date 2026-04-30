import { z } from "zod";

import { requireOrgAccess } from "@/lib/server/db/shared";

const documentsQuerySchema = z.object({
  limit: z.number().int().positive().max(50).default(10),
  orgSlug: z.string().trim().min(1),
});

export async function getWorkspaceDocuments(
  orgSlugInput: string,
  options?: { limit?: number }
) {
  const { orgSlug, limit } = documentsQuerySchema.parse({
    orgSlug: orgSlugInput,
    limit: options?.limit ?? 10,
  });
  const { supabase, org } = await requireOrgAccess(orgSlug);

  const { data, error } = await supabase
    .from("documents")
    .select("id, title, source_type, source_date, created_at, updated_at, metadata")
    .eq("org_id", org.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
