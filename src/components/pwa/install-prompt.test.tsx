import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { InstallPwaButton, InstallPwaCard } from "./install-prompt";

afterEach(() => {
  cleanup();
});

describe("PipuPath install experience", () => {
  it("keeps install discoverable even when beforeinstallprompt has not fired", () => {
    render(<InstallPwaButton />);

    expect(
      screen.getByRole("button", { name: "Install PipuPath" }),
    ).toBeVisible();
  });

  it("falls back to clear browser installation guidance", () => {
    render(<InstallPwaButton />);

    fireEvent.click(screen.getByRole("button", { name: "Install PipuPath" }));

    expect(screen.getByRole("dialog")).toBeVisible();
    expect(screen.getByText("Install PipuPath")).toBeVisible();
    expect(
      screen.getByText(
        "Choose Install app, Add to Home Screen, or Create shortcut, then confirm.",
      ),
    ).toBeVisible();
  });

  it("offers a visible return-to-app install card when used on Home", () => {
    render(<InstallPwaCard />);

    expect(screen.getByText("Put PipuPath on your phone")).toBeVisible();
    expect(
      screen.getByText("Come back to your next move in one tap."),
    ).toBeVisible();
  });
});
