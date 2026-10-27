import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { LessonPath } from "./lesson-path";

afterEach(cleanup);

describe("short mission learning path", () => {
  const nodes = [
    { id: "intro", title: "Find the way", state: "done" as const },
    { id: "build", title: "Build the stall", state: "current" as const },
    { id: "deliver", title: "Deliver supplies", state: "locked" as const },
  ];
  it("shows accurate lesson status and does not reward simulated XP", () => {
    render(<LessonPath nodes={nodes} />);
    expect(
      screen.getByRole("progressbar", { name: /Practice missions completed/ }),
    ).toHaveAttribute("aria-valuenow", "1");
    expect(screen.getByText("1 / 3 completed")).toBeInTheDocument();
    expect(
      screen.getByText(/separate from verified PipuPath XP/),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Deliver supplies: locked"),
    ).toBeInTheDocument();
  });
  it("makes only available levels clickable", () => {
    const onSelect = vi.fn();
    render(<LessonPath nodes={nodes} onSelect={onSelect} />);
    fireEvent.click(
      screen.getByRole("button", { name: /Build the stall: play now/ }),
    );
    expect(onSelect).toHaveBeenCalledWith("build");
    expect(
      screen.queryByRole("button", { name: /Deliver supplies/ }),
    ).not.toBeInTheDocument();
  });
  it("shows all-complete path without claiming real-world mastery", () => {
    render(
      <LessonPath
        nodes={nodes.map((node) => ({ ...node, state: "done" as const }))}
      />,
    );
    expect(screen.getByText("3 / 3 completed")).toBeInTheDocument();
  });
});
