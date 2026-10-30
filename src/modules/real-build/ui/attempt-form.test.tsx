import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
const m = vi.hoisted(() => ({ save: vi.fn(), refresh: vi.fn() }));
vi.mock("../application/actions", () => ({ saveRealBuild: m.save }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: m.refresh }),
}));
import { BuildAttemptForm } from "./attempt-form";
import type { SavedBuild } from "../domain/build";
const build = {
  id: "attempt",
  version: 1,
  draft: {
    evidence: "",
    link: "",
    reflection: "",
    nextChange: "",
    outcome: "",
  },
  challenge: { evidence: "Describe your test." },
} as SavedBuild;
afterEach(cleanup);
beforeEach(() => {
  m.save.mockReset();
  m.refresh.mockClear();
});
it("keeps text and selected outcome after a failed save and retries the latest version after success", async () => {
  m.save
    .mockResolvedValueOnce({ ok: false, message: "Connection failed" })
    .mockResolvedValueOnce({ ok: true, message: "Saved", version: 2 })
    .mockResolvedValueOnce({ ok: true, message: "Saved", version: 3 });
  render(<BuildAttemptForm build={build} />);
  fireEvent.change(screen.getByLabelText("What did you actually do?"), {
    target: { value: "I tested a paper tracker with my classmate." },
  });
  fireEvent.change(screen.getByLabelText("How did it go?"), {
    target: { value: "not_yet" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Save for later" }));
  await waitFor(() =>
    expect(screen.getByRole("alert")).toHaveTextContent("Connection failed"),
  );
  expect(screen.getByLabelText("What did you actually do?")).toHaveValue(
    "I tested a paper tracker with my classmate.",
  );
  expect(screen.getByLabelText("How did it go?")).toHaveValue("not_yet");
  fireEvent.click(screen.getByRole("button", { name: "Save for later" }));
  await waitFor(() => expect(m.refresh).toHaveBeenCalledOnce());
  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: "Save for later" }),
    ).toBeEnabled(),
  );
  fireEvent.click(screen.getByRole("button", { name: "Save for later" }));
  await waitFor(() => expect(m.save).toHaveBeenCalledTimes(3));
  expect((m.save.mock.calls[2][1] as FormData).get("version")).toBe("2");
});
it("uses separate explicit save, record and set-aside intents", async () => {
  m.save.mockResolvedValue({ ok: false, message: "Not recorded" });
  render(<BuildAttemptForm build={build} />);
  fireEvent.click(screen.getByRole("button", { name: "Record my attempt →" }));
  await waitFor(() => expect(m.save).toHaveBeenCalledOnce());
  expect((m.save.mock.calls[0][1] as FormData).get("intent")).toBe("record");
  expect(screen.getByText(/does not verify success/)).toBeInTheDocument();
});
