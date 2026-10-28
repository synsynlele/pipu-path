import { expect, it } from "vitest";
import config from "../../../next.config";

it("allows the bundled game across app navigation while keeping other pages unframeable", async () => {
  const rules = await config.headers!();
  const defaults = rules.find((r) => r.source === "/(.*)")!;
  const game = rules.find((r) => r.source === "/games/city/:path*")!;
  const value = (headers: { key: string; value: string }[], key: string) =>
    headers.find((h) => h.key === key)?.value;
  expect(value(defaults.headers, "Content-Security-Policy")).toContain(
    "frame-ancestors 'none'",
  );
  expect(value(defaults.headers, "X-Frame-Options")).toBe("DENY");
  expect(value(defaults.headers, "Content-Security-Policy")).toContain(
    "frame-src 'self'",
  );
  expect(value(defaults.headers, "Content-Security-Policy")).toContain(
    "frame-ancestors 'none'",
  );
  expect(value(game.headers, "Content-Security-Policy")).toContain(
    "frame-ancestors 'self'",
  );
  expect(value(game.headers, "X-Frame-Options")).toBe("SAMEORIGIN");
});
