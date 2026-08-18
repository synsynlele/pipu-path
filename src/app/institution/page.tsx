import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Button, ButtonLink } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import {
  closeInstitutionVerificationAction,
  respondInstitutionVerificationAction,
} from "@/modules/institution/application/institution-actions";
import {
  institutionRoleLabel,
  institutionTrustCopy,
  institutionVerificationStatusLabel,
} from "@/modules/institution/domain/institution-contract";
import { getInstitutionWorkspaceState } from "@/modules/institution/infrastructure/institution-dal";

export const metadata: Metadata = {
  title: "Institution Workspace",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const windows = [30, 90, 180] as const;

function count(value: number) {
  return new Intl.NumberFormat("en").format(value);
}

function personLabel(displayName: string | null, username: string | null) {
  if (displayName) return displayName;
  if (username) return `@${username}`;
  return "Builder";
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <Surface className="p-5">
      <p className="text-muted text-xs font-semibold tracking-wide uppercase">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold">{count(value)}</p>
    </Surface>
  );
}

export default async function InstitutionPage({
  searchParams,
}: {
  searchParams: Promise<{
    workspace?: string;
    window?: string;
    status?: string;
  }>;
}) {
  const query = await searchParams;
  const requestedWindow = Number(query.window ?? 90);
  const windowDays = windows.includes(
    requestedWindow as (typeof windows)[number],
  )
    ? requestedWindow
    : 90;
  const state = await getInstitutionWorkspaceState(query.workspace, windowDays);

  if (state.access === "unauthenticated") {
    redirect("/login?next=%2Finstitution");
  }
  if (state.access === "forbidden") notFound();

  const workspace = state.selected;
  const aggregate = workspace.aggregate;

  return (
    <main
      id="main-content"
      className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14"
    >
      <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-10 text-white sm:px-10 sm:py-14">
        <div className="border-gold/20 absolute -top-24 -right-20 size-72 rounded-full border" />
        <div className="relative max-w-4xl">
          <p className="text-gold font-mono text-xs tracking-[0.2em] uppercase">
            Institution Workspace
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
            {workspace.organisationName}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
            Development intelligence without a learner surveillance layer.
            Aggregate cohort patterns stay separate from individual evidence
            that a Builder explicitly shares for verification.
          </p>
          <p className="mt-5 text-sm font-semibold text-slate-400">
            Role: {institutionRoleLabel(workspace.role)}
          </p>
        </div>
      </section>

      {query.status === "updated" ? (
        <Surface className="mt-5 border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-semibold text-emerald-900">
            Institution workspace updated.
          </p>
        </Surface>
      ) : query.status === "error" ? (
        <Surface className="mt-5 border-red-200 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-900">
            That institution action could not be completed safely.
          </p>
        </Surface>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {state.choices.map((choice) => (
          <Link
            key={choice.workspaceId}
            href={`/institution?workspace=${choice.workspaceId}&window=${windowDays}`}
            aria-current={
              choice.workspaceId === workspace.workspaceId ? "page" : undefined
            }
            className={`rounded-full border px-4 py-2 text-sm font-semibold ${
              choice.workspaceId === workspace.workspaceId
                ? "border-primary bg-primary text-white"
                : "border-border bg-white text-slate-700"
            }`}
          >
            {choice.organisationName}
          </Link>
        ))}
        <ButtonLink href="/app" variant="ghost">
          Back to PipuPath
        </ButtonLink>
      </div>

      <Surface className="border-gold/25 bg-gold/5 mt-8 p-6 sm:p-8">
        <p className="text-gold text-xs font-semibold uppercase">
          Privacy boundary
        </p>
        <p className="text-muted mt-3 max-w-4xl leading-7">
          {institutionTrustCopy.aggregate} Individual names appear below only
          when that Builder explicitly shared one capability/evidence item with
          this institution for a verification decision.
        </p>
      </Surface>

      {workspace.analyticsAllowed ? (
        <section
          className="mt-10"
          aria-labelledby="cohort-intelligence-heading"
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-primary text-xs font-semibold tracking-wide uppercase">
                Cohort intelligence
              </p>
              <h2
                id="cohort-intelligence-heading"
                className="mt-2 text-3xl font-semibold tracking-tight"
              >
                Privacy-thresholded development patterns.
              </h2>
            </div>
            <nav
              aria-label="Institution analytics window"
              className="flex gap-2"
            >
              {windows.map((days) => (
                <Link
                  key={days}
                  href={`/institution?workspace=${workspace.workspaceId}&window=${days}`}
                  aria-current={days === windowDays ? "page" : undefined}
                  className={`rounded-full border px-3 py-2 text-sm font-semibold ${
                    days === windowDays
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-white"
                  }`}
                >
                  {days} days
                </Link>
              ))}
            </nav>
          </div>

          {!aggregate || !aggregate.reportingEligible ? (
            <Surface className="mt-5 p-6 sm:p-8">
              <h3 className="text-xl font-semibold">
                Small-cohort protection is active.
              </h3>
              <p className="text-muted mt-3 max-w-3xl leading-7">
                Detailed institutional signals remain suppressed until at least{" "}
                {workspace.reportingMinimum} active cohort participants
                contribute. PipuPath returns zero detailed counts rather than
                revealing a small group.
              </p>
            </Surface>
          ) : (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Metric
                label="Cohort members"
                value={aggregate.cohortMemberCount}
              />
              <Metric
                label="Active profiles"
                value={aggregate.activeProfileCount}
              />
              <Metric
                label="Paths selected"
                value={aggregate.pathSelectedCount}
              />
              <Metric
                label="Quest participants"
                value={aggregate.questParticipantCount}
              />
              <Metric
                label="Evidence-backed quest participants"
                value={aggregate.evidenceBackedQuestParticipantCount}
              />
              <Metric
                label="Project participants"
                value={aggregate.projectParticipantCount}
              />
              <Metric
                label="Project completers"
                value={aggregate.projectCompletionParticipantCount}
              />
              <Metric
                label="Continuation eligible"
                value={aggregate.continuationEligibleCount}
              />
              <Metric
                label="Continuing growth cycle"
                value={aggregate.continuingCycleParticipantCount}
              />
            </div>
          )}
        </section>
      ) : null}

      {workspace.verificationAllowed ? (
        <section className="mt-12" aria-labelledby="verification-queue-heading">
          <p className="text-primary text-xs font-semibold tracking-wide uppercase">
            Builder-authorised verification
          </p>
          <h2
            id="verification-queue-heading"
            className="mt-2 text-3xl font-semibold tracking-tight"
          >
            Decide only on evidence the Builder deliberately shared.
          </h2>
          <p className="text-muted mt-3 max-w-3xl leading-7">
            This is not a learner directory. Each row exists because that
            Builder submitted the exact capability and evidence shown here.
          </p>

          {workspace.verificationQueue.length === 0 ? (
            <Surface className="mt-5 p-6">
              <p className="text-muted">
                No institutional verification request yet.
              </p>
            </Surface>
          ) : (
            <div className="mt-5 space-y-5">
              {workspace.verificationQueue.map((item) => (
                <Surface key={item.id} className="p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-gold text-xs font-semibold uppercase">
                        {institutionVerificationStatusLabel(item.status)}
                      </p>
                      <h3 className="mt-2 text-xl font-semibold">
                        {item.capabilityLabel}
                      </h3>
                      <p className="text-muted mt-1 text-sm">
                        Shared by{" "}
                        {personLabel(
                          item.builderDisplayName,
                          item.builderUsername,
                        )}
                        {" · "}
                        {item.sourceTitle}
                      </p>
                    </div>
                    <span className="border-border rounded-full border px-3 py-1.5 text-xs font-semibold capitalize">
                      {item.sourceType} evidence
                    </span>
                  </div>
                  <p className="text-muted mt-4 leading-7">
                    {item.sourceSummary}
                  </p>
                  {item.requestNote ? (
                    <p className="border-border mt-4 rounded-xl border p-3 text-sm">
                      Builder context: {item.requestNote}
                    </p>
                  ) : null}

                  {item.actionable ? (
                    <form
                      action={respondInstitutionVerificationAction}
                      className="mt-5"
                    >
                      <input
                        type="hidden"
                        name="verificationId"
                        value={item.id}
                      />
                      <input
                        type="hidden"
                        name="workspaceId"
                        value={workspace.workspaceId}
                      />
                      <label
                        htmlFor={`institution-response-${item.id}`}
                        className="text-sm font-semibold"
                      >
                        Optional observation context
                      </label>
                      <textarea
                        id={`institution-response-${item.id}`}
                        name="responseNote"
                        rows={2}
                        maxLength={600}
                        placeholder="Record only what the institution can responsibly confirm."
                        className="border-border bg-background text-foreground mt-2 w-full rounded-xl border px-3 py-2 text-sm"
                      />
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button type="submit" name="action" value="confirm">
                          Confirm capability
                        </Button>
                        <Button
                          type="submit"
                          name="action"
                          value="decline"
                          variant="secondary"
                        >
                          Decline
                        </Button>
                      </div>
                    </form>
                  ) : item.status === "confirmed" ? (
                    <form
                      action={closeInstitutionVerificationAction}
                      className="mt-4"
                    >
                      <input
                        type="hidden"
                        name="verificationId"
                        value={item.id}
                      />
                      <input
                        type="hidden"
                        name="workspaceId"
                        value={workspace.workspaceId}
                      />
                      <Button
                        type="submit"
                        name="action"
                        value="revoke"
                        variant="ghost"
                      >
                        Revoke institution confirmation
                      </Button>
                    </form>
                  ) : null}
                  {item.responseNote ? (
                    <p className="text-muted mt-3 text-sm">
                      Institution context: {item.responseNote}
                    </p>
                  ) : null}
                </Surface>
              ))}
            </div>
          )}
        </section>
      ) : null}
    </main>
  );
}
