import type { Metadata } from "next";
import { CityEpisode } from "@/modules/city/ui/city-episode";

export const metadata: Metadata = {
  title: "The Unbuilt City · Play",
  robots: { index: false, follow: false },
};

export default function CityPage() {
  return <CityEpisode />;
}
