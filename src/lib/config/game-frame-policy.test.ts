import { expect, it } from "vitest";
import config from "../../../next.config";

it("allows same-origin game framing only on city routes and the game's own document", async () => {
  const rules = await config.headers!();
  const defaults = rules.find((r) => r.source === "/(.*)")!;
  const parent = rules.find(
    (r) => r.source === "/build/:city(play|power-district)",
  )!;
  const game = rules.find((r) => r.source === "/games/power-district/:path*")!;
  const value = (headers: { key: string; value: string }[], key: string) =>
    headers.find((h) => h.key === key)?.value;
  expect(value(defaults.headers, "Content-Security-Policy")).toContain(
    "frame-ancestors 'none'",
  );
  expect(value(defaults.headers, "X-Frame-Options")).toBe("DENY");
  expect(value(parent.headers, "Content-Security-Policy")).toContain(
    "frame-src 'self'",
  );
  expect(value(parent.headers, "Content-Security-Policy")).toContain(
    "frame-ancestors 'none'",
  );
  expect(value(game.headers, "Content-Security-Policy")).toContain(
    "frame-ancestors 'self'",
  );
  expect(value(game.headers, "X-Frame-Options")).toBe("SAMEORIGIN");
});
