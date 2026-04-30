import { z } from "zod";

import type { Database } from "@/lib/supabase/database.types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
} from "@/lib/server/db/errors";

const orgSlugSchema = z
  .string()
  .trim()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export type OrganizationRow = Database["public"]["Tables"]["organizations"]["Row"];
export type MembershipRow = Database["public"]["Tables"]["memberships"]["Row"];

export async function requireAuthenticatedContext() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw new AuthenticationError(error.message);
  }

  if (!user) {
    throw new AuthenticationError();
  }

  return { supabase, user };
}

export async function requireOrgAccess(orgSlugInput: string) {
  const orgSlug = orgSlugSchema.parse(orgSlugInput);
  const { supabase, user } = await requireAuthenticatedContext();

  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .select("id, name, slug, created_at, updated_at")
    .eq("slug", orgSlug)
    .maybeSingle();

  if (orgError) {
    throw new AuthorizationError(orgError.message);
  }

  if (!org) {
    throw new NotFoundError();
  }

  const { data: membership, error: membershipError } = await supabase
    .from("memberships")
    .select("id, org_id, user_id, role, created_at")
    .eq("org_id", org.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (membershipError) {
    throw new AuthorizationError(membershipError.message);
  }

  if (!membership) {
    throw new AuthorizationError();
  }

  return { supabase, user, org, membership };
}

export function normalizeCount(count: number | null) {
  return count ?? 0;
}
