import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/graph";

  if (!code) {
    const signInUrl = new URL("/auth/sign-in", request.url);
    signInUrl.searchParams.set("next", next);
    signInUrl.searchParams.set("error", "missing-code");

    return NextResponse.redirect(signInUrl);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const signInUrl = new URL("/auth/sign-in", request.url);
    signInUrl.searchParams.set("next", next);
    signInUrl.searchParams.set("error", error.message);

    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.redirect(new URL(next, request.url));
}
