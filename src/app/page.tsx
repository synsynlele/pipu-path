import Link from "next/link";
import { PowerDistrictFrame } from "@/modules/city/ui/power-district-frame";

export default function HomePage() {
  return (
    <main id="main-content" className="min-h-svh bg-[#102c34]">
      <h1 className="sr-only">PipuPath · The Unbuilt City</h1>
      <PowerDistrictFrame
        questHref="/real-quests"
        questLabel="Start my real Quest"
        welcome
      />
      <noscript>
        <p>
          The city needs JavaScript.{" "}
          <Link href="/real-quests">Continue my journey</Link>
        </p>
      </noscript>
    </main>
  );
}
