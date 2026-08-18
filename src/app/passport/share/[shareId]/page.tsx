import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";
import { PublicPassportShare } from "@/modules/passport/ui/public-passport-share";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Builder Passport verification",
  description: "Verify a Builder-selected PipuPath evidence snapshot.",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function BuilderPassportSharePage({
  params,
}: {
  params: Promise<{ shareId: string }>;
}) {
  const { shareId: rawShareId } = await params;
  const shareId = z.uuid().safeParse(rawShareId);
  if (!shareId.success) notFound();

  return <PublicPassportShare shareId={shareId.data} />;
}
