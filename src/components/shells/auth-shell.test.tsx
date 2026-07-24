import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AuthShell } from "./auth-shell";

describe("AuthShell", () => {
  it("renders one valid home link around the brand", () => {
    render(
      <AuthShell title="Sign in" description="Use your account.">
        <p>Authentication controls</p>
      </AuthShell>,
    );

    const homeLinks = screen.getAllByRole("link", { name: "PipuPath home" });
    expect(homeLinks).toHaveLength(1);
    expect(homeLinks[0]).toHaveAttribute("href", "/");
    expect(homeLinks[0]?.querySelector("a")).toBeNull();
  });
});
