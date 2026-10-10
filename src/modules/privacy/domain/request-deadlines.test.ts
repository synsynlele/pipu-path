import { expect, it } from "vitest";
import { deletionDeadlines } from "./request-deadlines";

it("keeps calendar targets stable across month and year boundaries", () => {
  expect(
    deletionDeadlines(
      "2026-12-28T12:00:00Z",
      Date.parse("2027-01-04T12:00:00Z"),
    ),
  ).toEqual({
    acknowledgementDate: "2027-01-04",
    completionDate: "2027-01-27",
    acknowledgementDue: true,
    completionOverdue: false,
  });
});
it("escalates at the completion deadline without implying deletion", () => {
  expect(
    deletionDeadlines(
      "2026-10-01T00:00:00Z",
      Date.parse("2026-10-30T23:59:59Z"),
    ).completionOverdue,
  ).toBe(false);
  expect(
    deletionDeadlines(
      "2026-10-01T00:00:00Z",
      Date.parse("2026-10-31T00:00:00Z"),
    ).completionOverdue,
  ).toBe(true);
});
it("rejects invalid received dates", () => {
  expect(() => deletionDeadlines("invalid")).toThrow(
    "INVALID_PRIVACY_REQUEST_DATE",
  );
});
