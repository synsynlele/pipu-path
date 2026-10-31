import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PowerDistrictFrame } from "./power-district-frame";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
afterEach(() => {
  cleanup();
  push.mockClear();
});

describe("City to Quest handoff", () => {
  it("opens the welcome city once and reveals controls only after its own start signal", () => {
    render(
      <PowerDistrictFrame
        questHref="/real-quests"
        questLabel="Real Quests"
        welcome
      />,
    );
    expect(screen.getByRole("link", { name: "Sign in ↗" })).toHaveAttribute(
      "href",
      "/login?next=%2Freal-quests",
    );
    const frame = screen.getByTitle(
      "The Unbuilt City · 14 connected districts",
    ) as HTMLIFrameElement;
    expect(screen.queryByRole("button", { name: "Real Quests" })).toBeNull();
    fireEvent(
      window,
      new MessageEvent("message", {
        origin: window.location.origin,
        source: window,
        data: { type: "pipupath:city:state", entered: true },
      }),
    );
    expect(screen.queryByRole("button", { name: "Real Quests" })).toBeNull();
    fireEvent(
      window,
      new MessageEvent("message", {
        origin: window.location.origin,
        source: frame.contentWindow,
        data: { type: "pipupath:city:state", entered: true, saved: false },
      }),
    );
    expect(screen.getByRole("button", { name: "Real Quests" })).toBeVisible();
    expect(screen.queryByRole("link", { name: "Sign in ↗" })).toBeNull();
    expect(screen.getByTitle("The Unbuilt City · 14 connected districts")).toBe(
      frame,
    );
    expect(push).not.toHaveBeenCalled();
  });
  it("floats readable controls over one city without a solid header or duplicate label", () => {
    render(
      <PowerDistrictFrame
        questHref="/real-quests"
        questLabel="Start my real Quest"
      />,
    );
    expect(screen.queryByText("Play & build")).not.toBeInTheDocument();
    expect(screen.getByTestId("city-overlay-controls")).toHaveClass(
      "absolute",
      "bg-transparent",
      "pointer-events-none",
    );
    expect(
      screen.getByRole("button", { name: "Start my real Quest" }),
    ).toHaveClass("bg-transparent");
    expect(
      screen.queryByRole("button", { name: "Close focus view" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Focus on my city ↗" }),
    ).not.toBeInTheDocument();
    const frame = screen.getByTitle(
      "The Unbuilt City · 14 connected districts",
    );
    expect(frame).toHaveClass("min-h-0", "flex-1");
    expect(frame.parentElement).toHaveClass("fixed", "inset-0");
  });
  it("hides play controls on an authenticated entrance signal and restores the same iframe on continue", () => {
    render(
      <PowerDistrictFrame
        questHref="/real-quests"
        questLabel="Real Quests"
        welcome
      />,
    );
    const frame = screen.getByTitle(
      "The Unbuilt City · 14 connected districts",
    ) as HTMLIFrameElement;
    const signal = (entered: boolean) =>
      fireEvent(
        window,
        new MessageEvent("message", {
          origin: window.location.origin,
          source: frame.contentWindow,
          data: { type: "pipupath:city:state", entered, saved: false },
        }),
      );
    signal(true);
    expect(screen.getByRole("button", { name: "Real Quests" })).toBeVisible();
    signal(false);
    expect(screen.queryByRole("button", { name: "Real Quests" })).toBeNull();
    expect(screen.getByTitle("The Unbuilt City · 14 connected districts")).toBe(
      frame,
    );
    signal(true);
    expect(screen.getByRole("button", { name: "Real Quests" })).toBeVisible();
    expect(screen.getByTitle("The Unbuilt City · 14 connected districts")).toBe(
      frame,
    );
    expect(push).not.toHaveBeenCalled();
  });
  it("places signed-in backup controls inside the iframe City menu, not the top overlay", () => {
    vi.stubGlobal("fetch", vi.fn());
    render(
      <PowerDistrictFrame
        questHref="/real-quests"
        questLabel="Real Quests"
        cloudEligible
      />,
    );
    const frame = screen.getByTitle(
      "The Unbuilt City · 14 connected districts",
    ) as HTMLIFrameElement;
    const slot = frame.contentDocument!.createElement("div");
    slot.id = "account-backup-slot";
    const doc = frame.contentDocument!;
    if (!doc.documentElement) doc.append(doc.createElement("html"));
    if (!doc.body) doc.documentElement.append(doc.createElement("body"));
    doc.body.append(slot);
    fireEvent.load(frame);
    expect(slot.querySelector(".city-cloud-controls")).not.toBeNull();
    expect(
      screen
        .getByTestId("city-overlay-controls")
        .querySelector(".city-cloud-controls"),
    ).toBeNull();
    fireEvent(
      window,
      new MessageEvent("message", {
        origin: window.location.origin,
        source: frame.contentWindow,
        data: {
          type: "pipupath:city:state",
          entered: true,
          focusedPuzzle: true,
        },
      }),
    );
    expect(screen.queryByRole("button", { name: "Real Quests" })).toBeNull();
    fireEvent(
      window,
      new MessageEvent("message", {
        origin: window.location.origin,
        source: frame.contentWindow,
        data: {
          type: "pipupath:city:state",
          entered: true,
          focusedPuzzle: false,
        },
      }),
    );
    expect(screen.getByRole("button", { name: "Real Quests" })).toBeVisible();
    vi.unstubAllGlobals();
  });
  it("shows an explicit save/discard choice without converting game progress to proof", () => {
    render(
      <PowerDistrictFrame questHref="/real-quests" questLabel="Real Quests" />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Real Quests" }));
    expect(
      screen.getByRole("dialog", { name: "Continue to a real Quest" }),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Save my city, then continue" }),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Continue without saving" }),
    ).toBeVisible();
    expect(push).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Stay in my city" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
  it("never invents a real Quest when a player explicitly leaves without saving", () => {
    render(
      <PowerDistrictFrame questHref="/real-quests" questLabel="Real Quests" />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Real Quests" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Continue without saving" }),
    );
    expect(push).toHaveBeenCalledWith("/real-quests");
  });
  it("stays in focus mode after Escape without remounting the city or trapping real-world navigation", () => {
    render(
      <PowerDistrictFrame questHref="/real-quests" questLabel="Real Quests" />,
    );
    const iframe = screen.getByTitle(
      "The Unbuilt City · 14 connected districts",
    );
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.getByTitle("The Unbuilt City · 14 connected districts")).toBe(
      iframe,
    );
    expect(iframe.parentElement).toHaveClass("fixed", "inset-0");
    expect(
      screen.queryByRole("button", { name: /focus view|focus on my city/i }),
    ).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Real Quests" }));
    expect(
      screen.getByRole("dialog", { name: "Continue to a real Quest" }),
    ).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Stay in my city" }));
    expect(iframe.parentElement).toHaveClass("fixed", "inset-0");
  });
  it("ignores forged state and saves only after explicit consent, retaining the city on storage failure", () => {
    render(
      <PowerDistrictFrame questHref="/real-quests" questLabel="Real Quests" />,
    );
    const frame = screen.getByTitle(
      "The Unbuilt City · 14 connected districts",
    ) as HTMLIFrameElement;
    fireEvent(
      window,
      new MessageEvent("message", {
        origin: window.location.origin,
        source: window,
        data: { type: "pipupath:city:state", saved: true },
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Real Quests" }));
    expect(screen.getByRole("dialog")).toBeVisible();
    fireEvent.click(
      screen.getByRole("button", { name: "Save my city, then continue" }),
    );
    fireEvent(
      window,
      new MessageEvent("message", {
        origin: window.location.origin,
        source: frame.contentWindow,
        data: { type: "pipupath:city:saved", ok: false },
      }),
    );
    expect(screen.getByRole("alert")).toHaveTextContent("could not save");
    expect(push).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Stay in my city" }));
    fireEvent(
      window,
      new MessageEvent("message", {
        origin: window.location.origin,
        source: frame.contentWindow,
        data: { type: "pipupath:city:saved", ok: true },
      }),
    );
    expect(push).not.toHaveBeenCalled();
  });
  it("clears an older puzzle hint when the inspected service district changes", () => {
    render(
      <PowerDistrictFrame questHref="/real-quests" questLabel="Real Quests" />,
    );
    const frame = screen.getByTitle(
      "The Unbuilt City · 14 connected districts",
    ) as HTMLIFrameElement;
    const signal = (district: string, service: string | null) =>
      fireEvent(
        window,
        new MessageEvent("message", {
          origin: window.location.origin,
          source: frame.contentWindow,
          data: {
            type: "pipupath:city:state",
            saved: false,
            district,
            service,
          },
        }),
      );
    signal("workshop", "workshop-link");
    signal("health", null);
    fireEvent.click(screen.getByRole("button", { name: "Real Quests" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Continue without saving" }),
    );
    expect(push).toHaveBeenCalledWith("/real-quests?district=health");
  });
  it("returns to the real Quest hub with only city district context", () => {
    render(
      <PowerDistrictFrame questHref="/real-quests" questLabel="Real Quests" />,
    );
    const frame = screen.getByTitle(
      "The Unbuilt City · 14 connected districts",
    ) as HTMLIFrameElement;
    fireEvent(
      window,
      new MessageEvent("message", {
        origin: window.location.origin,
        source: frame.contentWindow,
        data: {
          type: "pipupath:city:state",
          saved: false,
          district: "transport",
          href: "https://bad.test",
        },
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Real Quests" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Continue without saving" }),
    );
    expect(push).toHaveBeenCalledWith("/real-quests?district=transport");
  });
});
