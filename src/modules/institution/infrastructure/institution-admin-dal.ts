import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/service-role";
import type { InstitutionRole } from "../domain/institution-contract";

type QueryError = { message?: string } | null;
type QueryResult = { data: unknown; error: QueryError };
type UntypedQuery = {
  select(columns?: string): UntypedQuery;
  eq(column: string, value: unknown): UntypedQuery;
  maybeSingle(): Promise<QueryResult>;
};
type UntypedClient = {
  from(table: string): UntypedQuery;
  rpc(name: string, args?: Record<string, unknown>): Promise<QueryResult>;
};

function asUntypedClient(client: unknown) {
  return client as UntypedClient;
}

function object(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function text(value: unknown) {
  return typeof value === "string" ? value : null;
}

export type InstitutionAdminMember = {
  userId: string;
  username: string | null;
  displayName: string | null;
  role: InstitutionRole;
  status: "active" | "revoked";
};

export type InstitutionAdminCohort = {
  cohortId: string;
  organisationName: string;
  cohortStatus: "active" | "revoked";
  reportingMinimum: number;
  workspaceId: string | null;
  workspaceStatus: "active" | "revoked" | null;
  members: InstitutionAdminMember[];
};

export type InstitutionAdminState =
  | { access: "unauthenticated" }
  | { access: "forbidden" }
  | { access: "granted"; cohorts: InstitutionAdminCohort[] };

async function currentProvisioner() {
  const server = await createServerSupabaseClient();
  const {
    data: { user },
  } = await server.auth.getUser();
  if (!user) return { access: "unauthenticated" as const };

  const service = asUntypedClient(createServiceRoleSupabaseClient());
  const adminResult = await service
    .from("platform_admins")
    .select("role,status")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();
  const admin = object(adminResult.data);
  if (
    adminResult.error ||
    !["owner", "operator"].includes(String(admin.role))
  ) {
    return { access: "forbidden" as const };
  }

  return { access: "granted" as const, userId: user.id, service };
}

function parseRegistry(value: unknown): InstitutionAdminCohort[] {
  const root = object(value);
  if (!Array.isArray(root.cohorts)) return [];
  return root.cohorts.flatMap((item) => {
    const row = object(item);
    const cohortId = text(row.cohortId);
    const organisationName = text(row.organisationName);
    if (!cohortId || !organisationName) return [];
    const members = Array.isArray(row.members)
      ? row.members.flatMap((memberValue) => {
          const member = object(memberValue);
          const userId = text(member.userId);
          const memberRole = text(member.role);
          const status = text(member.status);
          if (
            !userId ||
            !["owner", "verifier", "analyst"].includes(memberRole ?? "") ||
            !["active", "revoked"].includes(status ?? "")
          ) {
            return [];
          }
          return [
            {
              userId,
              username: text(member.username),
              displayName: text(member.displayName),
              role: memberRole as InstitutionRole,
              status: status as "active" | "revoked",
            },
          ];
        })
      : [];
    const cohortStatus = text(row.cohortStatus);
    const workspaceStatus = text(row.workspaceStatus);
    return [
      {
        cohortId,
        organisationName,
        cohortStatus: cohortStatus === "revoked" ? "revoked" : "active",
        reportingMinimum: Math.max(5, Number(row.reportingMinimum) || 5),
        workspaceId: text(row.workspaceId),
        workspaceStatus:
          workspaceStatus === "active" || workspaceStatus === "revoked"
            ? workspaceStatus
            : null,
        members,
      },
    ];
  });
}

export async function getInstitutionAdminState(): Promise<InstitutionAdminState> {
  const provisioner = await currentProvisioner();
  if (provisioner.access !== "granted") return provisioner;
  const result = await provisioner.service.rpc(
    "get_stage19_admin_institution_registry_server",
    { actor_user_id_input: provisioner.userId },
  );
  if (result.error) throw new Error("INSTITUTION_ADMIN_LOAD_FAILED");
  return { access: "granted", cohorts: parseRegistry(result.data) };
}

export async function runInstitutionAdminRpc(
  name: string,
  args: Record<string, unknown>,
) {
  const provisioner = await currentProvisioner();
  if (provisioner.access !== "granted") {
    return {
      data: null,
      error: { message: "INSTITUTION_ADMIN_ACCESS_DENIED" },
    };
  }
  return provisioner.service.rpc(name, {
    ...args,
    actor_user_id_input: provisioner.userId,
  });
}
