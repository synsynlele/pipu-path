import Link from "next/link";
import type { Metadata } from "next";
import { Button, ButtonLink } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import {
  manageConnectionAction,
  saveConnectProfileAction,
  shareContactAction,
} from "@/modules/connect/application/connect-actions";
import {
  getConnectState,
  type BuilderCard,
  type NetworkItem,
} from "@/modules/connect/infrastructure/connect-dal";

export const metadata: Metadata = {
  title: "Builder Connect",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

const inputClass =
  "border-border bg-white mt-2 min-h-12 w-full rounded-xl border px-3 text-sm text-slate-950 shadow-sm focus:border-primary";
const textareaClass =
  "border-border bg-white mt-2 min-h-24 w-full rounded-2xl border p-4 text-sm leading-6 text-slate-950 shadow-sm focus:border-primary";

function Notice({ status }: { status?: string }) {
  if (!status) return null;
  const error = status === "error";
  return (
    <p
      role={error ? "alert" : "status"}
      className={`mt-5 rounded-2xl border p-4 text-sm ${
        error
          ? "border-error/30 bg-error/10 text-error"
          : "border-success/30 bg-success/10 text-success"
      }`}
    >
      {error
        ? "That Connect action could not be completed. Review the details and try again."
        : status === "saved"
          ? "Your Builder World profile and privacy choice were saved."
          : "Your network was updated."}
    </p>
  );
}

function ActionForm({
  action,
  connectionId,
  targetUserId,
  label,
  variant = "secondary",
}: {
  action: "accept" | "decline" | "cancel" | "remove" | "unblock";
  connectionId?: string;
  targetUserId?: string;
  label: string;
  variant?: "primary" | "secondary" | "ghost";
}) {
  return (
    <form action={manageConnectionAction}>
      <input type="hidden" name="action" value={action} />
      <input type="hidden" name="returnTo" value="/connect" />
      {connectionId ? (
        <input type="hidden" name="connectionId" value={connectionId} />
      ) : null}
      {targetUserId ? (
        <input type="hidden" name="targetUserId" value={targetUserId} />
      ) : null}
      <Button
        type="submit"
        variant={variant}
        className="min-h-9 px-3 py-1.5 text-xs"
      >
        {label}
      </Button>
    </form>
  );
}

function BuilderCardView({ builder }: { builder: BuilderCard }) {
  return (
    <Surface className="flex h-full w-[19rem] shrink-0 flex-col p-5 sm:w-[21rem]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden="true"
            className="border-primary/20 bg-primary-soft text-primary grid size-11 shrink-0 place-items-center rounded-2xl border text-sm font-bold"
          >
            ◈
          </span>
          <div className="min-w-0">
            <h3 className="text-navy truncate text-lg font-semibold">
              {builder.preferredName}
            </h3>
            <p className="text-primary mt-0.5 truncate text-xs font-semibold">
              @{builder.username}
            </p>
          </div>
        </div>
        <span className="border-border text-muted rounded-full border px-2.5 py-1 text-[0.62rem] font-semibold uppercase">
          {builder.relationship === "none" ? "Discover" : builder.relationship}
        </span>
      </div>

      <p className="text-muted mt-4 line-clamp-3 text-sm leading-6">
        {builder.missionStatement ??
          "Building evidence around a practical mission."}
      </p>

      {builder.capabilities.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {builder.capabilities.slice(0, 4).map((capability) => (
            <span
              key={capability}
              className="bg-primary-soft text-primary rounded-full px-2.5 py-1 text-xs font-semibold"
            >
              {capability}
            </span>
          ))}
        </div>
      ) : null}

      <div className="border-border mt-4 grid gap-2 border-t pt-4 text-xs">
        <p className="text-muted line-clamp-2">
          <strong className="text-navy">Can help:</strong>{" "}
          {builder.canHelpWith || "Not stated yet"}
        </p>
        <p className="text-muted line-clamp-2">
          <strong className="text-navy">Needs:</strong>{" "}
          {builder.needsHelpWith || "Not stated yet"}
        </p>
      </div>

      <ButtonLink
        href={`/connect/builders/${builder.username}`}
        className="mt-auto pt-5"
        variant="secondary"
      >
        Meet This Builder →
      </ButtonLink>
    </Surface>
  );
}

