import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { expect, it, vi } from "vitest";
const improve = vi.hoisted(() => vi.fn());
vi.mock("../application/actions", () => ({ improveRealBuild: improve }));
import { ImproveBuildForm } from "./improve-form";
it("discloses the written context, sends consent, shows progress and preserves retry on failure", async () => {
  let finish!: (v: { ok: boolean; message: string }) => void;
  improve.mockReturnValue(
    new Promise((resolve) => {
      finish = resolve;
    }),
  );
  render(
    <ImproveBuildForm
      id="recorded"
      draft={{
        evidence: "I tested the service with one consenting peer.",
        reflection: "The instructions were unclear.",
        nextChange: "Give a worked example.",
        outcome: "partly",
        link: "https://private.test",
      }}
    />,
  );
  expect(
    screen.getByText("I tested the service with one consenting peer."),
  ).toBeInTheDocument();
  expect(screen.getByRole("checkbox")).toBeRequired();
  fireEvent.click(screen.getByRole("checkbox"));
  fireEvent.click(
    screen.getByRole("button", { name: "Continue this solution with AI →" }),
  );
  await waitFor(() => expect(improve).toHaveBeenCalledOnce());
  expect(improve.mock.calls[0][1].get("useNotes")).toBe("yes");
  expect(improve.mock.calls[0][1].has("evidence")).toBe(false);
  expect(screen.getByRole("status")).toHaveTextContent(
    "AI is reading your result",
  );
  expect(screen.getByRole("button")).toBeDisabled();
  finish({ ok: false, message: "Your previous notes are safe. Try again." });
  await waitFor(() =>
    expect(screen.getByRole("alert")).toHaveTextContent("notes are safe"),
  );
  expect(screen.getByRole("button")).toBeEnabled();
});
