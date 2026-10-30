import { afterEach, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { CityCloudControls } from "./city-cloud-controls";
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
it("loads backup status, labels every action and closes with focus recovery", async () => {
  const fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ ok: true, state: null, revision: null }),
  });
  vi.stubGlobal("fetch", fetch);
  const { container } = render(
    <CityCloudControls frameRef={{ current: null }} />,
  );
  const details = container.querySelector("details")!;
  fireEvent.click(screen.getByText("☁ Account backup"));
  await waitFor(() => expect(fetch).toHaveBeenCalledOnce());
  expect(await screen.findByText(/No account backup yet/)).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "Back up this city" }),
  ).toBeEnabled();
  expect(
    screen.getByRole("button", { name: "Restore from account" }),
  ).toBeDisabled();
  expect(
    screen.getByRole("button", { name: "Check latest backup" }),
  ).toBeEnabled();
  fireEvent.click(screen.getByRole("button", { name: "Close account backup" }));
  expect(details).not.toHaveAttribute("open");
  expect(screen.getByText("☁ Account backup")).toHaveFocus();
});
