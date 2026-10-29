import { redirect } from "next/navigation";

// The city has one canonical signed-in Play entry.
export default function AdventureHubPage() {
  redirect("/build/play");
}
