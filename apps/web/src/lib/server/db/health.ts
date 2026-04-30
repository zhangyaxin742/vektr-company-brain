import { z } from "zod";

import { requireOrgAccess } from "@/lib/server/db/shared";

const healthQuerySchema = z.object({
  limit: z.number().int().positive().max(50).default(25),
  orgSlug: z.string().trim().min(1),
});

export async function getWorkspaceHealthFlags(
  orgSlugInput: string,
  options?: { limit?: number }
) {
  const { orgSlug, limit } = healthQuerySchema.parse({
    orgSlug: orgSlugInput,
    limit: options?.limit ?? 25,
  });
  const { supabase, org } = await requireOrgAccess(orgSlug);

  const { data, error } = await supabase
    .from("health_flags")
    .select("id, severity, type, title, description, status, updated_at, created_at")
    .eq("org_id", org.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
