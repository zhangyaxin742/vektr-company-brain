import { z } from "zod";

import { requireOrgAccess } from "@/lib/server/db/shared";

const skillsQuerySchema = z.object({
  limit: z.number().int().positive().max(50).default(25),
  orgSlug: z.string().trim().min(1),
});

export async function getWorkspaceSkills(
  orgSlugInput: string,
  options?: { limit?: number }
) {
  const { orgSlug, limit } = skillsQuerySchema.parse({
    orgSlug: orgSlugInput,
    limit: options?.limit ?? 25,
  });
  const { supabase, org } = await requireOrgAccess(orgSlug);

  const { data, error } = await supabase
    .from("skills")
    .select(
      "id, name, slug, status, version, confidence, trigger, updated_at, created_at"
    )
    .eq("org_id", org.id)
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
