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
      className={`mt-6 rounded-2xl border p-4 text-sm ${
        error
          ? "border-error/30 bg-error/10 text-error"
          : "border-success/30 bg-success/10 text-success"
      }`}
    >
      {error
        ? "That Connect action could not be completed. Review the details and try again."
        : status === "saved"
          ? "Your Builder Connect profile and privacy choice were saved."
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
    <Surface className="flex h-full flex-col p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-primary text-xs font-semibold tracking-wide uppercase">
            @{builder.username}
          </p>
          <h3 className="mt-2 text-xl font-semibold">
            {builder.preferredName}
          </h3>
        </div>
        <span className="border-border rounded-full border px-2.5 py-1 text-[0.68rem] font-semibold uppercase">
          {builder.relationship === "none" ? "Discover" : builder.relationship}
        </span>
      </div>
      <p className="text-muted mt-4 text-sm leading-6">
        {builder.missionStatement ??
          "Building evidence around a practical mission."}
      </p>
      <div className="mt-5 grid gap-3 text-sm">
        <p>
          <strong>Can help with:</strong>{" "}
          <span className="text-muted">
            {builder.canHelpWith || "Not stated yet"}
          </span>
        </p>
        <p>
          <strong>Needs help with:</strong>{" "}
          <span className="text-muted">
            {builder.needsHelpWith || "Not stated yet"}
          </span>
        </p>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {builder.capabilities.slice(0, 4).map((capability) => (
          <span
            key={capability}
            className="bg-primary-soft text-primary rounded-full px-2.5 py-1 text-xs font-semibold"
          >
            {capability}
          </span>
        ))}
      </div>
      <ButtonLink
        href={`/connect/builders/${builder.username}`}
        className="mt-6"
        variant="secondary"
      >
        View Builder
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
          className="font-semibold hover:underline"
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
            label="Cancel request"
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
    <Surface className="p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href={`/connect/builders/${item.username}`}
            className="text-xl font-semibold hover:underline"
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
      <div className="border-border mt-5 rounded-2xl border p-4 text-sm">
        <p className="font-semibold">Contact shared with you</p>
        <p className="text-muted mt-2">
          {(item.sharedEmail ?? item.sharedWhatsapp)
            ? [item.sharedEmail, item.sharedWhatsapp]
                .filter(Boolean)
                .join(" · ")
            : "No contact detail has been shared. Connection does not create messaging access."}
        </p>
      </div>
      <form action={shareContactAction} className="mt-5">
        <input type="hidden" name="connectionId" value={item.connectionId} />
        <input type="hidden" name="returnTo" value="/connect" />
        <fieldset>
          <legend className="text-sm font-semibold">
            Your explicit contact consent
          </legend>
          <div className="mt-3 flex flex-wrap gap-4 text-sm">
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
          className="mt-4 min-h-9 px-3 py-1.5 text-xs"
        >
          Update consent
        </Button>
      </form>
    </Surface>
  );
}

