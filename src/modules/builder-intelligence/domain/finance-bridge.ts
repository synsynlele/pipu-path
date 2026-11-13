/** Tiny shared allowlist for the 3D city iframe handoff; no catalog bundle required. */
export const FINANCE_BRIDGE_STAGES = [
  "needs_wants",
  "opportunity_cost",
  "budgeting",
  "saving",
  "value_of_work",
  "honest_earning",
  "cash_flow",
  "scam_awareness",
  "responsible_borrowing",
] as const;

export function isFinanceBridgeStage(value: unknown): value is (typeof FINANCE_BRIDGE_STAGES)[number] {
  return typeof value === "string" &&
    (FINANCE_BRIDGE_STAGES as readonly string[]).includes(value);
}
