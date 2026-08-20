import { render, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AppNavigation } from "./app-navigation";

vi.mock("next/navigation", () => ({ usePathname: () => "/guide" }));

describe("AppNavigation Builder Guide orientation", () => {
  it("keeps Me current while a Builder uses the personal Guide", () => {
    const { container } = render(<AppNavigation />);
    const navigation = within(container).getByRole("navigation", {
      name: "PipuPath application",
    });

    expect(within(navigation).getByRole("link", { name: "Me" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });
});
