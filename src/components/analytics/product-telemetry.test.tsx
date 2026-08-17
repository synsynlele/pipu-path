import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProductTelemetry } from "./product-telemetry";

const navigation = vi.hoisted(() => ({ pathname: "/app" }));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
}));

const featurePaths = [
  ["/app", "home"],
  ["/onboarding/discovery/profile", "profile"],
  ["/mission", "journey"],
  ["/journey", "journey"],
  ["/build", "build"],
  ["/quests/active", "build"],
  ["/projects/123", "build"],
  ["/portfolio", "portfolio"],
  ["/connect", "connect"],
] as const;

describe("ProductTelemetry", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    sessionStorage.clear();
    fetchMock.mockReset();
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it.each(featurePaths)("records %s as %s", async (pathname, featureKey) => {
    navigation.pathname = pathname;
    render(<ProductTelemetry />);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/product-events/feature-view",
      expect.objectContaining({
        method: "POST",
        credentials: "same-origin",
        body: JSON.stringify({ featureKey }),
        keepalive: true,
      }),
    );
  });

  it("does not record public or unrelated routes", async () => {
    navigation.pathname = "/privacy";
    render(<ProductTelemetry />);

    await Promise.resolve();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("deduplicates the same path for sixty seconds", async () => {
    navigation.pathname = "/app";
    const first = render(<ProductTelemetry />);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    first.unmount();

    render(<ProductTelemetry />);
    await Promise.resolve();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("records again after the path marker is stale", async () => {
    navigation.pathname = "/app";
    sessionStorage.setItem(
      "pipupath:feature-view:/app",
      String(Date.now() - 60_001),
    );

    render(<ProductTelemetry />);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
  });

  it("removes the dedupe marker when telemetry delivery fails", async () => {
    navigation.pathname = "/connect";
    fetchMock.mockRejectedValueOnce(new Error("offline"));

    render(<ProductTelemetry />);

    await waitFor(() => {
      expect(
        sessionStorage.getItem("pipupath:feature-view:/connect"),
      ).toBeNull();
    });
  });
});
