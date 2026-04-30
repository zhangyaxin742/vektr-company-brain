import "server-only";

import { getServerEnvResult, getServerEnvSummary } from "@/lib/env/server";
import { createNeo4jDriver } from "@/lib/server/neo4j";
import type { ConnectorStatus } from "@/lib/types";

async function checkSupabaseProject(): Promise<ConnectorStatus> {
  const env = getServerEnvResult();

  if (!env.success) {
    return {
      name: "Supabase project",
      state: "not_configured",
      summary: "Environment variables are incomplete.",
      detail: env.error.issues.map((issue) => issue.message).join(" "),
    };
  }

  if (
    !env.data.NEXT_PUBLIC_SUPABASE_URL ||
    !env.data.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ) {
    return {
      name: "Supabase project",
      state: "not_configured",
      summary: "Add the Supabase project URL and publishable key.",
    };
  }

  try {
    const response = await fetch(
      new URL("/auth/v1/settings", env.data.NEXT_PUBLIC_SUPABASE_URL),
      {
        headers: {
          apikey: env.data.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return {
        name: "Supabase project",
        state: "error",
        summary: `Supabase returned HTTP ${response.status}.`,
        detail: "Check the URL and publishable key in apps/web/.env.local.",
      };
    }

    return {
      name: "Supabase project",
      state: "ready",
      summary: "Project URL and publishable key are reachable from the app.",
      detail:
        "The worker performs the direct Supabase Postgres connectivity check.",
    };
  } catch (error) {
    return {
      name: "Supabase project",
      state: "error",
      summary: "Could not reach the Supabase project from the Next.js server.",
      detail: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function checkNeo4j(): Promise<ConnectorStatus> {
  const env = getServerEnvResult();

  if (!env.success) {
    return {
      name: "Neo4j AuraDB",
      state: "not_configured",
      summary: "Environment variables are incomplete.",
      detail: env.error.issues.map((issue) => issue.message).join(" "),
    };
  }

  if (!env.data.NEO4J_URI || !env.data.NEO4J_USERNAME || !env.data.NEO4J_PASSWORD) {
    return {
      name: "Neo4j AuraDB",
      state: "not_configured",
      summary: "Add the Neo4j URI, username, and password.",
    };
  }

  const driver = createNeo4jDriver({
    uri: env.data.NEO4J_URI,
    username: env.data.NEO4J_USERNAME,
    password: env.data.NEO4J_PASSWORD,
  });

  try {
    await driver.verifyConnectivity();

    return {
      name: "Neo4j AuraDB",
      state: "ready",
      summary: "The Next.js server can reach Neo4j over the official driver.",
      detail: "Aura typically uses a neo4j+s:// URI with CA-signed TLS.",
    };
  } catch (error) {
    return {
      name: "Neo4j AuraDB",
      state: "error",
      summary: "Could not connect to Neo4j from the Next.js server.",
      detail: error instanceof Error ? error.message : "Unknown error",
    };
  } finally {
    await driver.close();
  }
}

export async function getConnectorStatuses() {
  return Promise.all([checkSupabaseProject(), checkNeo4j()]);
}

export function getEnvironmentStatus() {
  return getServerEnvSummary();
}
