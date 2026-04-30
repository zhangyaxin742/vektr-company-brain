import Link from "next/link";
import { redirect } from "next/navigation";

import { BasicButton } from "@/components/ui/vektr-button";
import { getDefaultOrganizationForUser } from "@/lib/server/db/orgs";
import {
  AuthenticationError,
  NotFoundError,
} from "@/lib/server/db/errors";
import { buildScopedProductPath } from "@/lib/server/db/orgs";

type SignInPageProps = {
  searchParams: Promise<{
    email?: string;
    error?: string;
    next?: string;
    sent?: string;
  }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;

  try {
    const { organization } = await getDefaultOrganizationForUser();
    redirect(buildScopedProductPath(organization, "graph"));
  } catch (error) {
    if (!(error instanceof AuthenticationError) && !(error instanceof NotFoundError)) {
      throw error;
    }
  }

  const next = params.next ?? "/graph";
  const email = params.email ?? "";
  const sent = params.sent === "1";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[620px] items-center px-5 py-12 sm:px-8">
      <section className="surface-panel w-full space-y-6 px-6 py-7 sm:px-8 sm:py-8">
        <div className="space-y-3">
          <Link href="/" className="inline-flex items-center gap-3 text-white">
            <span className="inline-flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/6 text-sm font-medium text-white">
              V
            </span>
            <span className="type-body-lg-400">Vektr</span>
          </Link>
          <div className="space-y-2">
            <p className="type-label text-white/50">Workspace authentication</p>
            <h1 className="type-heading-04 text-white">Sign in to your organization.</h1>
            <p className="type-body-xxl-300 text-white/60">
              Magic-link auth is enabled for the first database and RLS slice. All
              product routes stay behind membership-aware Supabase policies.
            </p>
          </div>
        </div>

        <form action="/auth/sign-in/request" method="post" className="space-y-4">
          <input type="hidden" name="next" value={next} />
          <label className="block space-y-2">
            <span className="type-label text-white/55">Work email</span>
            <input
              type="email"
              name="email"
              defaultValue={email}
              required
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-white/30"
              placeholder="you@company.com"
            />
          </label>
          <BasicButton type="submit">Send magic link</BasicButton>
        </form>

        {sent ? (
          <p className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 type-body-lg-300 text-emerald-100">
            Magic link sent to {email || "your inbox"}.
          </p>
        ) : null}

        {params.error ? (
          <p className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 type-body-lg-300 text-amber-100">
            {params.error}
          </p>
        ) : null}
      </section>
    </main>
  );
}
