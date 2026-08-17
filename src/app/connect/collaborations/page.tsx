import type { Metadata } from "next";
import { Button, ButtonLink } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import {
  closeCollaborationAction,
  createCollaborationAction,
  respondCollaborationAction,
} from "@/modules/collaboration/application/collaboration-actions";
import { collaborationStatusLabel } from "@/modules/collaboration/domain/collaboration-contract";
import {
  getCollaborationState,
  type CollaborationItem,
} from "@/modules/collaboration/infrastructure/collaboration-dal";

export const metadata: Metadata = {
  title: "Builder Collaborations",
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
        ? "That collaboration action could not be completed. The relationship, Project or evidence requirements may have changed."
        : status === "created"
          ? "Collaboration invitation sent. The other Builder must accept before either person can record contributions."
          : "Collaboration updated."}
    </p>
  );
}

function CollaborationCard({ item }: { item: CollaborationItem }) {
  const other = item.myRole === "owner" ? item.collaborator : item.owner;
  return (
    <Surface className="flex h-full flex-col p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-gold text-xs font-semibold tracking-wide uppercase">
            {item.projectTitle}
          </p>
          <h3 className="mt-2 text-xl font-semibold">{item.objective}</h3>
        </div>
        <span className="border-border rounded-full border px-2.5 py-1 text-xs font-semibold">
          {collaborationStatusLabel(item.status)}
        </span>
      </div>
      <p className="text-muted mt-4 text-sm leading-6">
        Building with {other.preferredName} · @{other.username}
      </p>
      <div className="border-border mt-5 rounded-2xl border p-4 text-sm">
        <p className="font-semibold">Role needed</p>
        <p className="text-muted mt-2 leading-6">{item.roleNeeded}</p>
      </div>
      <ButtonLink
        href={`/connect/collaborations/${item.id}`}
        variant="secondary"
        className="mt-5"
      >
        Open Collaboration
      </ButtonLink>
    </Surface>
  );
}

