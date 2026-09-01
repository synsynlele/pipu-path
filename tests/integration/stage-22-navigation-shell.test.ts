import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(path, "utf8");
const navigation = read("src/components/navigation/app-navigation.tsx");
const missionLayout = read("src/app/mission/layout.tsx");
const journeyLayout = read("src/app/journey/layout.tsx");
const connectLayout = read("src/app/connect/layout.tsx");

describe("Stage 22 application navigation shell", () => {
  it("keeps the authenticated application navigation contract while allowing a later presentation authority", () => {
    for (const label of ["Home", "Build", "Connect"]) {
      expect(navigation).toContain(`label: "${label}"`);
    }
    expect(navigation).toContain('"PipuPath application"');
    expect(navigation).toContain('"PipuPath mobile navigation"');
  });

  it("keeps Mission, Journey and Connect inside the authenticated application shell", () => {
    for (const layout of [missionLayout, journeyLayout, connectLayout]) {
      expect(layout).toContain("AppShell");
      expect(layout).toContain("requireAuthenticatedIdentity");
      expect(layout).toContain("await requireAuthenticatedIdentity()");
    }

    expect(connectLayout).toContain("Builder Network");
    expect(connectLayout).toContain("Collaborations");
  });
});
