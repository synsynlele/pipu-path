import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Button, ButtonLink } from "./button";
import { Surface } from "./surface";

describe("design-system primitives", () => {
  it("renders an accessible navigation action", () => {
    render(<ButtonLink href="/app">Continue</ButtonLink>);

    expect(screen.getByRole("link", { name: "Continue" })).toHaveAttribute(
      "href",
      "/app",
    );
  });

  it("provides an explicit high-contrast light action", () => {
    render(
      <ButtonLink href="/discover" variant="light">
        Continue Discover
      </ButtonLink>,
    );

    expect(screen.getByRole("link", { name: "Continue Discover" })).toHaveClass(
      "pp-button-light",
    );
  });

  it("renders secondary actions and handles activation", () => {
    const onClick = vi.fn();
    render(
      <Button variant="secondary" onClick={onClick}>
        Retry
      </Button>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("renders a composable surface", () => {
    render(<Surface data-testid="surface">Evidence</Surface>);

    expect(screen.getByTestId("surface")).toHaveTextContent("Evidence");
  });
});