export default async function ConnectPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const [state, query] = await Promise.all([getConnectState(), searchParams]);

  return (
    <main
      id="main-content"
      className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-16"
    >
      <section className="border-gold/20 bg-panel relative overflow-hidden rounded-[2rem] border px-6 py-10 sm:px-10 sm:py-14">
        <p className="text-gold font-mono text-xs tracking-[0.2em] uppercase">
          Builder Connect
        </p>
        <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight sm:text-6xl">
          Find trusted Builders around complementary missions.
        </h1>
        <p className="text-muted mt-5 max-w-3xl text-lg leading-8">
          Discovery is opt-in. Connection requests contain no private message,
          and contact details stay hidden until an accepted connection
          deliberately shares them.
        </p>
      </section>
      <Notice status={query.status} />

      {!state.eligible ? (
        <Surface className="border-gold/30 bg-gold/5 mt-8 p-6 sm:p-8">
          <p className="text-gold text-xs font-semibold tracking-wide uppercase">
            Safeguarding boundary
          </p>
          <h2 className="mt-3 text-2xl font-semibold">
            Builder Connect is adult-only in this MVP.
          </h2>
          <p className="text-muted mt-3 max-w-3xl leading-7">
            Younger Builders keep their complete private PipuPath journey.
            Public discovery and direct contact sharing require a dedicated
            guardian and institutional safeguarding system, so PipuPath does not
            reduce that protection to a checkbox.
          </p>
          <ButtonLink href="/journey" className="mt-6">
            Continue Private Journey
          </ButtonLink>
        </Surface>
      ) : (
        <>
          <section className="mt-10 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <Surface className="p-6 sm:p-8">
              <p className="text-primary text-xs font-semibold tracking-wide uppercase">
                Privacy and Builder profile
              </p>
              <h2 className="mt-3 text-2xl font-semibold">
                Control how other Builders discover you.
              </h2>
              <form
                action={saveConnectProfileAction}
                className="mt-6 grid gap-5"
              >
                <input type="hidden" name="returnTo" value="/connect" />
                <label className="text-sm font-semibold">
                  Interests{" "}
                  <span className="text-muted">(comma separated)</span>
                  <input
                    name="interests"
                    required
                    defaultValue={state.profile?.interests.join(", ") ?? ""}
                    className={inputClass}
                    placeholder="education, agriculture, technology"
                  />
                </label>
                <label className="text-sm font-semibold">
                  Capabilities{" "}
                  <span className="text-muted">(comma separated)</span>
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
                <div className="grid gap-4 sm:grid-cols-2">
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
                </div>
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
                <Button type="submit">Save Connect Profile</Button>
              </form>
            </Surface>

            <div>
              <div>
                <p className="text-gold text-xs font-semibold tracking-wide uppercase">
                  Discover Builders
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                  Complementary people, not popularity metrics.
                </h2>
              </div>
              {state.discover.length ? (
                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  {state.discover.map((builder) => (
                    <BuilderCardView key={builder.userId} builder={builder} />
                  ))}
                </div>
              ) : (
                <Surface className="mt-6 p-6">
                  <p className="text-muted leading-7">
                    No other adult Builder has enabled discoverability yet. Your
                    network remains private until people deliberately opt in.
                  </p>
                </Surface>
              )}
            </div>
          </section>

          <section className="mt-12">
            <p className="text-gold text-xs font-semibold tracking-wide uppercase">
              My Network
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              Requests, accepted connections and consent.
            </h2>
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <Surface className="p-6">
                <h3 className="text-xl font-semibold">Pending requests</h3>
                <ul className="mt-3">
                  {state.incoming.length ? (
                    state.incoming.map((item) => (
                      <RequestRow
                        key={item.connectionId}
                        item={item}
                        type="incoming"
                      />
                    ))
                  ) : (
                    <li className="text-muted py-4 text-sm">
                      No incoming requests.
                    </li>
                  )}
                </ul>
              </Surface>
              <Surface className="p-6">
                <h3 className="text-xl font-semibold">Sent requests</h3>
                <ul className="mt-3">
                  {state.sent.length ? (
                    state.sent.map((item) => (
                      <RequestRow
                        key={item.connectionId}
                        item={item}
                        type="sent"
                      />
                    ))
                  ) : (
                    <li className="text-muted py-4 text-sm">
                      No sent requests.
                    </li>
                  )}
                </ul>
              </Surface>
            </div>
            {state.connections.length ? (
              <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
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
              <Surface className="mt-6 p-6">
                <p className="text-muted">
                  Accepted connections will appear here. PipuPath has no
                  unrestricted private messaging.
                </p>
              </Surface>
            )}
          </section>

          {state.blocked.length ? (
            <section className="mt-12">
              <h2 className="text-2xl font-semibold">Blocked Builders</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {state.blocked.map((builder) => (
                  <Surface
                    key={builder.userId}
                    className="flex items-center justify-between gap-4 p-5"
                  >
                    <div>
                      <p className="font-semibold">{builder.preferredName}</p>
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
            </section>
          ) : null}
        </>
      )}
    </main>
  );
}
