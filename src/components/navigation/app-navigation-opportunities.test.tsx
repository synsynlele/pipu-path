import { render, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AppNavigation } from "./app-navigation";

vi.mock("next/navigation", () => ({ usePathname: () => "/opportunities" }));

describe("AppNavigation opportunity orientation", () => {
  it("keeps You current while a Builder explores Opportunities", () => {
    const { container } = render(<AppNavigation />);
    const navigation = within(container).getByRole("navigation", {
      name: "PipuPath application",
    });

    expect(
      within(navigation).getByRole("link", { name: "You" }),
    ).toHaveAttribute("aria-current", "page");
  });
});
