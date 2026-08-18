import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Button, ButtonLink } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import {
  provisionInstitutionWorkspaceAction,
  revokeInstitutionWorkspaceAction,
  setInstitutionMemberAction,
} from "@/modules/institution/application/institution-actions";
import { institutionRoleLabel } from "@/modules/institution/domain/institution-contract";
import { getInstitutionAdminState } from "@/modules/institution/infrastructure/institution-admin-dal";

export const metadata: Metadata = {
  title: "Institution Workspaces",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminInstitutionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const query = await searchParams;
  const state = await getInstitutionAdminState();
  if (state.access === "unauthenticated") {
    redirect("/login?next=%2Fadmin%2Finstitutions");
  }
  if (state.access === "forbidden") notFound();

  return (
    <main
      id="main-content"
      className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14"
    >
      <section className="rounded-[2rem] bg-slate-950 px-6 py-10 text-white sm:px-10 sm:py-14">
        <p className="text-gold font-mono text-xs tracking-[0.2em] uppercase">
          Platform Administration
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
          Institution Workspaces
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
          Provision institutional authority deliberately. A workspace can be
          created only for an existing Stage 13 cohort, and operator roles never
          grant a learner browser.
        </p>
        <div className="mt-6">
          <ButtonLink href="/admin" variant="secondary">
            Back to Mission Control
          </ButtonLink>
        </div>
      </section>

      {query.status === "updated" ? (
        <Surface className="mt-5 border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-semibold text-emerald-900">
            Institution configuration updated.
          </p>
        </Surface>
      ) : query.status === "error" ? (
        <Surface className="mt-5 border-red-200 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-900">
            The requested institution change was rejected or could not be
            completed.
          </p>
        </Surface>
      ) : null}

      <Surface className="border-gold/25 bg-gold/5 mt-8 p-6 sm:p-8">
        <h2 className="text-xl font-semibold">Provisioning rule</h2>
        <p className="text-muted mt-3 max-w-4xl leading-7">
          Institution owners, verifiers and analysts must already have active,
          adult PipuPath accounts with no safeguarding review. Platform owner or
          operator authorization is checked again on every provisioning action.
        </p>
      </Surface>

      {state.cohorts.length === 0 ? (
        <Surface className="mt-8 p-6 sm:p-8">
          <h2 className="text-2xl font-semibold">
            No Stage 13 cohort exists yet.
          </h2>
          <p className="text-muted mt-3 leading-7">
            Complete the controlled KHP-OS institutional pairing first. Stage 19
            will not invent an institution outside that existing trust boundary.
          </p>
        </Surface>
      ) : (
        <div className="mt-8 space-y-6">
          {state.cohorts.map((cohort) => (
            <Surface key={cohort.cohortId} className="p-6 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-gold text-xs font-semibold uppercase">
                    Stage 13 cohort · {cohort.cohortStatus}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">
                    {cohort.organisationName}
                  </h2>
                  <p className="text-muted mt-2 text-sm">
                    Reporting minimum: {cohort.reportingMinimum}
                  </p>
                </div>
                {cohort.workspaceId && cohort.workspaceStatus === "active" ? (
                  <Link
                    href={`/institution?workspace=${cohort.workspaceId}`}
                    className="text-gold text-sm font-semibold"
                  >
                    Open workspace
                  </Link>
                ) : null}
              </div>

              {!cohort.workspaceId ? (
                <form
                  action={provisionInstitutionWorkspaceAction}
                  className="border-border mt-6 border-t pt-5"
                >
                  <input
                    type="hidden"
                    name="cohortId"
                    value={cohort.cohortId}
                  />
                  <label
                    htmlFor={`owner-${cohort.cohortId}`}
                    className="text-sm font-semibold"
                  >
                    Initial owner PipuPath username
                  </label>
                  <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                    <input
                      id={`owner-${cohort.cohortId}`}
                      name="ownerUsername"
                      required
                      maxLength={60}
                      placeholder="institution_owner"
                      className="border-border bg-background min-w-0 flex-1 rounded-xl border px-3 py-2 text-sm"
                    />
                    <Button type="submit">Provision workspace</Button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold">
                      Institution operators
                    </h3>
                    {cohort.members.length === 0 ? (
                      <p className="text-muted mt-2 text-sm">
                        No operator records.
                      </p>
                    ) : (
                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        {cohort.members.map((member) => (
                          <div
                            key={member.userId}
                            className="border-border rounded-2xl border p-4"
                          >
                            <p className="font-semibold">
                              {member.displayName ||
                                member.username ||
                                "PipuPath operator"}
                            </p>
                            <p className="text-muted mt-1 text-sm">
                              {institutionRoleLabel(member.role)} ·{" "}
                              {member.status}
                            </p>
                            {member.status === "active" &&
                            cohort.workspaceStatus === "active" ? (
                              <form
                                action={setInstitutionMemberAction}
                                className="mt-3"
                              >
                                <input
                                  type="hidden"
                                  name="workspaceId"
                                  value={cohort.workspaceId ?? ""}
                                />
                                <input
                                  type="hidden"
                                  name="targetUsername"
                                  value={member.username ?? ""}
                                />
                                <input
                                  type="hidden"
                                  name="role"
                                  value={member.role}
                                />
                                <Button
                                  type="submit"
                                  name="action"
                                  value="revoke"
                                  variant="ghost"
                                >
                                  Revoke operator
                                </Button>
                              </form>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {cohort.workspaceStatus === "active" ? (
                    <>
                      <form
                        action={setInstitutionMemberAction}
                        className="border-border mt-6 border-t pt-5"
                      >
                        <input
                          type="hidden"
                          name="workspaceId"
                          value={cohort.workspaceId}
                        />
                        <h3 className="font-semibold">
                          Add or update an operator
                        </h3>
                        <div className="mt-3 grid gap-3 md:grid-cols-[1fr_180px_auto]">
                          <input
                            name="targetUsername"
                            required
                            maxLength={60}
                            placeholder="pipupath_username"
                            aria-label="Operator PipuPath username"
                            className="border-border bg-background rounded-xl border px-3 py-2 text-sm"
                          />
                          <select
                            name="role"
                            aria-label="Institution role"
                            className="border-border bg-background rounded-xl border px-3 py-2 text-sm"
                            defaultValue="verifier"
                          >
                            <option value="owner">Owner</option>
                            <option value="verifier">Verifier</option>
                            <option value="analyst">Analyst</option>
                          </select>
                          <Button type="submit" name="action" value="activate">
                            Save operator
                          </Button>
                        </div>
                      </form>

                      <form
                        action={revokeInstitutionWorkspaceAction}
                        className="border-border mt-6 border-t pt-5"
                      >
                        <input
                          type="hidden"
                          name="workspaceId"
                          value={cohort.workspaceId}
                        />
                        <p className="text-muted text-sm leading-6">
                          Revoking a workspace removes operator access and
                          closes every unresolved institution verification
                          request.
                        </p>
                        <Button type="submit" variant="ghost" className="mt-3">
                          Revoke workspace
                        </Button>
                      </form>
                    </>
                  ) : (
                    <p className="text-muted mt-6 text-sm">
                      This Institution Workspace has been revoked and cannot be
                      reactivated in Stage 19.
                    </p>
                  )}
                </>
              )}
            </Surface>
          ))}
        </div>
      )}
    </main>
  );
}
