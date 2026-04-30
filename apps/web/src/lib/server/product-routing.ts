import { redirect } from "next/navigation";

import {
  AuthenticationError,
  NotFoundError,
} from "@/lib/server/db/errors";
import {
  buildScopedProductPath,
  getDefaultOrganizationForUser,
} from "@/lib/server/db/orgs";

export async function redirectToDefaultProductRoute(
  section: "graph" | "skills" | "ask" | "health"
) {
  try {
    const { organization } = await getDefaultOrganizationForUser();
    redirect(buildScopedProductPath(organization, section));
  } catch (error) {
    if (error instanceof AuthenticationError || error instanceof NotFoundError) {
      redirect(`/auth/sign-in?next=/${section}`);
    }

    throw error;
  }
}