function RequestRow({
  item,
  type,
}: {
  item: NetworkItem;
  type: "incoming" | "sent";
}) {
  return (
    <li className="border-border flex flex-wrap items-center justify-between gap-4 border-b py-4 last:border-0">
      <div>
        <Link
          href={`/connect/builders/${item.username}`}
          className="text-navy font-semibold hover:underline"
        >
          {item.preferredName}
        </Link>
        <p className="text-muted mt-1 text-xs">@{item.username}</p>
      </div>
      <div className="flex gap-2">
        {type === "incoming" ? (
          <>
            <ActionForm
              action="accept"
              connectionId={item.connectionId}
              label="Accept"
              variant="primary"
            />
            <ActionForm
              action="decline"
              connectionId={item.connectionId}
              label="Decline"
            />
          </>
        ) : (
          <ActionForm
            action="cancel"
            connectionId={item.connectionId}
            label="Cancel"
          />
        )}
      </div>
    </li>
  );
}

function ConnectionCard({
  item,
  profileHasEmail,
  profileHasWhatsapp,
}: {
  item: NetworkItem;
  profileHasEmail: boolean;
  profileHasWhatsapp: boolean;
}) {
  return (
    <Surface className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href={`/connect/builders/${item.username}`}
            className="text-navy text-xl font-semibold hover:underline"
          >
            {item.preferredName}
          </Link>
          <p className="text-muted mt-1 text-xs">@{item.username}</p>
        </div>
        <ActionForm
          action="remove"
          connectionId={item.connectionId}
          label="Remove"
          variant="ghost"
        />
      </div>

      <div className="border-border mt-4 rounded-xl border p-3 text-xs">
        <p className="text-navy font-semibold">Contact shared with you</p>
        <p className="text-muted mt-1.5 leading-5">
          {(item.sharedEmail ?? item.sharedWhatsapp)
            ? [item.sharedEmail, item.sharedWhatsapp]
                .filter(Boolean)
                .join(" · ")
            : "Nothing shared yet. A connection does not create private messaging access."}
        </p>
      </div>

      <details className="border-border mt-4 border-t pt-4">
        <summary className="text-navy cursor-pointer text-xs font-semibold">
          Manage my contact consent
        </summary>
        <form action={shareContactAction} className="mt-3">
          <input type="hidden" name="connectionId" value={item.connectionId} />
          <input type="hidden" name="returnTo" value="/connect" />
          <fieldset>
            <legend className="text-xs font-semibold">
              Explicit contact sharing
            </legend>
            <div className="mt-3 grid gap-2 text-xs">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="shareEmail"
                  defaultChecked={item.myShareEmail}
                  disabled={!profileHasEmail}
                />
                Share saved email
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="shareWhatsapp"
                  defaultChecked={item.myShareWhatsapp}
                  disabled={!profileHasWhatsapp}
                />
                Share saved WhatsApp
              </label>
            </div>
          </fieldset>
          <Button
            type="submit"
            variant="secondary"
            className="mt-3 min-h-9 px-3 py-1.5 text-xs"
          >
            Update consent
          </Button>
        </form>
      </details>
    </Surface>
  );
}

