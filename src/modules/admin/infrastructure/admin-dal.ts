import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role";

export type PlatformAdminRole = "owner" | "operator" | "moderator" | "analyst";

export type AdminDashboardSnapshot = {
  windowDays: number;
  totals: {
    builders: number;
    newBuilders: number;
    weeklyActiveBuilders: number;
    monthlyActiveBuilders: number;
    windowActiveBuilders: number;
    repeatBuilders: number;
    builderProgressEvents: number;
  };
  funnel: {
    joined: number;
    discoveryCompleted: number;
    profileReady: number;
    pathSelected: number;
    missionStarted: number;
    journeyStarted: number;
    questCompleted: number;
    projectStarted: number;
    projectCompleted: number;
    connected: number;
  };
};

export type FeatureUsageRow = {
  featureKey: string;
  views: number;
  builders: number;
  repeatBuilders: number;
};

export type AdminDashboardState =
  | { access: "unauthenticated" }
  | { access: "forbidden" }
  | {
      access: "granted";
      role: PlatformAdminRole;
      snapshot: AdminDashboardSnapshot;
      featureUsage: FeatureUsageRow[];
    };

type QueryError = { message?: string } | null;
type QueryResult = { data: unknown; error: QueryError };
type UntypedQuery = {
  select(columns?: string): UntypedQuery;
  insert(values: Record<string, unknown>): UntypedQuery;
  eq(column: string, value: unknown): UntypedQuery;
  maybeSingle(): Promise<QueryResult>;
};
type UntypedClient = {
  from(table: string): UntypedQuery;
  rpc(
    functionName: string,
    args?: Record<string, unknown>,
  ): Promise<QueryResult>;
};

function asAdminClient(client: unknown) {
  return client as UntypedClient;
}

function count(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function object(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function parseSnapshot(value: unknown): AdminDashboardSnapshot {
  const root = object(value);
  const totals = object(root.totals);
  const funnel = object(root.funnel);
  return {
    windowDays: Math.max(1, count(root.windowDays) || 30),
    totals: {
      builders: count(totals.builders),
      newBuilders: count(totals.newBuilders),
      weeklyActiveBuilders: count(totals.weeklyActiveBuilders),
      monthlyActiveBuilders: count(totals.monthlyActiveBuilders),
      windowActiveBuilders: count(totals.windowActiveBuilders),
      repeatBuilders: count(totals.repeatBuilders),
      builderProgressEvents: count(totals.builderProgressEvents),
    },
    funnel: {
      joined: count(funnel.joined),
      discoveryCompleted: count(funnel.discoveryCompleted),
      profileReady: count(funnel.profileReady),
      pathSelected: count(funnel.pathSelected),
      missionStarted: count(funnel.missionStarted),
      journeyStarted: count(funnel.journeyStarted),
      questCompleted: count(funnel.questCompleted),
      projectStarted: count(funnel.projectStarted),
      projectCompleted: count(funnel.projectCompleted),
      connected: count(funnel.connected),
    },
  };
}

function parseFeatureUsage(value: unknown): FeatureUsageRow[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const row = object(item);
    if (typeof row.feature_key !== "string") return [];
    return [
      {
        featureKey: row.feature_key,
        views: count(row.views),
        builders: count(row.builders),
        repeatBuilders: count(row.repeat_builders),
      },
    ];
  });
}

function isAdminRole(value: unknown): value is PlatformAdminRole {
  return ["owner", "operator", "moderator", "analyst"].includes(String(value));
}

export async function getAdminDashboardState(
  windowDays = 30,
): Promise<AdminDashboardState> {
  const server = await createServerSupabaseClient();
  const {
    data: { user },
  } = await server.auth.getUser();
  if (!user) return { access: "unauthenticated" };

  const service = asAdminClient(createServiceRoleSupabaseClient());
  const { data: adminRow, error: adminError } = await service
    .from("platform_admins")
    .select("role,status")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  const admin = object(adminRow);
  if (adminError || !isAdminRole(admin.role)) {
    return { access: "forbidden" };
  }

  const safeWindow = Math.min(Math.max(Math.trunc(windowDays), 1), 365);
  const [snapshotResult, featureResult] = await Promise.all([
    service.rpc("get_stage14_admin_dashboard_snapshot", {
      window_days_input: safeWindow,
    }),
    service.rpc("get_stage14_admin_feature_usage", {
      window_days_input: safeWindow,
    }),
  ]);

  if (snapshotResult.error || featureResult.error) {
    throw new Error("ADMIN_DASHBOARD_LOAD_FAILED");
  }

  await service.from("admin_audit_events").insert({
    actor_user_id: user.id,
    operation: "admin_dashboard_viewed",
    result: "success",
    metadata: { windowDays: safeWindow },
  });

  return {
    access: "granted",
    role: admin.role,
    snapshot: parseSnapshot(snapshotResult.data),
    featureUsage: parseFeatureUsage(featureResult.data),
  };
}
