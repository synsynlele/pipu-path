import { render, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AppNavigation } from "./app-navigation";

vi.mock("next/navigation", () => ({ usePathname: () => "/proof" }));

describe("AppNavigation proof orientation", () => {
  it("keeps Build current while a Builder submits Proof", () => {
    const { container } = render(<AppNavigation />);
    const navigation = within(container).getByRole("navigation", {
      name: "PipuPath application",
    });

    expect(
      within(navigation).getByRole("link", { name: "Build" }),
    ).toHaveAttribute("aria-current", "page");
  });
});
