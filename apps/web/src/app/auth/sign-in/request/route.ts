import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import type { Database } from "@/lib/supabase/database.types";
import { getAppUrl, getSupabaseEnv } from "@/lib/supabase/shared";

function normalizeNextPath(nextInput: string) {
  return nextInput.startsWith("/") ? nextInput : "/graph";
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const next = normalizeNextPath(String(formData.get("next") ?? "/graph").trim());

  if (!email) {
    return NextResponse.redirect(
      new URL(`/auth/sign-in?next=${encodeURIComponent(next)}&error=missing-email`, request.url)
    );
  }

  const { url, publishableKey } = getSupabaseEnv();
  const supabase = createClient<Database>(url, publishableKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  const redirectUrl = new URL("/auth/callback", getAppUrl());
  redirectUrl.searchParams.set("next", next);

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectUrl.toString(),
    },
  });

  const responseUrl = new URL("/auth/sign-in", request.url);
  responseUrl.searchParams.set("next", next);

  if (error) {
    responseUrl.searchParams.set("error", error.message);
  } else {
    responseUrl.searchParams.set("sent", "1");
    responseUrl.searchParams.set("email", email);
  }

  return NextResponse.redirect(responseUrl);
}
