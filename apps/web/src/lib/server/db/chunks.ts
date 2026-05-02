import { z } from "zod";

import { requireOrgAccess } from "@/lib/server/db/shared";

const searchChunksSchema = z.object({
  embedding: z.array(z.number()).length(1024),
  matchCount: z.number().int().positive().max(20).default(8),
  matchThreshold: z.number().min(0).max(1).nullable().optional(),
  orgSlug: z.string().trim().min(1),
});

export async function searchChunks(
  orgSlugInput: string,
  embeddingInput: number[],
  options?: {
    matchCount?: number;
    matchThreshold?: number | null;
  }
) {
  const { embedding, matchCount, matchThreshold, orgSlug } = searchChunksSchema.parse({
    orgSlug: orgSlugInput,
    embedding: embeddingInput,
    matchCount: options?.matchCount ?? 8,
    matchThreshold: options?.matchThreshold,
  });
  const { supabase, org } = await requireOrgAccess(orgSlug);

  const { data, error } = await supabase.rpc("match_chunks", {
    target_org_id: org.id,
    query_embedding: embedding,
    match_count: matchCount,
    match_threshold: matchThreshold ?? null,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
