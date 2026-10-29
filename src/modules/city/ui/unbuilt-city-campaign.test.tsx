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
  useRouter: () => ({ push: () => {} }),
  notFound: () => {
    throw new Error("NOT_FOUND");
  },
}));
import ChapterPage from "@/app/build/play/[chapterId]/page";
import NeighbourhoodPage from "@/app/build/neighbourhood/page";
afterEach(cleanup);
it("presents districts as one city with one game entry", () => {
  render(<UnbuiltCityCampaign playHref="/build/play?quest=owned" />);
  expect(
    screen.getByRole("heading", { name: "One city. Every choice connected." }),
  ).toBeVisible();
  const links = screen.getAllByRole("link");
  expect(links).toHaveLength(1);
  expect(links[0]).toHaveAttribute("href", "/build/play?quest=owned");
  expect(screen.getAllByRole("article")).toHaveLength(3);
  expect(screen.queryByText(/PLANNED/)).not.toBeInTheDocument();
});
it("preserves the owned real-Quest return around the connected city", () => {
  render(
    <UnbuiltCityExperience
      questHref="/quests/owned"
      questLabel="Return to my Quest"
      questTitle="Listen locally"
      outcome="Test one useful improvement."
    />,
  );
  expect(
    screen.getByRole("heading", { name: "The Unbuilt City" }),
  ).toBeVisible();
  expect(
    screen.getByTitle("The Unbuilt City · 14 connected districts"),
  ).toHaveAttribute("src", "/games/city/index.html?embedded=1");
  expect(
    screen.getByRole("heading", { name: "Your real Quest: Listen locally" }),
  ).toBeVisible();
});
it("recovers retired bookmarks without bypassing authentication", async () => {
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
