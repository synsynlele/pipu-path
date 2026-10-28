import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { UnbuiltCityCampaign } from "./unbuilt-city-campaign";
import { UnbuiltCityExperience } from "./unbuilt-city-experience";
const boundary = vi.hoisted(() => ({ home: vi.fn() }));
vi.mock("@/modules/identity/infrastructure/progress-dal", () => ({
  requireAuthenticatedHomeState: boundary.home,
}));
vi.mock("next/navigation", () => ({
  redirect: (href: string) => {
    throw new Error(`REDIRECT:${href}`);
  },
  notFound: () => {
    throw new Error("NOT_FOUND");
  },
}));
import ChapterPage from "@/app/build/play/[chapterId]/page";
import NeighbourhoodPage from "@/app/build/neighbourhood/page";
afterEach(cleanup);
it("replaces old challenge links with one playable new mission and honest planned briefs", () => {
  render(<UnbuiltCityCampaign playHref="/build/play?quest=owned" />);
  expect(
    screen.getByRole("heading", {
      name: "Build a city that works for people.",
    }),
  ).toBeVisible();
  const links = screen.getAllByRole("link");
  expect(links).toHaveLength(2);
  for (const link of links)
    expect(link).toHaveAttribute("href", "/build/play?quest=owned");
  expect(screen.getByText(/02 · HARVEST EXCHANGE · PLANNED/)).toBeVisible();
  expect(screen.getByText(/03 · LEARNING COMMONS · PLANNED/)).toBeVisible();
  expect(screen.queryByText("Story practice")).not.toBeInTheDocument();
});
it("keeps the existing city identity and the owned Quest return around the new frame", () => {
  render(
    <UnbuiltCityExperience
      questHref="/quests/owned"
      questLabel="Return to my Quest"
      questTitle="Listen locally"
      outcome="Test one useful improvement."
    />,
  );
  expect(
    screen.getByRole("heading", { name: "Keep the Workshop Running" }),
  ).toBeVisible();
  expect(
    screen.getByTitle("Power District: Keep the Workshop Running"),
  ).toHaveAttribute("src", "/games/power-district/index.html?embedded=1");
  expect(
    screen.getByRole("heading", { name: "Your real Quest: Listen locally" }),
  ).toBeVisible();
  expect(screen.getByText("Test one useful improvement.")).toBeVisible();
});
it("recovers retired valid bookmarks and preserves authentication and unknown-route guards", async () => {
  boundary.home.mockResolvedValue({ quest: null });
  await expect(
    ChapterPage({ params: Promise.resolve({ chapterId: "food-rescue-v1" }) }),
  ).rejects.toThrow("REDIRECT:/build/adventures");
  await expect(
    ChapterPage({ params: Promise.resolve({ chapterId: "invented-world" }) }),
  ).rejects.toThrow("NOT_FOUND");
  await expect(NeighbourhoodPage()).rejects.toThrow("REDIRECT:/build/play");
  boundary.home.mockRejectedValueOnce(new Error("AUTH_REQUIRED"));
  await expect(NeighbourhoodPage()).rejects.toThrow("AUTH_REQUIRED");
});
