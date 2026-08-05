import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PageLoading } from "./page-loading";
import { RouteError } from "./route-error";

describe("route feedback", () => {
  it("announces loading without exposing implementation details", () => {
    render(<PageLoading label="Loading your Journey" />);
    expect(screen.getByRole("status")).toHaveTextContent(
      "Loading your Journey",
    );
  });

  it("provides a safe retry action", () => {
    const reset = vi.fn();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    render(<RouteError error={new Error("safe failure")} reset={reset} />);
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(reset).toHaveBeenCalledOnce();
    expect(screen.queryByText(/stack|supabase|sql/i)).not.toBeInTheDocument();
  });
});
