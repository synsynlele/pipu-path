import { redirect } from "next/navigation";
import { resolveAuthenticatedDestination } from "@/modules/identity/infrastructure/progress-dal";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Continue your journey",
  robots: { index: false, follow: false },
};

export default async function ContinuePage() {
  redirect(await resolveAuthenticatedDestination());
}
