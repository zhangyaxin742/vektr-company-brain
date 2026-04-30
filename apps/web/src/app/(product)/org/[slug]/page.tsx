import { redirect } from "next/navigation";

type OrgIndexPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function OrgIndexPage({ params }: OrgIndexPageProps) {
  const { slug } = await params;

  redirect(`/org/${slug}/graph`);
}
