import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PowerDistrictFrame } from "./power-district-frame";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
afterEach(() => { cleanup(); push.mockClear(); });

describe("City to Quest handoff", () => {
  it("shows an explicit save/discard choice without converting game progress to proof", () => {
    render(<PowerDistrictFrame questHref="/real-quests" questLabel="Real Quests" />);
    fireEvent.click(screen.getByRole("button", { name: "Real Quests" }));
    expect(screen.getByRole("dialog", { name: "Continue to a real Quest" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Save my city, then continue" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Continue without saving" })).toBeVisible();
    expect(push).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Stay in my city" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
  it("never invents a real Quest when a player explicitly leaves without saving", () => {
    render(<PowerDistrictFrame questHref="/real-quests" questLabel="Real Quests" />);
    fireEvent.click(screen.getByRole("button", { name: "Real Quests" }));
    fireEvent.click(screen.getByRole("button", { name: "Continue without saving" }));
    expect(push).toHaveBeenCalledWith("/real-quests");
  });
  it("keeps one mounted city iframe when focus view is closed", () => {
    render(<PowerDistrictFrame questHref="/real-quests" questLabel="Real Quests" />);
    const iframe = screen.getByTitle("The Unbuilt City · 14 connected districts");
    fireEvent.click(screen.getByRole("button", { name: "Close focus view" }));
    expect(screen.getByTitle("The Unbuilt City · 14 connected districts")).toBe(iframe);
    expect(screen.getByRole("button", { name: "Focus on my city ↗" })).toBeVisible();
  });
});
