import type { Metadata } from "next";
import Link from "next/link";
import { Button, ButtonLink } from "@/components/ui/button";
import {
  addBuilderNetworkCommentAction,
  createBuilderNetworkPostAction,
  joinBuilderNetworkAction,
  manageBuilderNetworkConnectionAction,
  reportBuilderNetworkAction,
  setBuilderNetworkReactionAction,
  startBuilderNetworkConversationAction,
  withdrawBuilderNetworkAction,
} from "@/modules/builder-network/application/builder-network-actions";
import {
  builderNetworkPostKindLabel,
  builderNetworkReactionCodes,
  builderNetworkReactionLabel,
} from "@/modules/builder-network/domain/builder-network-contract";
import {
  getBuilderWorldState,
  type BuilderNetworkRelationship,
} from "@/modules/builder-network/infrastructure/builder-network-dal";

export const metadata: Metadata = {
  title: "Builder World",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

const inputClass =
  "min-h-11 w-full rounded-2xl border border-[#e2e3eb] bg-white px-3 text-sm text-[#25284a] shadow-sm outline-none focus:border-[#765fe8]";

function statusNotice(status?: string) {
  if (!status) return null;
  const error = status === "error";
  return (
    <p
      role={error ? "alert" : "status"}
      className={`mb-4 rounded-2xl border p-4 text-sm ${
        error
          ? "border-[#f4b7c1] bg-[#fff3f5] text-[#a7354a]"
          : "border-[#b9e9df] bg-[#effbf8] text-[#147b6c]"
      }`}
    >
      {error
        ? "That Builder World action could not be completed safely."
        : "Builder World updated."}
    </p>
  );
}

function SafetyActions({ targetUserId }: { targetUserId: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <details className="relative">
        <summary className="cursor-pointer list-none rounded-full px-3 py-2 text-xs font-semibold text-[#7b5360] hover:bg-[#fff2f4]">
          Report
        </summary>
        <form
          action={reportBuilderNetworkAction}
          className="absolute right-0 z-20 mt-2 grid w-72 gap-3 rounded-2xl border border-[#eadde1] bg-white p-4 shadow-xl"
        >
          <input type="hidden" name="targetUserId" value={targetUserId} />
          <label className="text-xs font-bold text-[#444963]">
            Reason
            <select name="reasonCode" className={`${inputClass} mt-1`}>
              <option value="spam">Spam</option>
              <option value="harassment">Harassment</option>
              <option value="unsafe_contact">Unsafe contact</option>
              <option value="impersonation">Impersonation</option>
              <option value="inappropriate_content">
                Inappropriate content
              </option>
              <option value="other">Other</option>
            </select>
          </label>
          <label className="text-xs font-bold text-[#444963]">
            Factual detail <span className="font-normal">(optional)</span>
            <textarea
              name="detail"
              maxLength={500}
              rows={3}
              className="mt-1 w-full rounded-xl border border-[#e2e3eb] p-3 text-sm font-normal text-[#25284a]"
            />
          </label>
          <Button type="submit" variant="secondary" className="rounded-full">
            Submit report
          </Button>
        </form>
      </details>
      <form action={manageBuilderNetworkConnectionAction}>
        <input type="hidden" name="action" value="block" />
        <input type="hidden" name="targetUserId" value={targetUserId} />
        <Button
          type="submit"
          variant="ghost"
          className="min-h-9 rounded-full px-3 text-xs text-[#9d3f54]"
        >
          Block
        </Button>
      </form>
    </div>
  );
}

function RelationshipActions({ item }: { item: BuilderNetworkRelationship }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {item.canMessage ? (
        <form action={startBuilderNetworkConversationAction}>
          <input type="hidden" name="targetUserId" value={item.userId} />
          <Button type="submit" className="min-h-9 rounded-full px-3 text-xs">
            Message
          </Button>
        </form>
      ) : null}
      <form action={manageBuilderNetworkConnectionAction}>
        <input type="hidden" name="action" value="remove" />
        <input type="hidden" name="connectionId" value={item.connectionId} />
        <Button
          type="submit"
          variant="ghost"
          className="min-h-9 rounded-full px-3 text-xs"
        >
          Remove
        </Button>
      </form>
      <SafetyActions targetUserId={item.userId} />
    </div>
  );
}

