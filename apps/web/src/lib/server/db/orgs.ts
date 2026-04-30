import { z } from "zod";

import type { Database } from "@/lib/supabase/database.types";
import { NotFoundError } from "@/lib/server/db/errors";
import {
  normalizeCount,
  requireAuthenticatedContext,
  requireOrgAccess,
} from "@/lib/server/db/shared";

type OrganizationRow = Database["public"]["Tables"]["organizations"]["Row"];

const orgSlugSchema = z
  .string()
  .trim()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export async function getAccessibleOrganizationsForUser() {
  const { supabase, user } = await requireAuthenticatedContext();
  const { data: memberships, error: membershipsError } = await supabase
    .from("memberships")
    .select("org_id, role, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (membershipsError) {
    throw new Error(membershipsError.message);
  }

  if (!memberships.length) {
    return [];
  }

  const orgIds = memberships.map((membership) => membership.org_id);
  const { data: organizations, error: organizationsError } = await supabase
    .from("organizations")
    .select("id, name, slug, created_at, updated_at")
    .in("id", orgIds);

  if (organizationsError) {
    throw new Error(organizationsError.message);
  }

  const organizationsById = new Map(
    organizations.map((organization) => [organization.id, organization])
  );

  return memberships.flatMap((membership) => {
    const organization = organizationsById.get(membership.org_id);

    if (!organization) {
      return [];
    }

    return [
      {
        organization,
        role: membership.role,
        joinedAt: membership.created_at,
      },
    ];
  });
}

export async function getDefaultOrganizationForUser() {
  const organizations = await getAccessibleOrganizationsForUser();
  const firstOrganization = organizations[0];

  if (!firstOrganization) {
    throw new NotFoundError("No organization membership exists for this user.");
  }

  return firstOrganization;
}

export async function getOrganizationBySlug(orgSlugInput: string) {
  const orgSlug = orgSlugSchema.parse(orgSlugInput);
  const { org, membership } = await requireOrgAccess(orgSlug);

  return {
    organization: org,
    membership,
  };
}

export async function getWorkspaceSnapshot(orgSlugInput: string) {
  const orgSlug = orgSlugSchema.parse(orgSlugInput);
  const { supabase, org, membership } = await requireOrgAccess(orgSlug);

  const [
    documentCountResult,
    skillCountResult,
    healthFlagCountResult,
    recentDocumentsResult,
  ] = await Promise.all([
    supabase
      .from("documents")
      .select("id", { count: "exact", head: true })
      .eq("org_id", org.id),
    supabase
      .from("skills")
      .select("id", { count: "exact", head: true })
      .eq("org_id", org.id),
    supabase
      .from("health_flags")
      .select("id", { count: "exact", head: true })
      .eq("org_id", org.id),
    supabase
      .from("documents")
      .select("id, title, source_type, source_date, created_at, updated_at")
      .eq("org_id", org.id)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  if (documentCountResult.error) {
    throw new Error(documentCountResult.error.message);
  }

  if (skillCountResult.error) {
    throw new Error(skillCountResult.error.message);
  }

  if (healthFlagCountResult.error) {
    throw new Error(healthFlagCountResult.error.message);
  }

  if (recentDocumentsResult.error) {
    throw new Error(recentDocumentsResult.error.message);
  }

  return {
    org,
    membership,
    counts: {
      documents: normalizeCount(documentCountResult.count),
      skills: normalizeCount(skillCountResult.count),
      healthFlags: normalizeCount(healthFlagCountResult.count),
    },
    recentDocuments: recentDocumentsResult.data,
  };
}

export function buildScopedProductPath(
  organization: Pick<OrganizationRow, "slug">,
  section: "graph" | "skills" | "ask" | "health"
) {
  return `/org/${organization.slug}/${section}`;
}
