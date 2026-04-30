import { z } from "zod";

import type { Json } from "@/lib/supabase/database.types";
import { requireOrgAccess } from "@/lib/server/db/shared";

const createAskLogSchema = z.object({
  answer: z.custom<Json>((value) => value !== undefined),
  citationChunkIds: z.array(z.string().uuid()).default([]),
  orgSlug: z.string().trim().min(1),
  question: z.string().trim().min(1).max(4000),
});

export async function createAskLog(input: {
  answer: Json;
  citationChunkIds?: string[];
  orgSlug: string;
  question: string;
}) {
  const parsedInput = createAskLogSchema.parse(input);
  const { supabase, org, user } = await requireOrgAccess(parsedInput.orgSlug);

  const { data, error } = await supabase
    .from("ask_logs")
    .insert({
      answer: parsedInput.answer,
      citation_chunk_ids: parsedInput.citationChunkIds,
      org_id: org.id,
      question: parsedInput.question,
      user_id: user.id,
    })
    .select("id, org_id, user_id, question, answer, citation_chunk_ids, created_at")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
