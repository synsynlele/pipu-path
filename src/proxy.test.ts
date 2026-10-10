import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { proxy } from "./proxy";

const refresh = vi.hoisted(() => vi.fn());
vi.mock("@/lib/supabase/proxy", () => ({
  refreshSupabaseSession: refresh,
}));

describe("session redirects", () => {
  beforeEach(() => refresh.mockReset());

  it("preserves rotated session cookies when sending a signed-in user onward", async () => {
    const response = NextResponse.next();
    response.cookies.set("sb-test-auth-token", "rotated", {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    });
    refresh.mockResolvedValue({ response, user: { id: "builder" } });
    const result = await proxy(new NextRequest("https://pipu.test/login"));
    expect(result.headers.get("location")).toBe("https://pipu.test/continue");
    expect(result.cookies.get("sb-test-auth-token")).toMatchObject({
      value: "rotated",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
    });
  });

  it("preserves expired-cookie removal when redirecting to login", async () => {
    const response = NextResponse.next();
    response.cookies.set("sb-test-auth-token", "", { path: "/", maxAge: 0 });
    refresh.mockResolvedValue({ response, user: null });
    const result = await proxy(new NextRequest("https://pipu.test/quests"));
    expect(result.headers.get("location")).toBe(
      "https://pipu.test/login?next=%2Fquests",
    );
    expect(result.cookies.get("sb-test-auth-token")).toMatchObject({
      value: "",
      maxAge: 0,
    });
  });

  it("continues to account deletion with the renewed session", async () => {
    const response = NextResponse.next();
    response.cookies.set("sb-test-auth-token", "rotated");
    refresh.mockResolvedValue({ response, user: { id: "builder" } });
    const result = await proxy(
      new NextRequest("https://pipu.test/login?next=/account-deletion"),
    );
    expect(result.headers.get("location")).toBe(
      "https://pipu.test/account-deletion",
    );
    expect(result.cookies.get("sb-test-auth-token")?.value).toBe("rotated");
  });
});
