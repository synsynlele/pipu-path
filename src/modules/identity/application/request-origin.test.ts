import { describe, expect, it } from "vitest";
import { resolveTrustedRequestOrigin } from "./request-origin";

function requestHeaders(values: Record<string, string>) {
  return new Headers(values);
}

describe("trusted OAuth request origin", () => {
  it("uses the exact Vercel Preview origin", () => {
    expect(
      resolveTrustedRequestOrigin(
        requestHeaders({
          "x-forwarded-host": "pipu-path-git-agent-stage10.vercel.app",
          "x-forwarded-proto": "https",
        }),
        "https://pipu-path.vercel.app",
      ),
    ).toBe("https://pipu-path-git-agent-stage10.vercel.app");
  });

  it("allows localhost development", () => {
    expect(
      resolveTrustedRequestOrigin(
        requestHeaders({ host: "localhost:3000", "x-forwarded-proto": "http" }),
        "http://localhost:3000",
      ),
    ).toBe("http://localhost:3000");
  });

  it("rejects a spoofed host and falls back to configured application origin", () => {
    expect(
      resolveTrustedRequestOrigin(
        requestHeaders({
          "x-forwarded-host": "attacker.example",
          "x-forwarded-proto": "https",
        }),
        "https://pipu-path.vercel.app",
      ),
    ).toBe("https://pipu-path.vercel.app");
  });
});
