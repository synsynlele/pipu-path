import { readFileSync } from "node:fs";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/dom";
import cityCatalog from "../../../../public/games/city/finance-scenarios.json";
import { mountFinancialCityPractice } from "../../../../public/games/city/finance-practice.mjs";

const beforeOpen = vi.fn();
const close = vi.fn();
const handoff = vi.fn();
const originalFetch = globalThis.fetch;

beforeEach(() => {
  const html = readFileSync("public/games/city/index.html", "utf8");
  const dialog = html.match(/<dialog\s+id="finance-desk"[\s\S]*?<\/dialog>/)?.[0];
  if (!dialog) throw new Error("Finance dialog missing from city");
  document.body.innerHTML = dialog;
  const element = document.querySelector("dialog")!;
  Object.defineProperty(element, "showModal", {
    value: () => { element.open = true; },
    configurable: true,
  });
  Object.defineProperty(element, "close", {
    value: () => {
      element.open = false;
      element.dispatchEvent(new Event("close"));
    },
    configurable: true,
  });
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => cityCatalog,
  });
  beforeOpen.mockClear();
  close.mockClear();
  handoff.mockClear();
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  document.body.innerHTML = "";
});

it("opens financial decisions over the existing city without writing game state", async () => {
  const saved = vi.spyOn(Storage.prototype, "setItem");
  const practice = mountFinancialCityPractice({
    root: document.querySelector("dialog")!,
    onBeforeOpen: beforeOpen,
    onClose: close,
    onRealQuest: handoff,
  });
  try {
    await practice.open();
    expect(beforeOpen).toHaveBeenCalledOnce();
    expect(screen.getByRole("dialog", { name: "Make a thoughtful decision" })).toBeVisible();
    expect(screen.getByLabelText("Choose a financial challenge")).toHaveValue("needs_wants");
    expect(screen.getByLabelText("Choose a financial challenge").querySelectorAll("option")).toHaveLength(6);
    fireEvent.click(screen.getByRole("button", { name: /Maintain essential water containers/ }));
    expect(screen.getByText(/Remaining: ₦1,800/)).toBeVisible();
    expect(screen.getByText(/Fictional decision only/)).toBeVisible();
    expect(saved).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: /Take this learning into a real Quest/ }));
    expect(handoff).toHaveBeenCalledWith("needs_wants");
    fireEvent.click(screen.getByRole("button", { name: "Close financial practice" }));
    expect(close).toHaveBeenCalledOnce();
  } finally {
    saved.mockRestore();
  }
});

it("enforces visible age eligibility while never unlocking server-protected real Quests", async () => {
  const practice = mountFinancialCityPractice({
    root: document.querySelector("dialog")!,
    onRealQuest: handoff,
  });
  await practice.open();
  const select = screen.getByLabelText("Choose a financial challenge");
  practice.setAgeBand("16_17");
  expect(select.querySelectorAll("option")).toHaveLength(8);
  practice.setAgeBand("18_24");
  expect(select.querySelectorAll("option")).toHaveLength(9);
  fireEvent.change(select, { target: { value: "responsible_borrowing" } });
  expect(screen.getByText(/A city group wants an expansion/)).toBeVisible();
  practice.setAgeBand("invalid");
  expect(select.querySelectorAll("option")).toHaveLength(6);
  expect(select).toHaveValue("needs_wants");
  fireEvent.click(screen.getByRole("button", { name: /Take this learning into a real Quest/ }));
  expect(handoff).toHaveBeenCalledWith("needs_wants");
});

it("recovers from a failed static catalog fetch without clearing the city", async () => {
  (globalThis.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("offline"));
  const practice = mountFinancialCityPractice({
    root: document.querySelector("dialog")!,
    onBeforeOpen: beforeOpen,
  });
  await practice.open();
  expect(screen.getByText(/could not load/)).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Retry loading city practice" }));
  await vi.waitFor(() => {
    expect(screen.getByLabelText("Choose a financial challenge")).toHaveValue("needs_wants");
  });
  expect(beforeOpen).toHaveBeenCalledTimes(2);
});
