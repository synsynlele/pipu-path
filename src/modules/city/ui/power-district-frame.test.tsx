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
      screen.getByRole("button", { name: "Close focus view" }),
    ).toHaveClass("bg-transparent");
    const frame = screen.getByTitle(
      "The Unbuilt City · 14 connected districts",
    );
    fireEvent.click(screen.getByRole("button", { name: "Close focus view" }));
    expect(screen.getByTitle("The Unbuilt City · 14 connected districts")).toBe(
      frame,
    );
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
  it("keeps one mounted city iframe when focus view is closed", () => {
    render(
      <PowerDistrictFrame questHref="/real-quests" questLabel="Real Quests" />,
    );
    const iframe = screen.getByTitle(
      "The Unbuilt City · 14 connected districts",
    );
    fireEvent.click(screen.getByRole("button", { name: "Close focus view" }));
    expect(screen.getByTitle("The Unbuilt City · 14 connected districts")).toBe(
      iframe,
    );
    expect(
      screen.getByRole("button", { name: "Focus on my city ↗" }),
    ).toBeVisible();
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
