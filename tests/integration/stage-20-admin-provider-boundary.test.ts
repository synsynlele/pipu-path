import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const adminProvidersPage = fs.readFileSync(
  path.join(root, "src/app/admin/providers/page.tsx"),
  "utf8",
);

describe("Stage 20 provider admin boundary", () => {
  it("maps the authoritative opportunity-admin denial to a hidden route", () => {
    expect(adminProvidersPage).toContain(
      'error.message.includes("OPPORTUNITY_ADMIN_REQUIRED")',
    );
    expect(adminProvidersPage).not.toContain("PLATFORM_ADMIN_REQUIRED");
    expect(adminProvidersPage).toContain("notFound()");
  });
});
