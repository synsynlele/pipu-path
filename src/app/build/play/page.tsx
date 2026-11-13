import type { Metadata } from "next";
import { UnbuiltCityExperience } from "@/modules/city/ui/unbuilt-city-experience";
import { requireAuthenticatedIdentity } from "@/modules/identity/infrastructure/identity-dal";

export const metadata: Metadata = {
  title: "The Unbuilt City · Play",
  robots: { index: false, follow: false },
};
export default async function CityPage() {
  const identity = await requireAuthenticatedIdentity();
  return (
    <UnbuiltCityExperience
      questHref="/real-quests"
      questLabel="Real Quests →"
      financeAgeBand={identity.profile.age_band}
      cloudEligible
    />
  );
}
