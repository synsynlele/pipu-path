import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CityEpisode } from "./city-episode";

afterEach(cleanup);

function click(name: string | RegExp) {
  fireEvent.click(screen.getByRole("button", { name }));
}

describe("city episode", () => {
  it("takes a player through both attempts without claiming learning completion", () => {
    render(<CityEpisode />);
    expect(screen.getByText(/refreshing starts again/i)).toBeInTheDocument();
    click(/Meet the neighbours/);
    expect(
      screen.getByRole("button", { name: /I've heard everyone/ }),
    ).toBeDisabled();
    click(/Ada/);
    click(/Timi/);
    click(/Mama Jo/);
    click(/I've heard everyone/);
    fireEvent.click(screen.getByRole("radio", { name: /Designer/ }));
    expect(screen.getByText(/Those are different jobs/)).toBeInTheDocument();
    click(/Open the square/);
    expect(
      screen.getByRole("button", { name: /Open the gates/ }),
    ).toBeDisabled();
    click(/Live music/);
    click(/Make & share/);
    click(/Clear paths/);
    click(/Tell the neighbourhood/);
    click(/Open the gates/);
    expect(screen.getByText("The square comes alive.")).toBeInTheDocument();
    click(/See what this teaches/);
    click(/Try a different night/);
    expect(
      screen.getByRole("button", { name: /Open the gates/ }),
    ).toBeDisabled();
    click(/Food corner/);
    click(/Make & share/);
    click(/Clear paths/);
    click(/Rain cover/);
    click(/Tell the neighbourhood/);
    click(/Open the gates/);
    expect(screen.getByText("The square comes alive.")).toBeInTheDocument();
    click(/Reflect on this attempt/);
    fireEvent.change(screen.getByLabelText(/What did you change/), {
      target: { value: "Cover kept the activities open." },
    });
    expect(
      screen.getByRole("link", { name: /Open my real-world Quests/ }),
    ).toHaveAttribute("href", "/quests");
    expect(
      screen.getByText(/does not upload your reflection or create a Quest/),
    ).toBeInTheDocument();
    click(/Replay with another role/);
    expect(
      screen.getByRole("button", { name: /Meet the neighbours/ }),
    ).toBeInTheDocument();
  });
  it("offers actionable feedback and invalidates stale results after edits", () => {
    render(<CityEpisode />);
    click(/Meet the neighbours/);
    click(/Ada/);
    click(/Timi/);
    click(/Mama Jo/);
    click(/I've heard everyone/);
    click(/Open the square/);
    click(/Live music/);
    click(/Open the gates/);
    expect(screen.getByText(/Ada cannot reach/)).toBeInTheDocument();
    click(/Clear paths/);
    expect(screen.queryByText(/Ada cannot reach/)).not.toBeInTheDocument();
    click(/Clear plan/);
    expect(
      screen.getByRole("button", { name: /Open the gates/ }),
    ).toBeDisabled();
  });
});
