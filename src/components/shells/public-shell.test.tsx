import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PublicShell } from "./public-shell";

describe("PublicShell", () => {
  it("provides landmarks, branding, and a skip link", () => {
    render(
      <PublicShell>
        <main id="main-content">Content</main>
      </PublicShell>,
    );

    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "PipuPath home" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(
      screen.getByRole("link", { name: "Skip to content" }),
    ).toHaveAttribute("href", "#main-content");
  });
});
Ÿ®8