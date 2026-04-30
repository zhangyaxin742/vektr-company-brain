import { requireOrgAccess } from "@/lib/server/db/shared";

export async function getGraphWorkspace(orgSlug: string) {
  const { org, membership } = await requireOrgAccess(orgSlug);

  return {
    organization: org,
    membership,
    nodes: [],
    edges: [],
  };
}