export default async function BuilderWorldPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const [state, query] = await Promise.all([
    getBuilderWorldState(),
    searchParams,
  ]);

  return (
    <main id="main-content" className="w-full pb-10">
      <section className="bg-[#201b59] px-4 pt-5 pb-12 text-white sm:px-6 sm:pt-8 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold tracking-[0.12em] text-[#d9ceff] uppercase">
                Connect · Builder World
              </p>
              <h1 className="mt-1 text-[2rem] font-bold tracking-[-0.04em] sm:text-4xl">
                Build in public. Grow through people.
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-indigo-100/75">
                Share useful progress, ask for help and meet Builders who can
                move the work forward. No popularity game.
              </p>
            </div>
            {state.joined ? (
              <ButtonLink
                href="/connect/messages"
                variant="secondary"
                className="shrink-0 rounded-full"
              >
                Messages
                {state.unreadMessages ? ` · ${state.unreadMessages}` : ""}
              </ButtonLink>
            ) : null}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <ButtonLink
              href="/connect"
              variant="ghost"
              className="rounded-full border border-white/15 bg-white/8 text-white"
            >
              Connect home
            </ButtonLink>
            <span className="rounded-full border border-white/12 bg-white/8 px-3 py-2 text-xs font-semibold text-indigo-50">
              Finite feed · purposeful interaction
            </span>
          </div>
        </div>
      </section>

      <div className="relative -mt-5 rounded-t-[2rem] bg-[#f7f8fc] pt-5">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {statusNotice(query.status)}

          {!state.eligible ? (
            <section className="pp-app-card p-6 sm:p-8">
              <p className="text-xs font-bold tracking-[0.12em] text-[#9a7520] uppercase">
                Protected network boundary
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-[#25284a]">
                Builder World is not available for this account yet.
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[#747b90]">
                Adults must meet the existing Connect safety requirements.
                School Builders aged 13–17 also need an active school cohort and
                their school must deliberately enable the School Builder
                Network. Under-13 accounts remain outside this social layer.
              </p>
              <ButtonLink href="/build" className="mt-5 rounded-full">
                Continue building →
              </ButtonLink>
            </section>
          ) : !state.joined ? (
            <section className="pp-app-card p-6 sm:p-8">
              <p className="text-xs font-bold tracking-[0.12em] text-[#6848dc] uppercase">
                Opt-in network
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-[#25284a]">
                Enter Builder World deliberately.
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[#747b90]">
                Your private Discovery, Mission, Journey, Quest evidence and
                reflections do not become public. Only activity you deliberately
                post here enters Builder World. You can leave at any time.
              </p>
              <form action={joinBuilderNetworkAction} className="mt-5">
                <label className="flex max-w-2xl items-start gap-3 rounded-2xl border border-[#dedbee] bg-[#faf9ff] p-4 text-sm leading-6 text-[#555b72]">
                  <input
                    type="checkbox"
                    name="policyAccepted"
                    required
                    className="mt-1"
                  />
                  <span>
                    I understand Builder World is for purposeful building,
                    collaboration and help—not popularity. I agree to the
                    network safety rules.
                  </span>
                </label>
                <Button type="submit" className="mt-4 rounded-full">
                  Enter Builder World
                </Button>
              </form>
            </section>
          ) : (
            <>
              <section className="pp-app-card p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold tracking-[0.12em] text-[#6848dc] uppercase">
                      Share one useful signal
                    </p>
                    <h2 className="mt-1 text-xl font-bold text-[#303353]">
                      What moved in the real world?
                    </h2>
                  </div>
                  <span className="rounded-full bg-[#f0ebff] px-3 py-1.5 text-xs font-bold text-[#6042d8]">
                    {state.scope === "school"
                      ? (state.schoolName ?? "School Builder")
                      : "Builder Network"}
                  </span>
                </div>
                <form
                  action={createBuilderNetworkPostAction}
                  className="mt-4 grid gap-3"
                >
                  <select
                    name="kind"
                    className={inputClass}
                    defaultValue="build_update"
                  >
                    <option value="build_update">Build update</option>
                    <option value="milestone">Milestone</option>
                    <option value="help_request">I need help</option>
                    <option value="insight">Builder insight</option>
                  </select>
                  <textarea
                    name="body"
                    required
                    minLength={20}
                    maxLength={1000}
                    rows={4}
                    placeholder="Share what you tried, what changed, what you learned, or the specific help you need…"
                    className="w-full rounded-2xl border border-[#e2e3eb] bg-white p-4 text-sm leading-6 text-[#25284a] shadow-sm outline-none placeholder:text-[#9ba1b4] focus:border-[#765fe8]"
                  />
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs leading-5 text-[#858b9f]">
                      Private developmental evidence stays private. Post only
                      what you deliberately want the Builder Network to see.
                    </p>
                    <Button type="submit" className="shrink-0 rounded-full">
                      Share
                    </Button>
                  </div>
                </form>
              </section>

              <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.7fr)]">
                <section aria-labelledby="builder-feed-heading">
                  <div className="flex items-end justify-between gap-3 px-1">
                    <div>
                      <p className="text-xs font-bold tracking-[0.12em] text-[#16a28f] uppercase">
                        Builder Feed
                      </p>
                      <h2
                        id="builder-feed-heading"
                        className="mt-1 text-xl font-bold text-[#303353]"
                      >
                        Movement, not performance
                      </h2>
                    </div>
                    <span className="text-xs font-semibold text-[#8a90a4]">
                      {state.feed.length} recent
                    </span>
                  </div>

                  {state.feed.length ? (
                    <div className="mt-3 grid gap-4">
                      {state.feed.map((post) => (
                        <article key={post.id} className="pp-app-card p-5 sm:p-6">
                          <div className="flex items-start gap-3">
                            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#6d5df5] to-[#2b236e] text-sm font-bold text-white">
                              {post.author.preferredName.slice(0, 1).toUpperCase()}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                <strong className="text-sm text-[#303353]">
                                  {post.author.preferredName}
                                </strong>
                                <span className="text-xs text-[#8a90a4]">
                                  @{post.author.username}
                                </span>
                                {post.schoolName ? (
                                  <span className="rounded-full bg-[#eef8f6] px-2 py-0.5 text-[0.65rem] font-bold text-[#168b7b]">
                                    {post.schoolName}
                                  </span>
                                ) : null}
                              </div>
                              <p className="mt-1 text-[0.68rem] font-bold tracking-[0.1em] text-[#6848dc] uppercase">
                                {builderNetworkPostKindLabel(post.kind)}
                              </p>
                            </div>
                          </div>

                          <p className="mt-4 text-[0.94rem] leading-7 whitespace-pre-wrap text-[#41455f]">
                            {post.body}
                          </p>
                          {post.project ? (
                            <div className="mt-4 rounded-2xl border border-[#e9e7f4] bg-[#faf9ff] p-3 text-xs text-[#5f6380]">
                              Linked build: <strong>{post.project.title}</strong>
                            </div>
                          ) : null}

                          <div className="mt-4 flex flex-wrap gap-2 border-t border-[#ececf3] pt-4">
                            {builderNetworkReactionCodes.map((reaction) => {
                              const count =
                                reaction === "useful"
                                  ? post.reactions.useful
                                  : reaction === "can_help"
                                    ? post.reactions.canHelp
                                    : post.reactions.keepBuilding;
                              const active = post.myReaction === reaction;
                              return (
                                <form key={reaction} action={setBuilderNetworkReactionAction}>
                                  <input type="hidden" name="postId" value={post.id} />
                                  <input type="hidden" name="reaction" value={reaction} />
                                  <Button
                                    type="submit"
                                    variant={active ? "primary" : "secondary"}
                                    className="min-h-9 rounded-full px-3 py-1.5 text-xs"
                                  >
                                    {builderNetworkReactionLabel(reaction)}
                                    {count ? ` · ${count}` : ""}
                                  </Button>
                                </form>
                              );
                            })}
                          </div>

                          {post.comments.length ? (
                            <div className="mt-4 grid gap-2">
                              {post.comments.map((comment) => (
                                <div
                                  key={comment.id}
                                  className="rounded-2xl bg-[#f7f7fb] p-3 text-xs leading-5 text-[#596078]"
                                >
                                  <strong className="text-[#353957]">
                                    {comment.author.preferredName}
                                  </strong>{" "}
                                  {comment.body}
                                </div>
                              ))}
                              {post.commentCount > post.comments.length ? (
                                <p className="text-xs text-[#8a90a4]">
                                  {post.commentCount - post.comments.length} more comment(s)
                                </p>
                              ) : null}
                            </div>
                          ) : null}
                          <form
                            action={addBuilderNetworkCommentAction}
                            className="mt-3 flex gap-2"
                          >
                            <input type="hidden" name="postId" value={post.id} />
                            <input
                              name="body"
                              required
                              maxLength={500}
                              placeholder="Add something useful…"
                              className={inputClass}
                            />
                            <Button
                              type="submit"
                              variant="secondary"
                              className="shrink-0 rounded-full"
                            >
                              Reply
                            </Button>
                          </form>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="pp-app-card mt-3 p-6">
                      <p className="text-sm leading-6 text-[#747b90]">
                        The feed is quiet. That is okay. Builder World only
                        shows real posts from eligible people; PipuPath never
                        fabricates activity to make the network look busy.
                      </p>
                    </div>
                  )}
                </section>

                <aside className="space-y-4">
                  <section className="pp-app-card p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold tracking-[0.12em] text-[#6848dc] uppercase">
                          Builders
                        </p>
                        <h2 className="mt-1 text-lg font-bold text-[#303353]">
                          People you can build with
                        </h2>
                      </div>
                      <span className="text-xs font-bold text-[#8a90a4]">
                        {state.builders.length}
                      </span>
                    </div>
                    <div className="mt-4 grid gap-3">
                      {state.builders.slice(0, 8).map((builder) => (
                        <div
                          key={builder.userId}
                          id={builder.userId}
                          className="rounded-2xl border border-[#e8e8f0] bg-[#fbfbfe] p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-[#303353]">
                                {builder.preferredName}
                              </p>
                              <p className="mt-0.5 truncate text-xs text-[#858b9f]">
                                @{builder.username}
                                {builder.schoolName ? ` · ${builder.schoolName}` : ""}
                              </p>
                            </div>
                            {builder.relationship === "none" ||
                            ["declined", "cancelled", "removed"].includes(
                              builder.relationship,
                            ) ? (
                              <form action={manageBuilderNetworkConnectionAction}>
                                <input type="hidden" name="action" value="send" />
                                <input
                                  type="hidden"
                                  name="targetUserId"
                                  value={builder.userId}
                                />
                                <Button
                                  type="submit"
                                  variant="secondary"
                                  className="min-h-8 rounded-full px-3 text-xs"
                                >
                                  Connect
                                </Button>
                              </form>
                            ) : (
                              <span className="rounded-full bg-[#f0ebff] px-2 py-1 text-[0.65rem] font-bold text-[#6042d8]">
                                {builder.relationship}
                              </span>
                            )}
                          </div>
                          <p className="mt-3 line-clamp-3 text-xs leading-5 text-[#6f768d]">
                            {builder.missionStatement ??
                              builder.missionTitle ??
                              "Building a practical mission."}
                          </p>
                          <div className="mt-3 border-t border-[#ececf3] pt-3">
                            <SafetyActions targetUserId={builder.userId} />
                          </div>
                        </div>
                      ))}
                      {!state.builders.length ? (
                        <p className="text-sm leading-6 text-[#747b90]">
                          No compatible Builder is visible yet. The network
                          grows only from real opt-in participation.
                        </p>
                      ) : null}
                    </div>
                  </section>

                  {state.incoming.length > 0 || state.sent.length > 0 ? (
                    <section className="pp-app-card p-5">
                      <p className="text-xs font-bold tracking-[0.12em] text-[#16a28f] uppercase">
                        Requests
                      </p>
                      {state.incoming.map((item) => (
                        <div
                          key={item.connectionId}
                          className="mt-3 flex items-center justify-between gap-3 border-b border-[#ececf3] pb-3 last:border-0"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-[#303353]">
                              {item.preferredName}
                            </p>
                            <p className="text-xs text-[#858b9f]">@{item.username}</p>
                          </div>
                          <div className="flex gap-1.5">
                            <form action={manageBuilderNetworkConnectionAction}>
                              <input type="hidden" name="action" value="accept" />
                              <input
                                type="hidden"
                                name="connectionId"
                                value={item.connectionId}
                              />
                              <Button
                                type="submit"
                                className="min-h-8 rounded-full px-2.5 text-xs"
                              >
                                Accept
                              </Button>
                            </form>
                            <form action={manageBuilderNetworkConnectionAction}>
                              <input type="hidden" name="action" value="decline" />
                              <input
                                type="hidden"
                                name="connectionId"
                                value={item.connectionId}
                              />
                              <Button
                                type="submit"
                                variant="ghost"
                                className="min-h-8 rounded-full px-2.5 text-xs"
                              >
                                Decline
                              </Button>
                            </form>
                          </div>
                        </div>
                      ))}
                      {state.sent.map((item) => (
                        <div
                          key={item.connectionId}
                          className="mt-3 flex items-center justify-between gap-3 border-b border-[#ececf3] pb-3 last:border-0"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-[#303353]">
                              {item.preferredName}
                            </p>
                            <p className="text-xs text-[#858b9f]">Pending</p>
                          </div>
                          <form action={manageBuilderNetworkConnectionAction}>
                            <input type="hidden" name="action" value="cancel" />
                            <input
                              type="hidden"
                              name="connectionId"
                              value={item.connectionId}
                            />
                            <Button
                              type="submit"
                              variant="ghost"
                              className="min-h-8 rounded-full px-2.5 text-xs"
                            >
                              Cancel
                            </Button>
                          </form>
                        </div>
                      ))}
                    </section>
                  ) : null}

                  <section className="pp-app-card p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold tracking-[0.12em] text-[#e17359] uppercase">
                          My Network
                        </p>
                        <h2 className="mt-1 text-lg font-bold text-[#303353]">
                          Deliberate relationships
                        </h2>
                      </div>
                      <span className="text-xs font-bold text-[#8a90a4]">
                        {state.connections.length}
                      </span>
                    </div>
                    <div className="mt-4 grid gap-3">
                      {state.connections.map((item) => (
                        <div
                          key={item.connectionId}
                          className="rounded-2xl border border-[#e8e8f0] p-4"
                        >
                          <Link
                            href={`/connect/world#${item.userId}`}
                            className="text-sm font-bold text-[#303353]"
                          >
                            {item.preferredName}
                          </Link>
                          <p className="mt-0.5 text-xs text-[#858b9f]">
                            @{item.username}
                          </p>
                          <div className="mt-3">
                            <RelationshipActions item={item} />
                          </div>
                        </div>
                      ))}
                      {!state.connections.length ? (
                        <p className="text-sm leading-6 text-[#747b90]">
                          No accepted connection yet. Connect only when there is
                          a real reason to learn, help or build together.
                        </p>
                      ) : null}
                    </div>
                  </section>

                  <section className="pp-app-card p-5">
                    <p className="text-xs font-bold tracking-[0.12em] text-[#8a90a4] uppercase">
                      Control
                    </p>
                    <p className="mt-2 text-xs leading-5 text-[#747b90]">
                      Leaving Builder World removes your live social
                      eligibility. Your private PipuPath development record
                      remains intact.
                    </p>
                    <form action={withdrawBuilderNetworkAction} className="mt-3">
                      <Button type="submit" variant="ghost" className="rounded-full">
                        Leave Builder World
                      </Button>
                    </form>
                  </section>
                </aside>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}