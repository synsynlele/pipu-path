import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
const home = vi.hoisted(() => vi.fn());
vi.mock("@/modules/identity/infrastructure/progress-dal", () => ({
  requireAuthenticatedHomeState: home,
}));
import RealQuestsPage from "@/app/real-quests/page";
afterEach(cleanup);
beforeEach(() => {
  home.mockResolvedValue({
    quest: null,
    project: null,
    destination: {
      path: "/onboarding/identity",
      label: "Complete identity setup",
      description: "Prepare your identity.",
    },
  });
});
describe("game inspiration to real-world build", () => {
  it("retains the actual prerequisite and offers all fourteen sectors without awarding progress", async () => {
    render(
      await RealQuestsPage({
        searchParams: Promise.resolve({ district: "transport" }),
      }),
    );
    expect(
      screen.getByRole("link", { name: "Complete identity setup →" }),
    ).toHaveAttribute("href", "/onboarding/identity");
    fireEvent.click(screen.getByText(/^Inspired by/));
    expect(screen.getAllByRole("option")).toHaveLength(15);
    expect(screen.getByText(/earns no XP/)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Return to the city" }),
    ).toHaveAttribute("href", "/build/play");
  });
  it("continues the owned reflection rather than assigning a city idea as a Quest", async () => {
    home.mockResolvedValue({
      quest: {
        id: "owned",
        title: "Help a classmate",
        status: "evidence_submitted",
      },
      destination: { path: "/quests", label: "Quests", description: "Next" },
    });
    render(
      await RealQuestsPage({
        searchParams: Promise.resolve({ district: "school" }),
      }),
    );
    expect(
      screen.getByRole("link", { name: "Reflect on my attempt →" }),
    ).toHaveAttribute("href", "/quests/owned");
  });
  it("continues an active Project and ignores unknown district input", async () => {
    home.mockResolvedValue({
      project: {
        id: "project",
        title: "Improve a shared space",
        status: "active",
      },
      destination: {
        path: "/projects/project",
        label: "Project",
        description: "Next",
      },
    });
    render(
      await RealQuestsPage({
        searchParams: Promise.resolve({ district: "unknown" }),
      }),
    );
    expect(
      screen.getByRole("link", { name: "Continue my Project →" }),
    ).toHaveAttribute("href", "/projects/project");
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });
  it("does not expose personal work without the authenticated state loader", async () => {
    home.mockRejectedValue(new Error("AUTH_REQUIRED"));
    await expect(
      RealQuestsPage({ searchParams: Promise.resolve({}) }),
    ).rejects.toThrow("AUTH_REQUIRED");
  });
});
