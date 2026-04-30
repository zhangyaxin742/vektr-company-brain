import "server-only";

import { z } from "zod";

import { getPublicEnvResult, publicEnvSchema } from "@/lib/env/public";

const serverEnvSchema = publicEnvSchema.extend({
  FASTAPI_WORKER_URL: z.string().url().default("http://127.0.0.1:8000"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  NEO4J_URI: z
    .string()
    .min(1)
    .refine(
      (value) =>
        value.startsWith("neo4j://") ||
        value.startsWith("neo4j+s://") ||
        value.startsWith("neo4j+ssc://") ||
        value.startsWith("bolt://") ||
        value.startsWith("bolt+s://") ||
        value.startsWith("bolt+ssc://"),
      {
        message: "NEO4J_URI must use a Neo4j-supported URI scheme.",
      },
    )
    .optional(),
  NEO4J_USERNAME: z.string().min(1).optional(),
  NEO4J_PASSWORD: z.string().min(1).optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function getServerEnvResult() {
  const publicEnv = getPublicEnvResult();

  return serverEnvSchema.safeParse({
    NEXT_PUBLIC_APP_URL: publicEnv.success ? publicEnv.data.NEXT_PUBLIC_APP_URL : process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_URL: publicEnv.success ? publicEnv.data.NEXT_PUBLIC_SUPABASE_URL : process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: publicEnv.success
      ? publicEnv.data.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
      : process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    FASTAPI_WORKER_URL:
      process.env.FASTAPI_WORKER_URL ?? "http://127.0.0.1:8000",
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    NEO4J_URI: process.env.NEO4J_URI,
    NEO4J_USERNAME: process.env.NEO4J_USERNAME,
    NEO4J_PASSWORD: process.env.NEO4J_PASSWORD,
  });
}

export function getServerEnv() {
  return serverEnvSchema.parse({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    FASTAPI_WORKER_URL:
      process.env.FASTAPI_WORKER_URL ?? "http://127.0.0.1:8000",
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    NEO4J_URI: process.env.NEO4J_URI,
    NEO4J_USERNAME: process.env.NEO4J_USERNAME,
    NEO4J_PASSWORD: process.env.NEO4J_PASSWORD,
  });
}

export function getServerEnvSummary() {
  const result = getServerEnvResult();

  if (!result.success) {
    return {
      valid: false,
      fastapiWorkerUrl: process.env.FASTAPI_WORKER_URL ?? "http://127.0.0.1:8000",
      missingKeys: result.error.issues.map((issue) => issue.path.join(".")),
    };
  }

  const env = result.data;

  return {
    valid: true,
    fastapiWorkerUrl: env.FASTAPI_WORKER_URL,
    missingKeys: [
      !env.NEXT_PUBLIC_APP_URL && "NEXT_PUBLIC_APP_URL",
      !env.NEXT_PUBLIC_SUPABASE_URL && "NEXT_PUBLIC_SUPABASE_URL",
      !env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY &&
        "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      !env.SUPABASE_SERVICE_ROLE_KEY && "SUPABASE_SERVICE_ROLE_KEY",
      !env.NEO4J_URI && "NEO4J_URI",
      !env.NEO4J_USERNAME && "NEO4J_USERNAME",
      !env.NEO4J_PASSWORD && "NEO4J_PASSWORD",
    ].filter(Boolean) as string[],
  };
}
