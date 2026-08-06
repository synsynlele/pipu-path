import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202608060022_stage_11_connect_and_journey_continuity.sql",
  "utf8",
);
const navigation = readFileSync(
  "src/components/navigation/app-navigation.tsx",
  "utf8",
);
const connectPage = readFileSync("src/app/connect/page.tsx", "utf8");
const connectActions = readFileSync(
  "src/modules/connect/application/connect-actions.ts",
  "utf8",
);
const journeyPage = readFileSync("src/app/journey/page.tsx", "utf8");
const continuation = readFileSync(
  "src/modules/journey/application/journey-continuation.ts",
  "utf8",
);

describe("Stage 11 Builder Connect and Journey continuity", () => {
  it("creates owner-protected network tables without browser writes", () => {
    for (const table of [
      "builder_network_profiles",
      "builder_connection_requests",
      "builder_blocks",
      "builder_reports",
    ]) {
      expect(migration).toContain(
        `alter table public.${table} enable row level security`,
      );
    }
    expect(migration).toContain(
      "revoke all on public.builder_network_profiles",
    );
    expect(migration).not.toMatch(
      /grant (insert|update|delete)[\s\S]{0,180}builder_network_profiles to authenticated/i,
    );
  });

  it("limits discovery to consenting adults and excludes blocked pairs", () => {
    expect(migration).toContain("profile.age_band in ('18_24', '25_plus')");
    expect(migration).toContain("not profile.safeguarding_review_required");
    expect(migration).toContain("network.is_discoverable");
    expect(migration).toContain("builder_blocks");
    expect(connectPage).toContain("Adult-only launch boundary");
  });

  it("supports explicit connection lifecycle and safety controls", () => {
    expect(migration).toContain("send_stage11_connection_request");
    expect(migration).toContain("respond_stage11_connection_request");
    expect(migration).toContain("block_stage11_builder");
    expect(migration).toContain("report_stage11_builder");
    expect(connectActions).toContain("request-sent");
    expect(connectPage).toContain("Incoming requests");
    expect(connectPage).toContain("My Network");
  });

  it("does not introduce unrestricted messages or contact exposure", () => {
    expect(migration).not.toMatch(
      /create table public\.(messages|conversations)/i,
    );
    expect(connectPage).toContain(
      "contact details are never exposed automatically",
    );
  });

  it("adds Connect to desktop and mobile navigation", () => {
    expect(navigation).toContain(
      '{ label: "Connect", href: "/connect", icon: "connect" }',
    );
    expect(navigation).toContain("grid-cols-6");
  });

  it("preserves completed Journeys and creates numbered continuation cycles", () => {
    expect(migration).toContain("cycle_number smallint not null default 1");
    expect(migration).toContain("continuation_of_journey_id");
    expect(migration).toContain("create_stage11_journey_continuation_request");
    expect(migration).toContain("persist_stage11_journey_continuation");
    expect(journeyPage).toContain("Continue moving");
    expect(journeyPage).toContain("JourneyContinuationForm");
    expect(continuation).toContain("continuation: true");
    expect(continuation).toContain("buildContinuingEvidenceJourney");
  });
});
