import { beforeEach, describe, expect, it, vi } from "vitest";
import { createRequire } from "node:module";
import { dirname } from "node:path";

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  rpc: vi.fn(),
  read: vi.fn(),
}));
vi.mock("server-only", () => ({}));
vi.mock("next/navigation", () => ({
  redirect: (path: string) => {
    throw new Error(`REDIRECT:${path}`);
  },
}));
vi.mock("react", async () => {
  const { createRequire } = await import("node:module");
  const { dirname } = await import("node:path");
  const require = createRequire(import.meta.url);
  return require(`${dirname(require.resolve("react"))}/react.react-server.js`);
});
vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: async () => ({
    auth: { getUser: mocks.getUser },
    rpc: mocks.rpc,
    from: (table: string) => ({
      select: () => ({ eq: () => ({ maybeSingle: () => mocks.read(table) }) }),
    }),
  }),
}));
import {
  getIdentityState,
  guardianAuthorizationGrantedForUser,
  requireAuthenticatedIdentity,
} from "./identity-dal";
const require = createRequire(import.meta.url);
const serverReact = require(
  `${dirname(require.resolve("react"))}/react.react-server.js`,
);
function newRequest() {
  const resources = new Map();
  serverReact.__SERVER_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE.A =
    {
      getCacheForType(factory: () => unknown) {
        if (!resources.has(factory)) resources.set(factory, factory());
        return resources.get(factory);
      },
    };
}

describe("request-scoped identity reads", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    newRequest();
    mocks.getUser.mockResolvedValue({
      data: { user: { id: "child-a" } },
      error: null,
    });
    mocks.read.mockImplementation(async (table) => ({
      data: table === "profiles" ? { is_minor: true } : { status: "completed" },
    }));
    mocks.rpc.mockResolvedValue({
      data: { status: "parent_declared" },
      error: null,
    });
  });
  it("shares identity and guardian checks across layout and page within one request", async () => {
    await Promise.all([
      getIdentityState(),
      requireAuthenticatedIdentity(),
      requireAuthenticatedIdentity(),
    ]);
    expect(mocks.getUser).toHaveBeenCalledTimes(1);
    expect(mocks.read).toHaveBeenCalledTimes(2);
    expect(mocks.rpc).toHaveBeenCalledTimes(1);
  });
  it("reads identity again on the next request instead of sharing users", async () => {
    expect((await getIdentityState()).user?.id).toBe("child-a");
    newRequest();
    mocks.getUser.mockResolvedValue({
      data: { user: { id: "child-b" } },
      error: null,
    });
    expect((await getIdentityState()).user?.id).toBe("child-b");
    expect(mocks.getUser).toHaveBeenCalledTimes(2);
    expect(await guardianAuthorizationGrantedForUser("child-a")).toBe(false);
  });
  it("keeps unapproved minors behind the guardian gate", async () => {
    mocks.rpc.mockResolvedValue({ data: { status: "pending" }, error: null });
    await expect(requireAuthenticatedIdentity()).rejects.toThrow(
      "REDIRECT:/onboarding/guardian",
    );
  });
  it("fails closed when the guardian state cannot be read", async () => {
    mocks.rpc.mockResolvedValue({
      data: null,
      error: { message: "unavailable" },
    });
    await expect(requireAuthenticatedIdentity()).rejects.toThrow("unavailable");
  });
});
