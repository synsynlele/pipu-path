import type { Metadata } from "next";
import { Button, ButtonLink } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import {
  addCollaborationContributionAction,
  closeCollaborationAction,
  confirmCollaborationCompletionAction,
  respondCollaborationAction,
} from "@/modules/collaboration/application/collaboration-actions";
import { collaborationStatusLabel } from "@/modules/collaboration/domain/collaboration-contract";
import { getCollaborationDetail } from "@/modules/collaboration/infrastructure/collaboration-dal";

export const metadata: Metadata = {
  title: "Collaboration workspace",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

const inputClass =
  "border-border bg-white mt-2 min-h-12 w-full rounded-xl border px-3 text-sm text-slate-950 shadow-sm focus:border-primary";
const textareaClass =
  "border-border bg-white mt-2 min-h-28 w-full rounded-2xl border p-4 text-sm leading-6 text-slate-950 shadow-sm focus:border-primary";

function Notice({ status }: { status?: string }) {
  if (!status) return null;
  const error = status === "error";
  return (
    <p
      role={error ? "alert" : "status"}
      className={`mt-6 rounded-2xl border p-4 text-sm ${
        error
          ? "border-error/30 bg-error/10 text-error"
          : "border-success/30 bg-success/10 text-success"
      }`}
    >
      {error
        ? "That collaboration action could not be completed. Check the evidence and relationship state, then try again."
        : "Collaboration evidence updated."}
    </p>
  );
}

export default async function CollaborationDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ collaborationId: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const [{ collaborationId }, query] = await Promise.all([
    params,
    searchParams,
  ]);
  const detail = await getCollaborationDetail(collaborationId);
  const { collaboration, contributions } = detail;
  const me =
    collaboration.myRole === "owner"
      ? collaboration.owner
      : collaboration.collaborator;
  const other =
    collaboration.myRole === "owner"
      ? collaboration.collaborator
      : collaboration.owner;
  const hasMyContribution = contributions.some(
    (contribution) => contribution.contributor.userId === me.userId,
  );
  const myConfirmed =
    collaboration.myRole === "owner"
      ? collaboration.ownerConfirmed
      : collaboration.collaboratorConfirmed;

  return (
    <main
      id="main-content"
      className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-16"
    >
      <ButtonLink href="/connect/collaborations" variant="secondary">
        Back to Collaborations
      </ButtonLink>

      <section className="border-gold/20 bg-panel relative mt-6 overflow-hidden rounded-[2rem] border p-6 sm:p-10">
        <div
          aria-hidden="true"
          className="bg-gold/10 absolute -top-24 -right-24 size-64 rounded-full blur-3xl"
        />
        <div className="relative">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-gold font-mono text-xs tracking-[0.18em] uppercase">
                {collaboration.projectTitle}
              </p>
              <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl">
                {collaboration.objective}
              </h1>
            </div>
            <span className="border-gold/30 bg-gold/5 rounded-full border px-3 py-1.5 text-xs font-semibold">
              {collaborationStatusLabel(collaboration.status)}
            </span>
          </div>
          <p className="text-muted mt-5 max-w-3xl text-lg leading-8">
            You are building with {other.preferredName} · @{other.username}.
            This workspace shares only the collaboration agreement and
            structured contribution evidence—not private development data
            belonging to either Builder.
          </p>
        </div>
      </section>
      <Notice status={query.status} />

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <Surface className="p-6 sm:p-8">
          <p className="text-gold text-xs font-semibold tracking-wide uppercase">
            Working agreement
          </p>
          <dl className="mt-5 grid gap-5">
            <div>
              <dt className="text-sm font-semibold">Role needed</dt>
              <dd className="text-muted mt-2 leading-7">
                {collaboration.roleNeeded}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-semibold">
                Collaborator contribution
              </dt>
              <dd className="text-muted mt-2 leading-7">
                {collaboration.expectedContribution}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-semibold">
                Project owner contribution
              </dt>
              <dd className="text-muted mt-2 leading-7">
                {collaboration.ownerContribution}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-semibold">Commitment</dt>
              <dd className="text-muted mt-2 leading-7">
                {collaboration.commitmentNote}
              </dd>
            </div>
          </dl>
        </Surface>

        <Surface className="p-6 sm:p-8">
          <p className="text-primary text-xs font-semibold tracking-wide uppercase">
            Mutual proof
          </p>
          <h2 className="mt-3 text-2xl font-semibold">
            Completion needs evidence from both Builders.
          </h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="border-border rounded-2xl border p-4">
              <p className="font-semibold">
                {collaboration.owner.preferredName}
              </p>
              <p className="text-muted mt-2 text-sm">
                {collaboration.ownerConfirmed
                  ? "Contribution confirmed"
                  : "Confirmation pending"}
              </p>
            </div>
            <div className="border-border rounded-2xl border p-4">
              <p className="font-semibold">
                {collaboration.collaborator.preferredName}
              </p>
              <p className="text-muted mt-2 text-sm">
                {collaboration.collaboratorConfirmed
                  ? "Contribution confirmed"
                  : "Confirmation pending"}
              </p>
            </div>
          </div>

          {collaboration.status === "pending" ? (
            collaboration.myRole === "collaborator" ? (
              <div className="mt-6 flex flex-wrap gap-2">
                <form action={respondCollaborationAction}>
                  <input
                    type="hidden"
                    name="collaborationId"
                    value={collaboration.id}
                  />
                  <input type="hidden" name="action" value="accept" />
                  <input
                    type="hidden"
                    name="returnTo"
                    value={`/connect/collaborations/${collaboration.id}`}
                  />
                  <Button type="submit">Accept Collaboration</Button>
                </form>
                <form action={respondCollaborationAction}>
                  <input
                    type="hidden"
                    name="collaborationId"
                    value={collaboration.id}
                  />
                  <input type="hidden" name="action" value="decline" />
                  <input
                    type="hidden"
                    name="returnTo"
                    value={`/connect/collaborations/${collaboration.id}`}
                  />
                  <Button type="submit" variant="secondary">
                    Decline
                  </Button>
                </form>
              </div>
            ) : (
              <form action={closeCollaborationAction} className="mt-6">
                <input
                  type="hidden"
                  name="collaborationId"
                  value={collaboration.id}
                />
                <input type="hidden" name="action" value="withdraw" />
                <input
                  type="hidden"
                  name="returnTo"
                  value={`/connect/collaborations/${collaboration.id}`}
                />
                <Button type="submit" variant="secondary">
                  Withdraw Invitation
                </Button>
              </form>
            )
          ) : null}

          {collaboration.status === "accepted" ? (
            <div className="mt-6">
              {myConfirmed ? (
                <p className="border-success/30 bg-success/10 text-success rounded-2xl border p-4 text-sm">
                  You confirmed your contribution. Completion will become final
                  when both Builders have confirmed.
                </p>
              ) : hasMyContribution ? (
                <form action={confirmCollaborationCompletionAction}>
                  <input
                    type="hidden"
                    name="collaborationId"
                    value={collaboration.id}
                  />
                  <input
                    type="hidden"
                    name="returnTo"
                    value={`/connect/collaborations/${collaboration.id}`}
                  />
                  <Button type="submit">Confirm My Contribution</Button>
                </form>
              ) : (
                <p className="text-muted text-sm leading-6">
                  Record at least one real contribution below before confirming
                  completion.
                </p>
              )}
              <form action={closeCollaborationAction} className="mt-4">
                <input
                  type="hidden"
                  name="collaborationId"
                  value={collaboration.id}
                />
                <input type="hidden" name="action" value="cancel" />
                <input
                  type="hidden"
                  name="returnTo"
                  value="/connect/collaborations"
                />
                <Button type="submit" variant="ghost">
                  End Collaboration Without Completion
                </Button>
              </form>
            </div>
          ) : null}

          {collaboration.status === "completed" ? (
            <p className="border-gold/30 bg-gold/5 mt-6 rounded-2xl border p-4 text-sm leading-6">
              Both Builders confirmed contribution. This collaboration now has a
              durable evidence trail for future capability interpretation.
            </p>
          ) : null}
        </Surface>
      </section>

      {collaboration.status === "accepted" ? (
        <Surface className="mt-8 p-6 sm:p-8">
          <p className="text-gold text-xs font-semibold tracking-wide uppercase">
            Record a contribution
          </p>
          <h2 className="mt-3 text-2xl font-semibold">
            Show what you actually added to the work.
          </h2>
          <p className="text-muted mt-3 max-w-3xl leading-7">
            This is an evidence record, not a message thread. Describe your
            contribution, the proof and the next useful action.
          </p>
          <form
            action={addCollaborationContributionAction}
            className="mt-6 grid gap-5"
          >
            <input
              type="hidden"
              name="collaborationId"
              value={collaboration.id}
            />
            <input
              type="hidden"
              name="returnTo"
              value={`/connect/collaborations/${collaboration.id}`}
            />
            <label className="text-sm font-semibold">
              What I contributed
              <textarea
                name="contributionSummary"
                required
                maxLength={1200}
                className={textareaClass}
              />
            </label>
            <label className="text-sm font-semibold">
              Evidence or result
              <textarea
                name="evidenceNote"
                required
                maxLength={1200}
                className={textareaClass}
              />
            </label>
            <label className="text-sm font-semibold">
              Evidence link <span className="text-muted">(optional)</span>
              <input
                name="evidenceLink"
                type="url"
                maxLength={500}
                className={inputClass}
                placeholder="https://"
              />
            </label>
            <label className="text-sm font-semibold">
              Next useful step
              <textarea
                name="nextStep"
                required
                maxLength={600}
                className={textareaClass}
              />
            </label>
            <Button type="submit">Record Contribution</Button>
          </form>
        </Surface>
      ) : null}

      <section className="mt-10">
        <p className="text-gold text-xs font-semibold tracking-wide uppercase">
          Contribution evidence
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight">
          A shared record of who added what.
        </h2>
        {contributions.length === 0 ? (
          <Surface className="mt-6 p-6">
            <p className="text-muted leading-7">
              No contribution has been recorded yet.
            </p>
          </Surface>
        ) : (
          <ol className="mt-6 space-y-4">
            {contributions.map((contribution) => (
              <li key={contribution.id}>
                <Surface className="p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-semibold">
                      {contribution.contributor.preferredName} · @
                      {contribution.contributor.username}
                    </p>
                    <span className="text-muted text-xs">
                      {new Date(contribution.createdAt).toLocaleDateString(
                        "en",
                        {
                          dateStyle: "medium",
                        },
                      )}
                    </span>
                  </div>
                  <p className="mt-4 leading-7">
                    {contribution.contributionSummary}
                  </p>
                  <div className="border-border mt-4 border-t pt-4">
                    <p className="text-xs font-semibold tracking-wide uppercase">
                      Evidence
                    </p>
                    <p className="text-muted mt-2 text-sm leading-6">
                      {contribution.evidenceNote}
                    </p>
                    {contribution.evidenceLink ? (
                      <a
                        href={contribution.evidenceLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-gold mt-2 inline-block text-sm underline underline-offset-4"
                      >
                        Open evidence link
                      </a>
                    ) : null}
                  </div>
                  <p className="text-muted mt-4 text-sm">
                    Next: {contribution.nextStep}
                  </p>
                </Surface>
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
  );
}