export default async function ConnectPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const [state, query] = await Promise.all([getConnectState(), searchParams]);
  const pendingCount = state.incoming.length + state.sent.length;

  return (
    <main
      id="main-content"
      className="mx-auto max-w-7xl px-4 py-7 sm:px-8 sm:py-12 lg:px-10"
    >
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#07142f] p-6 text-white sm:p-9">
        <div
          aria-hidden="true"
          className="absolute -top-28 -right-20 size-72 rounded-full border border-white/10"
        />
        <div
          aria-hidden="true"
          className="absolute right-12 -bottom-36 size-72 rounded-full bg-[#4f7cff]/18 blur-3xl"
        />
        <div className="relative max-w-4xl">
          <p className="text-xs font-semibold tracking-[0.18em] text-[#f3c86b] uppercase">
            Connect · Builder World
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            Find people to build with—not people to impress.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-blue-50/75 sm:text-base">
            PipuPath connects complementary missions and capabilities without follower counts, popularity scores or unrestricted private messaging.
          </p>
          {state.eligible ? (
            <div className="mt-6 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-blue-50">
                {state.discover.length} discoverable {state.discover.length === 1 ? "Builder" : "Builders"}
              </span>
              <span className="rounded-full border border-white/15 px-3 py-1.5 text-blue-100">
                {state.connections.length} accepted {state.connections.length === 1 ? "connection" : "connections"}
              </span>
              {pendingCount > 0 ? (
                <span className="rounded-full border border-[#f3c86b]/25 bg-[#f3c86b]/8 px-3 py-1.5 font-semibold text-[#f3c86b]">
                  {pendingCount} pending
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>
      <Notice status={query.status} />

      {!state.eligible ? (
        <Surface className="border-gold/30 bg-gold/5 mt-6 p-6 sm:p-8">
          <p className="text-gold text-xs font-semibold tracking-[0.14em] uppercase">
            Builder World protected by safeguarding
          </p>
          <h2 className="text-navy mt-2 text-2xl font-semibold tracking-tight">
            Public discovery and direct contact sharing stay closed for younger Builders.
          </h2>
          <p className="text-muted mt-3 max-w-3xl text-sm leading-6">
            Your complete private PipuPath adventure remains available. Youth networking needs a dedicated guardian and institutional safeguarding system, so PipuPath will not reduce that protection to a checkbox.
          </p>
          <ButtonLink href="/journey" className="mt-5">
            Continue My Adventure →
          </ButtonLink>
        </Surface>
      ) : (
        <>
          <section className="mt-7" aria-labelledby="discover-builders-heading">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-gold text-xs font-semibold tracking-[0.14em] uppercase">
                  Explore the Builder World
                </p>
                <h2
                  id="discover-builders-heading"
                  className="text-navy mt-2 text-3xl font-semibold tracking-tight"
                >
                  Complementary people. No popularity contest.
                </h2>
              </div>
              <span className="text-muted max-w-sm text-xs leading-5">
                Discovery is opt-in. Safe profile fields appear only when a Builder deliberately enables visibility.
              </span>
            </div>

            {state.discover.length ? (
              <div className="mt-5 flex gap-4 overflow-x-auto pb-3 [scrollbar-width:thin]">
                {state.discover.map((builder) => (
                  <BuilderCardView key={builder.userId} builder={builder} />
                ))}
              </div>
            ) : (
              <Surface className="mt-5 p-6">
                <p className="text-muted text-sm leading-6">
                  The Builder World is quiet right now. No other adult Builder has deliberately enabled discoverability yet.
                </p>
              </Surface>
            )}
          </section>

          <section className="mt-8 grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
            <div>
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-primary text-xs font-semibold tracking-[0.14em] uppercase">
                    My Network
                  </p>
                  <h2 className="text-navy mt-2 text-2xl font-semibold tracking-tight">
                    People you deliberately connected with
                  </h2>
                </div>
                <ButtonLink
                  href="/connect/collaborations"
                  variant="secondary"
                  className="min-h-10"
                >
                  Collaborations →
                </ButtonLink>
              </div>

              {state.connections.length ? (
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {state.connections.map((item) => (
                    <ConnectionCard
                      key={item.connectionId}
                      item={item}
                      profileHasEmail={Boolean(state.profile?.contactEmail)}
                      profileHasWhatsapp={Boolean(state.profile?.contactWhatsapp)}
                    />
                  ))}
                </div>
              ) : (
                <Surface className="mt-5 p-5">
                  <p className="text-muted text-sm leading-6">
                    No accepted connections yet. Connection does not create messaging access; it opens only the relationship and consent controls PipuPath explicitly supports.
                  </p>
                </Surface>
              )}
            </div>

            <aside className="space-y-5">
              <Surface className="p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-gold text-xs font-semibold tracking-wide uppercase">
                      Requests
                    </p>
                    <h3 className="text-navy mt-1 text-lg font-semibold">
                      {pendingCount > 0 ? `${pendingCount} waiting` : "Nothing waiting"}
                    </h3>
                  </div>
                  <span className="border-border text-muted grid size-10 place-items-center rounded-xl border text-xs font-bold">
                    {pendingCount}
                  </span>
                </div>

                {state.incoming.length > 0 ? (
                  <>
                    <p className="text-muted mt-4 text-[0.68rem] font-semibold tracking-wide uppercase">
                      Incoming
                    </p>
                    <ul>
                      {state.incoming.map((item) => (
                        <RequestRow
                          key={item.connectionId}
                          item={item}
                          type="incoming"
                        />
                      ))}
                    </ul>
                  </>
                ) : null}

                {state.sent.length > 0 ? (
                  <>
                    <p className="text-muted mt-4 text-[0.68rem] font-semibold tracking-wide uppercase">
                      Sent
                    </p>
                    <ul>
                      {state.sent.map((item) => (
                        <RequestRow
                          key={item.connectionId}
                          item={item}
                          type="sent"
                        />
                      ))}
                    </ul>
                  </>
                ) : null}
              </Surface>

              <details className="border-border bg-panel rounded-2xl border p-5">
                <summary className="text-navy cursor-pointer text-sm font-semibold">
                  My discovery profile & privacy
                </summary>
                <form action={saveConnectProfileAction} className="mt-5 grid gap-4">
                  <input type="hidden" name="returnTo" value="/connect" />
                  <label className="text-sm font-semibold">
                    Interests <span className="text-muted">(comma separated)</span>
                    <input
                      name="interests"
                      required
                      defaultValue={state.profile?.interests.join(", ") ?? ""}
                      className={inputClass}
                      placeholder="education, agriculture, technology"
                    />
                  </label>
                  <label className="text-sm font-semibold">
                    Capabilities <span className="text-muted">(comma separated)</span>
                    <input
                      name="capabilities"
                      required
                      defaultValue={state.profile?.capabilities.join(", ") ?? ""}
                      className={inputClass}
                      placeholder="teaching, design, research"
                    />
                  </label>
                  <label className="text-sm font-semibold">
                    I can help with
                    <textarea
                      name="canHelpWith"
                      maxLength={320}
                      defaultValue={state.profile?.canHelpWith ?? ""}
                      className={textareaClass}
                    />
                  </label>
                  <label className="text-sm font-semibold">
                    I need help with
                    <textarea
                      name="needsHelpWith"
                      maxLength={320}
                      defaultValue={state.profile?.needsHelpWith ?? ""}
                      className={textareaClass}
                    />
                  </label>
                  <label className="text-sm font-semibold">
                    Private contact email
                    <input
                      name="contactEmail"
                      type="email"
                      defaultValue={state.profile?.contactEmail ?? ""}
                      className={inputClass}
                    />
                  </label>
                  <label className="text-sm font-semibold">
                    Private WhatsApp number
                    <input
                      name="contactWhatsapp"
                      defaultValue={state.profile?.contactWhatsapp ?? ""}
                      className={inputClass}
                    />
                  </label>
                  <label className="text-sm font-semibold">
                    Discovery visibility
                    <select
                      name="visibility"
                      defaultValue={state.profile?.visibility ?? "private"}
                      className={inputClass}
                    >
                      <option value="private">Private — not discoverable</option>
                      <option value="discoverable">
                        Discoverable — show safe Builder fields
                      </option>
                    </select>
                  </label>
                  <Button type="submit">Save Builder World Profile</Button>
                </form>
              </details>
            </aside>
          </section>

          {state.blocked.length ? (
            <details className="border-border bg-panel mt-7 rounded-2xl border p-5 sm:p-6">
              <summary className="text-navy cursor-pointer text-sm font-semibold">
                Blocked Builders · {state.blocked.length}
              </summary>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {state.blocked.map((builder) => (
                  <Surface
                    key={builder.userId}
                    className="flex items-center justify-between gap-4 p-4"
                  >
                    <div>
                      <p className="text-navy font-semibold">
                        {builder.preferredName}
                      </p>
                      <p className="text-muted text-xs">@{builder.username}</p>
                    </div>
                    <ActionForm
                      action="unblock"
                      targetUserId={builder.userId}
                      label="Unblock"
                    />
                  </Surface>
                ))}
              </div>
            </details>
          ) : null}
        </>
      )}
    </main>
  );
}