export default async function CollaborationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const [state, query] = await Promise.all([
    getCollaborationState(),
    searchParams,
  ]);
  const unavailable = new Set(
    [...state.sent, ...state.active]
      .filter((item) => item.projectId === state.activeProject?.id)
      .map((item) => item.collaborator.userId),
  );
  const inviteOptions = state.availableConnections.filter(
    (connection) => !unavailable.has(connection.userId),
  );

  return (
    <main
      id="main-content"
      className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-16"
    >
      <ButtonLink href="/connect" variant="secondary">
        Back to Builder Connect
      </ButtonLink>

      <section className="border-gold/20 bg-panel relative mt-6 overflow-hidden rounded-[2rem] border px-6 py-10 sm:px-10 sm:py-14">
        <div
          aria-hidden="true"
          className="bg-gold/10 absolute -top-24 -right-20 size-64 rounded-full blur-3xl"
        />
        <div className="relative max-w-4xl">
          <p className="text-gold font-mono text-xs tracking-[0.2em] uppercase">
            Builder Collaboration
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
            Build together. Prove contribution.
          </h1>
          <p className="text-muted mt-5 max-w-3xl text-lg leading-8">
            Collaboration begins with an accepted Builder connection and a real
            Project. It uses structured contributions and mutual completion—not
            unrestricted chat, likes or popularity scores.
          </p>
        </div>
      </section>
      <Notice status={query.status} />

      {!state.eligible ? (
        <Surface className="border-gold/30 bg-gold/5 mt-8 p-6 sm:p-8">
          <p className="text-gold text-xs font-semibold tracking-wide uppercase">
            Safeguarding boundary
          </p>
          <h2 className="mt-3 text-2xl font-semibold">
            Collaboration is adult-only in this MVP.
          </h2>
          <p className="text-muted mt-3 max-w-3xl leading-7">
            Younger Builders keep their complete private development pathway.
            Cross-user collaboration needs a dedicated guardian and institution
            safeguarding model before it can expand safely.
          </p>
          <ButtonLink href="/journey" className="mt-6">
            Continue Private Journey
          </ButtonLink>
        </Surface>
      ) : (
        <>
          <section className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <Surface className="p-6 sm:p-8">
              <p className="text-gold text-xs font-semibold tracking-wide uppercase">
                Start from real work
              </p>
              <h2 className="mt-3 text-2xl font-semibold">
                Invite one trusted Builder into your active Project.
              </h2>
              {!state.activeProject ? (
                <div className="mt-5">
                  <p className="text-muted leading-7">
                    You need one active Builder Project before collaboration can
                    begin. The collaborator will never receive your raw Project
                    notes or private Quest evidence.
                  </p>
                  <ButtonLink href="/projects" className="mt-5">
                    Open Builder Projects
                  </ButtonLink>
                </div>
              ) : inviteOptions.length === 0 ? (
                <div className="mt-5">
                  <p className="text-muted leading-7">
                    Your active Project is ready, but there is no unused accepted
                    connection available for a new invitation yet.
                  </p>
                  <ButtonLink href="/connect" className="mt-5">
                    Discover Builders
                  </ButtonLink>
                </div>
              ) : (
                <form action={createCollaborationAction} className="mt-6 grid gap-5">
                  <input
                    type="hidden"
                    name="projectId"
                    value={state.activeProject.id}
                  />
                  <input
                    type="hidden"
                    name="returnTo"
                    value="/connect/collaborations"
                  />
                  <div className="border-gold/25 bg-gold/5 rounded-2xl border p-4">
                    <p className="text-xs font-semibold tracking-wide uppercase">
                      Active Project
                    </p>
                    <p className="mt-2 font-semibold">{state.activeProject.title}</p>
                  </div>
                  <label className="text-sm font-semibold">
                    Builder to invite
                    <select name="collaboratorId" required className={inputClass}>
                      <option value="">Choose an accepted connection</option>
                      {inviteOptions.map((person) => (
                        <option key={person.userId} value={person.userId}>
                          {person.preferredName} (@{person.username})
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm font-semibold">
                    Collaboration objective
                    <textarea
                      name="objective"
                      required
                      maxLength={800}
                      className={textareaClass}
                      placeholder="What useful result should you create together?"
                    />
                  </label>
                  <label className="text-sm font-semibold">
                    Role needed
                    <input
                      name="roleNeeded"
                      required
                      maxLength={120}
                      className={inputClass}
                      placeholder="Research partner, designer, tester..."
                    />
                  </label>
                  <label className="text-sm font-semibold">
                    What you need them to contribute
                    <textarea
                      name="expectedContribution"
                      required
                      maxLength={800}
                      className={textareaClass}
                    />
                  </label>
                  <label className="text-sm font-semibold">
                    What you will contribute
                    <textarea
                      name="ownerContribution"
                      required
                      maxLength={800}
                      className={textareaClass}
                    />
                  </label>
                  <label className="text-sm font-semibold">
                    Commitment and timeframe
                    <textarea
                      name="commitmentNote"
                      required
                      maxLength={400}
                      className={textareaClass}
                      placeholder="For example: two 45-minute working sessions this week."
                    />
                  </label>
                  <Button type="submit">Send Collaboration Invitation</Button>
                </form>
              )}
            </Surface>

            <div className="space-y-6">
              <Surface className="p-6 sm:p-8">
                <p className="text-primary text-xs font-semibold tracking-wide uppercase">
                  Invitations for you
                </p>
                <h2 className="mt-3 text-2xl font-semibold">
                  Accept the work, not just the connection.
                </h2>
                {state.incoming.length === 0 ? (
                  <p className="text-muted mt-4 leading-7">
                    No collaboration invitations are waiting.
                  </p>
                ) : (
                  <div className="mt-5 space-y-4">
                    {state.incoming.map((item) => (
                      <div
                        key={item.id}
                        className="border-border rounded-2xl border p-5"
                      >
                        <p className="text-gold text-xs font-semibold uppercase">
                          {item.projectTitle}
                        </p>
                        <h3 className="mt-2 text-lg font-semibold">
                          {item.objective}
                        </h3>
                        <p className="text-muted mt-2 text-sm leading-6">
                          From {item.owner.preferredName} · Role: {item.roleNeeded}
                        </p>
                        <p className="text-muted mt-3 text-sm leading-6">
                          Expected: {item.expectedContribution}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <form action={respondCollaborationAction}>
                            <input
                              type="hidden"
                              name="collaborationId"
                              value={item.id}
                            />
                            <input type="hidden" name="action" value="accept" />
                            <input
                              type="hidden"
                              name="returnTo"
                              value="/connect/collaborations"
                            />
                            <Button type="submit">Accept</Button>
                          </form>
                          <form action={respondCollaborationAction}>
                            <input
                              type="hidden"
                              name="collaborationId"
                              value={item.id}
                            />
                            <input type="hidden" name="action" value="decline" />
                            <input
                              type="hidden"
                              name="returnTo"
                              value="/connect/collaborations"
                            />
                            <Button type="submit" variant="secondary">
                              Decline
                            </Button>
                          </form>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Surface>

              <Surface className="p-6 sm:p-8">
                <p className="text-gold text-xs font-semibold tracking-wide uppercase">
                  Invitations you sent
                </p>
                {state.sent.length === 0 ? (
                  <p className="text-muted mt-3 text-sm leading-6">
                    No invitation is waiting for a response.
                  </p>
                ) : (
                  <div className="mt-4 space-y-4">
                    {state.sent.map((item) => (
                      <div
                        key={item.id}
                        className="border-border rounded-2xl border p-4"
                      >
                        <p className="font-semibold">{item.objective}</p>
                        <p className="text-muted mt-2 text-sm">
                          Waiting for {item.collaborator.preferredName}
                        </p>
                        <form action={closeCollaborationAction} className="mt-3">
                          <input
                            type="hidden"
                            name="collaborationId"
                            value={item.id}
                          />
                          <input type="hidden" name="action" value="withdraw" />
                          <input
                            type="hidden"
                            name="returnTo"
                            value="/connect/collaborations"
                          />
                          <Button type="submit" variant="ghost">
                            Withdraw invitation
                          </Button>
                        </form>
                      </div>
                    ))}
                  </div>
                )}
              </Surface>
            </div>
          </section>

          <section className="mt-12">
            <p className="text-gold text-xs font-semibold tracking-wide uppercase">
              Active collaborations
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              Contribution becomes evidence only when both Builders do the work.
            </h2>
            {state.active.length === 0 ? (
              <Surface className="mt-6 p-6">
                <p className="text-muted leading-7">
                  No accepted collaboration is active yet.
                </p>
              </Surface>
            ) : (
              <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {state.active.map((item) => (
                  <CollaborationCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </section>

          {state.completed.length ? (
            <section className="mt-12">
              <p className="text-gold text-xs font-semibold tracking-wide uppercase">
                Completed collaboration evidence
              </p>
              <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {state.completed.map((item) => (
                  <CollaborationCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          ) : null}
        </>
      )}
    </main>
  );
}
