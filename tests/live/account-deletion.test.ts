import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { expect, it, vi } from "vitest";
import {
  runDeletionJob,
  type DeletionClient,
} from "../../src/modules/privacy/infrastructure/deletion-fulfilment";

vi.mock("server-only", () => ({}));
// The worker receives the real SDK client. Only unused Next server configuration
// is excluded from this dedicated Node test runner.
vi.mock("@/lib/supabase/service-role", () => ({}));

it("removes a newly created fixture through real Storage and Auth APIs", async () => {
  const required = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "PRIVACY_TEST_PROJECT_REF",
    "PRIVACY_TEST_OPERATOR_ID",
  ] as const;
  for (const name of required)
    if (!process.env[name]) throw new Error(`Missing ${name}`);
  if (process.env.PRIVACY_LIVE_TEST !== "create-and-delete-fixture")
    throw new Error(
      "Set PRIVACY_LIVE_TEST=create-and-delete-fixture explicitly",
    );
  const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!);
  if (
    url.protocol !== "https:" ||
    url.hostname !== `${process.env.PRIVACY_TEST_PROJECT_REF}.supabase.co`
  )
    throw new Error("Test project reference must match the API hostname");
  const options = { auth: { persistSession: false, autoRefreshToken: false } };
  const admin = createClient(
    url.origin,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    options,
  );
  const user = createClient(
    url.origin,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    options,
  );
  const operatorId = process.env.PRIVACY_TEST_OPERATOR_ID!;
  const operator = await admin
    .from("platform_admins")
    .select("role,status")
    .eq("user_id", operatorId)
    .single();
  expect(operator.error).toBeNull();
  expect(operator.data?.status).toBe("active");
  expect(["owner", "operator"]).toContain(operator.data?.role);
  const operatorAuth = await admin.auth.admin.getUserById(operatorId);
  expect(operatorAuth.error).toBeNull();
  expect(operatorAuth.data.user?.email_confirmed_at).toBeTruthy();

  // There is no input for a target account ID: only this run's newly created
  // account can be passed to the deletion worker.
  const fixture = randomUUID();
  const email = `pipupath-deletion-${fixture}@example.test`;
  const password = `${randomUUID()}Aa1!`;
  const created = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  expect(created.error).toBeNull();
  const targetId = created.data.user!.id;
  const path = `${targetId}/privacy-fixture-${fixture}.png`;
  let requestId: string | undefined;
  let verified = false;
  try {
    const login = await user.auth.signInWithPassword({ email, password });
    expect(login.error).toBeNull();
    const profile = await admin
      .from("profiles")
      .select("id")
      .eq("id", targetId)
      .single();
    expect(profile.error).toBeNull();
    const bytes = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=",
      "base64",
    );
    const upload = await admin.storage
      .from("quest-evidence")
      .upload(path, bytes, { contentType: "image/png", upsert: false });
    expect(upload.error).toBeNull();
    const before = await admin.storage.from("quest-evidence").download(path);
    expect(before.error).toBeNull();
    const signed = await admin.storage
      .from("quest-evidence")
      .createSignedUrl(path, 600);
    expect(signed.error).toBeNull();
    const signedUrl = signed.data!.signedUrl;
    const signedBefore = await fetch(signedUrl);
    expect(signedBefore.ok).toBe(true);
    await signedBefore.arrayBuffer();
    const request = await admin
      .from("account_deletion_requests")
      .insert({
        user_id: targetId,
        status: "reviewing",
        reviewed_by: operatorId,
        reviewed_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    expect(request.error).toBeNull();
    requestId = request.data!.id;
    await runDeletionJob(
      requestId!,
      operatorId,
      admin as unknown as DeletionClient,
    );
    const auth = await admin.auth.admin.getUserById(targetId);
    expect(auth.data.user).toBeNull();
    expect(auth.error?.status).toBe(404);
    // Supabase CDN invalidation is asynchronous. A unique cacheNonce checks
    // the origin rather than accepting a warmed response as file existence.
    const fresh = createClient(
      url.origin,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        ...options,
        global: {
          fetch: (input, init) => {
            const requestUrl = new URL(String(input));
            if (requestUrl.pathname.includes("/storage/v1/object/"))
              requestUrl.searchParams.set("cacheNonce", randomUUID());
            return fetch(requestUrl, { ...init, cache: "no-store" });
          },
        },
      },
    );
    const file = await fresh.storage.from("quest-evidence").download(path);
    expect(file.data).toBeNull();
    expect(file.error).toBeTruthy();
    // The original link is still within its 10-minute token lifetime. A fresh
    // origin read must fail because deletion removed the object, not token expiry.
    const signedAfterUrl = new URL(signedUrl);
    signedAfterUrl.searchParams.set("cacheNonce", randomUUID());
    const signedAfter = await fetch(signedAfterUrl, { cache: "no-store" });
    expect(signedAfter.ok).toBe(false);
    expect([400, 404]).toContain(signedAfter.status);
    const missingProfile = await admin
      .from("profiles")
      .select("id")
      .eq("id", targetId);
    expect(missingProfile.error).toBeNull();
    expect(missingProfile.data).toEqual([]);
    const receipt = await admin
      .from("account_deletion_requests")
      .select("status,user_id,fulfilled_at")
      .eq("id", requestId)
      .single();
    expect(receipt.error).toBeNull();
    expect(receipt.data).toMatchObject({ status: "fulfilled", user_id: null });
    expect(receipt.data?.fulfilled_at).toBeTruthy();
    const job = await admin
      .from("account_deletion_jobs")
      .select("state,phase,target_user_id")
      .eq("request_id", requestId)
      .single();
    expect(job.error).toBeNull();
    expect(job.data).toEqual({
      state: "fulfilled",
      phase: "verified",
      target_user_id: null,
    });
    await user.auth.signOut({ scope: "local" });
    const denied = await user.auth.signInWithPassword({ email, password });
    expect(denied.error).toBeTruthy();
    const operatorAfter = await admin.auth.admin.getUserById(operatorId);
    expect(operatorAfter.error).toBeNull();
    expect(operatorAfter.data.user?.id).toBe(operatorId);
    verified = true;
  } finally {
    if (verified && requestId) {
      const cleanup = await admin
        .from("account_deletion_requests")
        .delete()
        .eq("id", requestId);
      expect(cleanup.error).toBeNull();
    } else {
      // Preserve failed job evidence for an operator retry. Never mark a failed
      // request fulfilled or silently remove evidence of a partial operation.
      console.error(
        `Disposable fixture needs review: account=${targetId}; request=${requestId ?? "not-created"}`,
      );
    }
  }
});
