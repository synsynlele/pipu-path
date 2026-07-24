import { describe, expect, it } from "vitest";
import { publicAuthError } from "./errors";

describe("publicAuthError", () => {
  it("maps provider errors without leaking internals", () => {
    expect(publicAuthError("Invalid login credentials")).toContain("incorrect");
    expect(publicAuthError("Email not confirmed")).toContain("Confirm");
    expect(publicAuthError("already registered")).toContain("already");
    expect(
      publicAuthError("New password should be different from the old password"),
    ).toContain("have not used");
    expect(publicAuthError("rate limit")).toContain("wait");
    expect(publicAuthError("database host secret")).not.toContain("database");
  });
});
