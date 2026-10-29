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
    expect(result.headers.get("Cache-Control")).toBe("private, no-store");
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
  it("preserves only recognised city context through sign-in", async () => {
    refresh.mockResolvedValue({ response: NextResponse.next(), user: null });
    const result = await proxy(
      new NextRequest(
        "https://pipu.test/real-quests?district=water&next=https://bad.test",
      ),
    );
    expect(
      new URL(result.headers.get("location")!).searchParams.get("next"),
    ).toBe("/real-quests?district=water");
    const invalid = await proxy(
      new NextRequest("https://pipu.test/real-quests?district=unknown"),
    );
    expect(
      new URL(invalid.headers.get("location")!).searchParams.get("next"),
    ).toBe("/real-quests");
  });
  it("returns signed-in players to the city-inspired action hub with rotated cookies", async () => {
    const response = NextResponse.next();
    response.cookies.set("sb-test-auth-token", "rotated");
    refresh.mockResolvedValue({ response, user: { id: "builder" } });
    const result = await proxy(
      new NextRequest(
        "https://pipu.test/login?next=%2Freal-quests%3Fdistrict%3Dwater",
      ),
    );
    expect(result.headers.get("location")).toBe(
      "https://pipu.test/real-quests?district=water",
    );
    expect(result.cookies.get("sb-test-auth-token")?.value).toBe("rotated");
    const home = await proxy(new NextRequest("https://pipu.test/"));
    expect(home.headers.get("location")).toBeNull();
    expect(home.cookies.get("sb-test-auth-token")?.value).toBe("rotated");
    const external = await proxy(
      new NextRequest("https://pipu.test/login?next=https://bad.test"),
    );
    expect(external.headers.get("location")).toBe("https://pipu.test/continue");
  });
});
