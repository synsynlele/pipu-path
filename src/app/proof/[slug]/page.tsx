import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicPortfolioBySlug } from "@/modules/portfolio/infrastructure/portfolio-dal";
import { PublicProofView } from "@/modules/portfolio/ui/public-proof-view";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const proof = await getPublicPortfolioBySlug(slug);
  if (!proof) return { title: "Project proof unavailable" };
  return {
    title: proof.public_title,
    description: proof.public_summary,
    robots: { index: false, follow: false },
  };
}

export default async function PublicProjectProofPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const proof = await getPublicPortfolioBySlug(slug);
  if (!proof) notFound();
  return <PublicProofView proof={proof} />;
}
