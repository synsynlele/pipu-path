import { afterEach, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { BuildStageGuide } from "./stage-guide";

afterEach(cleanup);

const challenge = {
  title: "Reduce unplanned social-media scrolling",
  outcome: "Use an improved phone routine and honestly test its effects.",
  steps: [
    "Observe one real time you opened social media without planning to.",
    "Prepare one feasible change using your phone's existing screen-time settings.",
    "Set up the chosen daily usage limit and replace one scrolling slot with a useful action.",
    "Try the actual routine and compare a normal usage session with your starting point.",
    "Adjust the limit if needed and honestly record what changed, even if it did not work.",
  ],
  materials: ["Existing smartphone"],
  evidence: "Describe actual observed change.",
  safety: "Do not share private phone information.",
};

it("shows one actionable stage at a time with accessible navigation", () => {
  render(
    <BuildStageGuide
      id="10000000-0000-4000-8000-000000000001"
      challenge={challenge}
      status="active"
    />,
  );
  expect(
    screen.getByRole("heading", { name: "Build it in five stages" }),
  ).toBeInTheDocument();
  expect(screen.getByTestId("active-stage-instruction")).toHaveTextContent(
    challenge.steps[0],
  );
  fireEvent.click(screen.getByRole("button", { name: "Next stage →" }));
  expect(screen.getByTestId("active-stage-instruction")).toHaveTextContent(
    challenge.steps[1],
  );
  fireEvent.click(screen.getByRole("button", { name: "5. Improve" }));
  expect(
    screen.getByRole("link", { name: /Record my real-world result/ }),
  ).toHaveAttribute("href", "#evidence-heading");
  expect(
    screen.getByText(/does not verify completed work/),
  ).toBeInTheDocument();
});
