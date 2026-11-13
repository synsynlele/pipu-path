import type { Metadata } from "next";
import Link from "next/link";
import { BuildHero } from "@/modules/real-build/ui/build-hero";
import { getFinancialPathwayState } from "@/modules/builder-intelligence/infrastructure/financial-dal";
import { FinancialPathwayExperience } from "@/modules/builder-intelligence/ui/financial-pathway-experience";

export const metadata: Metadata = {
  title: "Financial Intelligence · PipuPath",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function FinancePage({
  searchParams,
}: {
  searchParams: Promise<{ stage?: string }>;
}) {
  const [state, params] = await Promise.all([
    getFinancialPathwayState(),
    searchParams,
  ]);
  return (
    <main id="main-content">
      <BuildHero
        eyebrow="BUILDER INTELLIGENCE"
        title="Financial Intelligence"
        description="Make thoughtful money decisions, practise without spending, and keep honest evidence of what you try."
      />
      <div className="journey-body">
        <Link
          href="/real-quests"
          className="mt-4 inline-block py-3 text-sm font-bold"
        >
          ← Real Quests
        </Link>
      </div>
      <FinancialPathwayExperience {...state} initialStageCode={params.stage} />
    </main>
  );
}
