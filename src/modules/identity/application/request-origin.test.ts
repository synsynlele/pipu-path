import { describe, expect, it } from "vitest";
import {
  previewGoogleHandoffOrigin,
  resolveTrustedRequestOrigin,
} from "./request-origin";

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

  it("keeps the PipuPath Vercel preview domain instead of the production origin", () => {
    const previewHost =
      "pipu-path-git-feat-unbuilt-cit-3cc555-copyartint-2860s-projects.vercel.app";
    expect(
      resolveTrustedRequestOrigin(
        requestHeaders({
          host: previewHost,
          "x-forwarded-host": previewHost,
          "x-forwarded-proto": "https",
        }),
        "https://www.pipupath.name.ng",
      ),
    ).toBe(`https://${previewHost}`);
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

describe("stable preview Google OAuth handoff", () => {
  const branchHost =
    "pipu-path-git-feat-unbuilt-cit-3cc555-copyartint-2860s-projects.vercel.app";

  it("moves per-commit preview login to the branch alias", () => {
    expect(
      previewGoogleHandoffOrigin(
        "pipu-path-iucl6yxng-copyartint-2860s-projects.vercel.app",
        branchHost,
        "preview",
      ),
    ).toBe(`https://${branchHost}`);
  });

  it("keeps the branch alias, production, and localhost unchanged", () => {
    expect(
      previewGoogleHandoffOrigin(branchHost, branchHost, "preview"),
    ).toBeNull();
    expect(
      previewGoogleHandoffOrigin("www.pipupath.name.ng", branchHost, "preview"),
    ).toBeNull();
    expect(
      previewGoogleHandoffOrigin(
        "pipu-path-sample.vercel.app",
        branchHost,
        "production",
      ),
    ).toBeNull();
    expect(
      previewGoogleHandoffOrigin("localhost", branchHost, "preview"),
    ).toBeNull();
  });

  it("refuses untrusted branch hostname values", () => {
    expect(
      previewGoogleHandoffOrigin(
        "pipu-path-sample.vercel.app",
        "another.example.com",
        "preview",
      ),
    ).toBeNull();
  });
});
