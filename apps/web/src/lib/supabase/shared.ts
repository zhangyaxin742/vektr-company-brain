import { getPublicEnv } from "@/lib/env/public";

export function getSupabaseEnv() {
  const env = getPublicEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY."
    );
  }

  return { url, publishableKey };
}

export function getAppUrl() {
  return getPublicEnv().NEXT_PUBLIC_APP_URL ?? "http://127.0.0.1:3000";
}
