import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  join(
    process.cwd(),
    "supabase/migrations/20260817162335_stage_14_retention_intelligence_foundation.sql",
  ),
  "utf8",
);
const stage12Migration = readFileSync(
  join(
    process.cwd(),
    "supabase/migrations/20260813084234_stage_12_economic_pathways_mvp.sql",
  ),
  "utf8",
);
const adminDal = readFileSync(
  join(process.cwd(), "src/modules/admin/infrastructure/admin-dal.ts"),
  "utf8",
);
const adminPage = readFileSync(
  join(process.cwd(), "src/app/admin/page.tsx"),
  "utf8",
);
const telemetry = readFileSync(
  join(process.cwd(), "src/components/analytics/product-telemetry.tsx"),
  "utf8",
);
const productEvents = readFileSync(
  join(process.cwd(), "src/modules/analytics/infrastructure/product-events.ts"),
  "utf8",
);

describe("Stage 14 retention intelligence foundation", () => {
  it("keeps admin membership, audit records and product telemetry server-owned", () => {
    for (const table of ["platform_admins", "admin_audit_events"]) {
      expect(migration).toContain(`revoke all on public.${table}`);
    }
    expect(stage12Migration).toContain(
      "revoke all on public.product_events from public, anon, authenticated",
    );
    expect(migration).toContain(
      "grant select, insert, update, delete on public.platform_admins to service_role",
    );
    expect(migration).toContain(
      "grant select, insert on public.admin_audit_events to service_role",
    );
    expect(stage12Migration).not.toMatch(
      /grant\s+(select|insert|update|delete)[^;]*product_events[^;]*authenticated/i,
    );
    expect(migration).not.toMatch(
      /grant\s+(select|insert|update|delete)[^;]*product_events[^;]*authenticated/i,
    );
  });

  it("requires feature keys only for allow-listed feature-view events", () => {
    for (const feature of [
      "home",
      "profile",
      "journey",
      "build",
      "portfolio",
      "connect",
    ]) {
      expect(migration).toContain(`'${feature}'`);
      expect(productEvents).toContain(`"${feature}"`);
    }
    expect(migration).toContain("product_events_feature_key_consistency");
    expect(migration).toContain(
      "(event_name = 'feature_viewed' and feature_key is not null)",
    );
    expect(productEvents).toContain('"feature_viewed"');
  });

  it("keeps Mission Control aggregate-only and excludes private narrative fields", () => {
    const dashboardFunction =
      migration
        .split(
          "create or replace function public.get_stage14_admin_dashboard_snapshot",
        )[1]
        ?.split(
          "create or replace function public.get_stage14_admin_feature_usage",
        )[0] ?? "";

    for (const forbidden of [
      "text_response",
      "selected_options",
      "numeric_response",
      "summary",
      "description",
      "evidence_text",
      "what_i_did",
      "what_happened",
      "what_i_learned",
      "nortnspoil_reflection",
      "problem_statement",
      "progress_note",
      "contact_email",
      "contact_whatsapp",
      "possible_paths",
      "earn_from_strengths",
    ]) {
      expect(dashboardFunction).not.toContain(forbidden);
    }

    expect(migration).toContain(
      "revoke all on function public.get_stage14_admin_dashboard_snapshot(integer)",
    );
    expect(migration).toContain(
      "revoke all on function public.get_stage14_admin_feature_usage(integer)",
    );
  });

  it("authorizes admin access server-side before service-role aggregate reads", () => {
    const membershipCheck = adminDal.indexOf('.from("platform_admins")');
    const snapshotRead = adminDal.indexOf(
      'service.rpc("get_stage14_admin_dashboard_snapshot"',
    );
    expect(membershipCheck).toBeGreaterThan(-1);
    expect(snapshotRead).toBeGreaterThan(membershipCheck);
    expect(adminDal).toContain('.eq("status", "active")');
    expect(adminDal).toContain('operation: "admin_dashboard_viewed"');
    expect(adminPage).toContain('if (state.access === "forbidden") notFound()');
  });

  it("records only an allow-listed feature key from authenticated product routes", () => {
    expect(telemetry).toContain('fetch("/api/product-events/feature-view"');
    expect(telemetry).toContain("body: JSON.stringify({ featureKey })");
    expect(telemetry).not.toContain("document.cookie");
    expect(telemetry).not.toContain("localStorage");
    expect(productEvents).toContain("recordCurrentUserFeatureView");
    expect(productEvents).toContain("server.auth.getUser()");
    expect(productEvents).toContain('{ telemetryVersion: "stage14-v1" }');
  });

  it("labels repeat usage separately from cohort retention", () => {
    expect(adminPage).toContain("Repeat Builders");
    expect(adminPage).toContain("used PipuPath on 2+ days");
    expect(adminPage).toContain("Day-7 and Day-30 retention");
    expect(adminPage).toContain("PipuPath will not");
    expect(adminPage).toContain(
      "pretend it has historical feature-retention data that was never",
    );
    expect(adminPage).toContain("captured.");
  });
});
